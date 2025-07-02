
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

    // Prepare context for Gemini AI
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

    // Check for Gemini API key and add logging
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    console.log('API Key Check:');
    console.log('- Gemini API Key exists:', !!geminiApiKey);
    console.log('- Key length:', geminiApiKey ? geminiApiKey.length : 0);
    
    if (!geminiApiKey) {
      console.error('Gemini API key is missing from environment variables');
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let prompt = '';
    let title = '';

    if (documentType === 'prd') {
      title = `PRD for ${workspace.name}`;
      prompt = `You are a senior product manager creating professional product documentation. Create a comprehensive Product Requirements Document (PRD) based on the following context:\n\n${context}\n\nThe PRD should include:\n1. Executive Summary\n2. Problem Statement\n3. Target Users\n4. Product Goals\n5. Features and Requirements\n6. Success Metrics\n7. Timeline and Milestones\n\nMake it professional and detailed.`;
    } else if (documentType === 'user_story') {
      title = `User Stories for ${workspace.name}`;
      prompt = `You are a senior product manager creating professional product documentation. Create detailed user stories based on the following context:\n\n${context}\n\nFor each persona, create 3-5 user stories in the format:\n"As a [persona], I want [goal] so that [benefit]"\n\nInclude acceptance criteria for each story and organize by persona.`;
    }

    console.log('Making request to Gemini API...');
    console.log('Document Type:', documentType);
    console.log('Workspace:', workspace.name);

    try {
      // Make request to Gemini API
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4000,
          }
        }),
      });

      if (!geminiResponse.ok) {
        const errorData = await geminiResponse.json().catch(() => ({}));
        console.error('Gemini API error:', errorData);
        console.error('Response status:', geminiResponse.status);
        console.error('Response statusText:', geminiResponse.statusText);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to generate document. Please try again later.',
            details: errorData.error?.message || `Gemini API error: ${geminiResponse.status}`
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const geminiData = await geminiResponse.json();
      console.log('Gemini API response received');
      
      // Extract content from Gemini response
      const content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        console.error('No content generated from Gemini API');
        console.error('Gemini response:', JSON.stringify(geminiData, null, 2));
        return new Response(
          JSON.stringify({ error: 'No content generated from Gemini AI' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Content generated successfully, length:', content.length);

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

      console.log('Document saved successfully with ID:', document.id);

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

    } catch (geminiError) {
      console.error('Gemini request failed:', geminiError);
      console.error('Error details:', geminiError.message);
      return new Response(
        JSON.stringify({ 
          error: 'Gemini AI service is currently unavailable. Please try again later.',
          details: geminiError.message
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
