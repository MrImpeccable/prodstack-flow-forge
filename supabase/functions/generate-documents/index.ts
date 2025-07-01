
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentType, personas, canvas } = await req.json();

    console.log('Generate documents request:', { documentType, personas: personas?.length, canvas: canvas?.name });

    // Enhanced validation
    if (!documentType) {
      return new Response(JSON.stringify({ 
        error: 'Document type is required',
        content: 'Please specify a document type (prd or user_stories)'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!personas || personas.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'At least one persona is required',
        content: 'Please create at least one persona before generating documents'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate that personas have meaningful data
    const validPersonas = personas.filter((p: any) => 
      p.name && p.name.trim() && 
      (p.goals?.length > 0 || p.frustrations?.length > 0 || p.role)
    );

    if (validPersonas.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Personas need more details',
        content: 'Please add names, roles, goals, or frustrations to your personas before generating documents'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!openAIApiKey) {
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        content: 'The OpenAI API key needs to be configured to generate documents. Please contact the administrator.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (documentType === 'prd') {
      systemPrompt = 'You are a professional Product Manager who creates comprehensive Product Requirements Documents (PRDs). Create a well-structured PRD with sections for Overview, Problem Statement, Solution, User Stories, Acceptance Criteria, and Technical Considerations. Use markdown formatting for better readability.';
      
      userPrompt = `Create a Product Requirements Document based on the following information:

PERSONAS:
${validPersonas.map((p: any) => `
- **Name**: ${p.name || 'Unnamed Persona'}
- **Role**: ${p.role || 'Not specified'}
- **Goals**: ${p.goals?.join(', ') || 'None specified'}
- **Frustrations**: ${p.frustrations?.join(', ') || 'None specified'}
- **Tools**: ${p.tools?.join(', ') || 'None specified'}
- **Bio**: ${p.bio || 'No bio provided'}
`).join('\n')}

${canvas ? `
PROBLEM SPACE CANVAS:
- **Pain Points**: ${canvas.pain_points?.join(', ') || 'None specified'}
- **Current Behaviors**: ${canvas.current_behaviors?.join(', ') || 'None specified'}
- **Opportunities**: ${canvas.opportunities?.join(', ') || 'None specified'}
` : 'No problem canvas data available.'}

Please create a comprehensive PRD that addresses the personas' needs and the identified problems/opportunities. Structure it with clear sections and use markdown formatting.`;
    } else if (documentType === 'user_stories') {
      systemPrompt = 'You are a professional Product Manager who creates clear, actionable user stories following the "As a [user], I want [action], so that [benefit]" format. Focus on creating stories that are testable and implementable. Format the response with markdown for better readability.';
      
      userPrompt = `Create user stories based on the following information:

PERSONAS:
${validPersonas.map((p: any) => `
- **Name**: ${p.name || 'Unnamed Persona'}
- **Role**: ${p.role || 'Not specified'}
- **Goals**: ${p.goals?.join(', ') || 'None specified'}
- **Frustrations**: ${p.frustrations?.join(', ') || 'None specified'}
- **Bio**: ${p.bio || 'No bio provided'}
`).join('\n')}

${canvas ? `
PROBLEM SPACE CANVAS:
- **Pain Points**: ${canvas.pain_points?.join(', ') || 'None specified'}
- **Opportunities**: ${canvas.opportunities?.join(', ') || 'None specified'}
` : 'No problem canvas data available.'}

Create 8-12 user stories that address the personas' goals and frustrations. Each story should follow the format: "As a [persona], I want [action], so that [benefit]" and include acceptance criteria. Use markdown formatting with headers and bullet points.`;
    } else {
      return new Response(JSON.stringify({ 
        error: 'Invalid document type',
        content: 'Please specify either "prd" or "user_stories" as the document type'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Making OpenAI API request with GPT-4...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      return new Response(JSON.stringify({ 
        error: `OpenAI API error: ${response.status}`,
        content: 'There was an error generating the document. Please try again later. If the problem persists, try simplifying your personas or canvas data.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No response from OpenAI API',
        content: 'The AI service did not return a response. Please try again with different input data.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      return new Response(JSON.stringify({ 
        error: 'Empty response from OpenAI API',
        content: 'The AI service returned an empty response. Please try again with more detailed persona information.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Successfully generated content with GPT-4');

    return new Response(JSON.stringify({ 
      content,
      success: true,
      message: 'Document generated successfully'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-documents function:', error);
    return new Response(JSON.stringify({ 
      error: 'Unexpected error occurred',
      content: 'An unexpected error occurred while generating the document. Please check your input data and try again.',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
