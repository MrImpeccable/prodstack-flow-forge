
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

    // Prepare context for OpenAI
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

    // Generate content using OpenAI
    const openaiApiKey = Deno.env.get('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');
    
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let prompt = '';
    let title = '';

    if (documentType === 'prd') {
      title = `PRD for ${workspace.name}`;
      prompt = `Create a comprehensive Product Requirements Document (PRD) based on the following context:\n\n${context}\n\nThe PRD should include:\n1. Executive Summary\n2. Problem Statement\n3. Target Users\n4. Product Goals\n5. Features and Requirements\n6. Success Metrics\n7. Timeline and Milestones\n\nMake it professional and detailed.`;
    } else if (documentType === 'user_story') {
      title = `User Stories for ${workspace.name}`;
      prompt = `Create detailed user stories based on the following context:\n\n${context}\n\nFor each persona, create 3-5 user stories in the format:\n"As a [persona], I want [goal] so that [benefit]"\n\nInclude acceptance criteria for each story and organize by persona.`;
    }

    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a senior product manager creating professional product documentation. Be thorough, specific, and actionable.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 4000,
          temperature: 0.7,
        }),
      });

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json().catch(() => ({}));
        console.error('OpenAI API error:', errorData);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to generate document. Please try again later.',
            details: errorData.error?.message || 'Unknown OpenAI error'
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const openaiData = await openaiResponse.json();
      const content = openaiData.choices?.[0]?.message?.content;

      if (!content) {
        return new Response(
          JSON.stringify({ error: 'No content generated from OpenAI' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Save the generated document
      const { data: document, error: saveError } = await supabaseClient
        .from('generated_documents')
        .insert([{
          workspace_id: workspaceId,
          document_type: documentType,
          title: title,
          content: content,
          source_personas: selectedPersonas || [],
          source_canvas: selectedCanvas || null,
        }])
        .select()
        .single();

      if (saveError) {
        console.error('Error saving document:', saveError);
        return new Response(
          JSON.stringify({ error: 'Failed to save generated document' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          document: {
            id: document.id,
            title: document.title,
            content: document.content,
            document_type: document.document_type,
            created_at: document.created_at
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (openaiError) {
      console.error('OpenAI request failed:', openaiError);
      return new Response(
        JSON.stringify({ 
          error: 'AI service is currently unavailable. Please try again later.',
          details: openaiError.message
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
