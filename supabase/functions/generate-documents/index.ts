
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

    let systemPrompt = '';
    let userPrompt = '';

    if (documentType === 'prd') {
      systemPrompt = 'You are a professional Product Manager who creates comprehensive Product Requirements Documents (PRDs). Create a well-structured PRD with sections for Overview, Problem Statement, Solution, User Stories, Acceptance Criteria, and Technical Considerations.';
      
      userPrompt = `Create a Product Requirements Document based on the following information:

PERSONAS:
${personas.map((p: any) => `
- Name: ${p.name}
- Role: ${p.role}
- Goals: ${p.goals.join(', ')}
- Frustrations: ${p.frustrations.join(', ')}
- Tools: ${p.tools.join(', ')}
`).join('\n')}

${canvas ? `
PROBLEM SPACE CANVAS:
- Pain Points: ${canvas.pain_points?.join(', ') || 'None specified'}
- Current Behaviors: ${canvas.current_behaviors?.join(', ') || 'None specified'}
- Opportunities: ${canvas.opportunities?.join(', ') || 'None specified'}
` : ''}

Please create a comprehensive PRD that addresses the personas' needs and the identified problems/opportunities.`;
    } else if (documentType === 'user_stories') {
      systemPrompt = 'You are a professional Product Manager who creates clear, actionable user stories following the "As a [user], I want [action], so that [benefit]" format. Focus on creating stories that are testable and implementable.';
      
      userPrompt = `Create user stories based on the following information:

PERSONAS:
${personas.map((p: any) => `
- Name: ${p.name}
- Role: ${p.role}
- Goals: ${p.goals.join(', ')}
- Frustrations: ${p.frustrations.join(', ')}
`).join('\n')}

${canvas ? `
PROBLEM SPACE CANVAS:
- Pain Points: ${canvas.pain_points?.join(', ') || 'None specified'}
- Opportunities: ${canvas.opportunities?.join(', ') || 'None specified'}
` : ''}

Create 8-12 user stories that address the personas' goals and frustrations. Each story should follow the format: "As a [persona], I want [action], so that [benefit]" and include acceptance criteria.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-documents function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
