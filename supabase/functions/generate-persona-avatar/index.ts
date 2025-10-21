import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { personaId } = await req.json();
    if (!personaId) {
      return new Response(JSON.stringify({ error: 'personaId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch persona details
    const { data: persona, error: personaError } = await supabaseClient
      .from('personas')
      .select('*, workspaces!inner(user_id)')
      .eq('id', personaId)
      .single();

    if (personaError || !persona) {
      console.error('Persona fetch error:', personaError);
      return new Response(JSON.stringify({ error: 'Persona not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify ownership
    if (persona.workspaces.user_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Not authorized to modify this persona' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build intelligent prompt
    const inferredGender = inferGender(persona.name);
    const traits = deriveTraits(persona.goals, persona.frustrations);
    const styleHints = deriveStyleFromRole(persona.role);

    const prompt = `Generate a professional, high-quality headshot portrait of a ${persona.age || '30'}-year-old ${inferredGender} professional working as a ${persona.role || 'professional'}. The person should appear ${traits}. ${styleHints} Style: modern business portrait, neutral light background, professional attire, warm natural lighting, photo-realistic, 4K quality, centered composition, confident expression.`;

    console.log('Generated prompt:', prompt);

    // Call Lovable AI Image Generation
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'Failed to generate avatar' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error('No image in AI response:', aiData);
      return new Response(JSON.stringify({ error: 'No image generated' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract base64 data
    const base64Match = imageUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      return new Response(JSON.stringify({ error: 'Invalid image format' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const [, extension, base64Data] = base64Match;
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    // Upload to Supabase Storage
    const fileName = `${personaId}.${extension}`;
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('persona-avatars')
      .upload(fileName, imageBuffer, {
        contentType: `image/${extension}`,
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(JSON.stringify({ error: 'Failed to save avatar' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseClient.storage
      .from('persona-avatars')
      .getPublicUrl(fileName);

    // Update persona with avatar URL
    const { error: updateError } = await supabaseClient
      .from('personas')
      .update({ avatar_url: publicUrl })
      .eq('id', personaId);

    if (updateError) {
      console.error('Persona update error:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update persona' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Avatar generated successfully:', publicUrl);

    return new Response(JSON.stringify({ avatar_url: publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-persona-avatar:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions
function inferGender(name: string): string {
  const malePrefixes = ['mr', 'dr', 'prof'];
  const femalePrefixes = ['ms', 'mrs', 'miss', 'dr', 'prof'];
  const maleNames = ['john', 'mike', 'david', 'james', 'robert', 'michael', 'william', 'richard', 'thomas', 'charles'];
  const femaleNames = ['sarah', 'emma', 'lisa', 'jennifer', 'jessica', 'ashley', 'emily', 'amanda', 'melissa', 'michelle'];
  
  const lowerName = name.toLowerCase();
  
  if (malePrefixes.some(p => lowerName.startsWith(p))) return 'male';
  if (femalePrefixes.some(p => lowerName.startsWith(p))) return 'female';
  if (maleNames.some(n => lowerName.includes(n))) return 'male';
  if (femaleNames.some(n => lowerName.includes(n))) return 'female';
  
  return 'professional person';
}

function deriveTraits(goals: string[] | null, frustrations: string[] | null): string {
  const traits: string[] = [];
  
  if (goals?.some(g => g.toLowerCase().includes('efficiency') || g.toLowerCase().includes('productivity'))) {
    traits.push('focused and determined');
  }
  if (goals?.some(g => g.toLowerCase().includes('team') || g.toLowerCase().includes('collaboration'))) {
    traits.push('approachable and collaborative');
  }
  if (frustrations?.some(f => f.toLowerCase().includes('time') || f.toLowerCase().includes('busy'))) {
    traits.push('busy professional');
  }
  if (frustrations?.some(f => f.toLowerCase().includes('complex') || f.toLowerCase().includes('difficult'))) {
    traits.push('analytical');
  }
  
  return traits.length > 0 ? traits.join(', ') : 'professional and confident';
}

function deriveStyleFromRole(role: string | null): string {
  if (!role) return 'Business casual attire.';
  
  const lowerRole = role.toLowerCase();
  
  if (lowerRole.includes('developer') || lowerRole.includes('engineer')) {
    return 'Tech-savvy professional, casual yet polished attire.';
  }
  if (lowerRole.includes('manager') || lowerRole.includes('director')) {
    return 'Business professional attire, leadership presence.';
  }
  if (lowerRole.includes('designer') || lowerRole.includes('creative')) {
    return 'Creative professional, stylish and modern attire.';
  }
  if (lowerRole.includes('executive') || lowerRole.includes('ceo')) {
    return 'Executive business attire, authoritative presence.';
  }
  
  return 'Business casual attire.';
}
