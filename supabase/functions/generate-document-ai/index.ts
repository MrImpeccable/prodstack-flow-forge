import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { workspaceId, documentType, selectedPersonas, selectedCanvas } = await req.json();

    if (!workspaceId || !documentType) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate workspace ownership
    const { data: workspace, error: workspaceError } = await supabaseClient
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (workspaceError || !workspace) {
      return new Response(
        JSON.stringify({ error: 'Workspace not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch and validate personas
    let personas = [];
    if (selectedPersonas && selectedPersonas.length > 0) {
      const { data: personaData, error: personaError } = await supabaseClient
        .from('personas')
        .select('*')
        .eq('workspace_id', workspaceId)
        .in('id', selectedPersonas);

      if (personaError) {
        console.error('Error fetching personas:', personaError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch personas' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!personaData || personaData.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No valid personas found. Please create personas first.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      personas = personaData;
    }

    // Fetch and validate canvas
    let canvas = null;
    if (selectedCanvas) {
      const { data: canvasData, error: canvasError } = await supabaseClient
        .from('problem_canvases')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('id', selectedCanvas)
        .single();

      if (canvasError) {
        console.error('Error fetching canvas:', canvasError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch problem canvas' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!canvasData) {
        return new Response(
          JSON.stringify({ error: 'Problem canvas not found. Please create a problem canvas first.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      canvas = canvasData;
    }

    // Validate that we have required data
    if (documentType === 'prd' && (!personas.length && !canvas)) {
      return new Response(
        JSON.stringify({ error: 'PRD generation requires at least one persona or problem canvas' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (documentType === 'user_story' && !personas.length) {
      return new Response(
        JSON.stringify({ error: 'User story generation requires at least one persona' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build context for AI
    let context = `Workspace: ${workspace.name}\n`;
    if (workspace.description) {
      context += `Description: ${workspace.description}\n`;
    }

    if (personas.length > 0) {
      context += "\nUser Personas:\n";
      personas.forEach((persona: any) => {
        context += `- ${persona.name}`;
        if (persona.role) context += ` (${persona.role})`;
        if (persona.age) context += `, Age: ${persona.age}`;
        context += '\n';
        if (persona.bio) context += `  Bio: ${persona.bio}\n`;
        if (persona.goals?.length) context += `  Goals: ${persona.goals.join(', ')}\n`;
        if (persona.frustrations?.length) context += `  Frustrations: ${persona.frustrations.join(', ')}\n`;
        if (persona.tools?.length) context += `  Tools: ${persona.tools.join(', ')}\n`;
        context += '\n';
      });
    }

    if (canvas) {
      context += "\nProblem Canvas:\n";
      context += `Name: ${canvas.name}\n`;
      if (canvas.pain_points?.length) context += `Pain Points: ${canvas.pain_points.join(', ')}\n`;
      if (canvas.current_behaviors?.length) context += `Current Behaviors: ${canvas.current_behaviors.join(', ')}\n`;
      if (canvas.opportunities?.length) context += `Opportunities: ${canvas.opportunities.join(', ')}\n`;
    }

    // Get Lovable API Key
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare prompts
    let systemPrompt = 'You are a senior product manager creating professional product documentation.';
    let userPrompt = '';
    let title = '';

    if (documentType === 'prd') {
      title = `PRD for ${workspace.name}`;
      userPrompt = `Create a comprehensive Product Requirements Document (PRD) based on the following context:\n\n${context}\n\nThe PRD should include:\n1. Executive Summary\n2. Problem Statement\n3. Target Users\n4. Product Goals\n5. Features and Requirements\n6. Success Metrics\n7. Timeline and Milestones\n\nMake it professional, detailed, and well-structured with clear sections.`;
    } else if (documentType === 'user_story') {
      title = `User Stories for ${workspace.name}`;
      userPrompt = `Create detailed user stories based on the following context:\n\n${context}\n\nFor each persona, create 3-5 user stories in the format:\n"As a [persona], I want [goal] so that [benefit]"\n\nInclude:\n- Acceptance criteria for each story\n- Priority level (High/Medium/Low)\n- Estimated effort (Small/Medium/Large)\n\nOrganize by persona and make them actionable.`;
    }

    console.log('Calling Lovable AI Gateway...');
    console.log('Document Type:', documentType);
    console.log('Workspace:', workspace.name);

    try {
      // Call Lovable AI Gateway with streaming
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          stream: true,
        }),
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json().catch(() => ({}));
        console.error('AI Gateway error:', errorData);
        console.error('Response status:', aiResponse.status);

        // Handle specific error cases
        if (aiResponse.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Too many requests. Please try again in a moment.', code: 'RATE_LIMIT' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (aiResponse.status === 402) {
          return new Response(
            JSON.stringify({ error: 'AI usage limit reached. Please check your workspace credits.', code: 'PAYMENT_REQUIRED' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ 
            error: 'Couldn\'t generate document. Please try again.',
            details: errorData.error?.message || `AI Gateway error: ${aiResponse.status}`
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Stream the response back to the client
      console.log('Streaming AI response...');
      const stream = new ReadableStream({
        async start(controller) {
          const reader = aiResponse.body?.getReader();
          const decoder = new TextDecoder();
          let fullContent = '';

          if (!reader) {
            controller.close();
            return;
          }

          try {
            while (true) {
              const { done, value } = await reader.read();
              
              if (done) {
                // Save the complete document to database
                console.log('Stream complete, saving document...');
                const { data: document, error: saveError } = await supabaseClient
                  .from('generated_documents')
                  .insert([{
                    workspace_id: workspaceId,
                    document_type: documentType,
                    title: title,
                    content: fullContent,
                    source_personas: selectedPersonas || [],
                    source_canvas: selectedCanvas || null,
                  }])
                  .select()
                  .single();

                if (saveError) {
                  console.error('Error saving document:', saveError);
                } else {
                  console.log('Document saved successfully with ID:', document.id);
                }

                // Send final event
                controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                controller.close();
                break;
              }

              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  
                  if (data === '[DONE]') {
                    continue;
                  }

                  try {
                    const parsed = JSON.parse(data);
                    const delta = parsed.choices?.[0]?.delta?.content;
                    
                    if (delta) {
                      fullContent += delta;
                      // Forward the chunk to the client
                      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: delta })}\n\n`));
                    }
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
            }
          } catch (error) {
            console.error('Streaming error:', error);
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });

    } catch (aiError) {
      console.error('AI request failed:', aiError);
      console.error('Error details:', aiError.message);
      return new Response(
        JSON.stringify({ 
          error: 'Couldn\'t generate document. Please try again.',
          details: aiError.message
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
