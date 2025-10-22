import { Persona } from '@/components/PersonaCard';
import { generatePersonaDescription } from './personaDescriptionGenerator';

// Color palette for pitch deck cards
const PITCH_DECK_COLORS = [
  { name: 'Soft Beige', value: '#F5F1E8' },
  { name: 'Warm Yellow', value: '#FFF9E6' },
  { name: 'Clean Gray', value: '#F3F4F6' },
  { name: 'Gentle Peach', value: '#FFE8DC' },
  { name: 'Light Blue', value: '#E8F4FF' },
  { name: 'Mint Green', value: '#E8F9F0' },
];

// Role to emoji mapping
const ROLE_EMOJI_MAP: Record<string, { male: string; female: string }> = {
  'product manager': { male: '👨‍💼', female: '👩‍💼' },
  'project manager': { male: '👨‍💼', female: '👩‍💼' },
  'developer': { male: '👨‍💻', female: '👩‍💻' },
  'engineer': { male: '👨‍🔧', female: '👩‍🔧' },
  'designer': { male: '👨‍🎨', female: '👩‍🎨' },
  'student': { male: '👨‍🎓', female: '👩‍🎓' },
  'teacher': { male: '👨‍🏫', female: '👩‍🏫' },
  'entrepreneur': { male: '👨‍💼', female: '👩‍💼' },
  'marketing': { male: '👨‍💼', female: '👩‍💼' },
  'sales': { male: '👨‍💼', female: '👩‍💼' },
  'researcher': { male: '👨‍🔬', female: '👩‍🔬' },
  'doctor': { male: '👨‍⚕️', female: '👩‍⚕️' },
  'nurse': { male: '👨‍⚕️', female: '👩‍⚕️' },
  'chef': { male: '👨‍🍳', female: '👩‍🍳' },
  'artist': { male: '👨‍🎨', female: '👩‍🎨' },
  'writer': { male: '✍️', female: '✍️' },
  'default': { male: '👤', female: '👤' },
};

// Infer gender from name (simple heuristic)
function inferGender(name: string): 'male' | 'female' {
  const femaleSuffixes = ['a', 'e', 'ie', 'y', 'ia', 'ina', 'een', 'elle'];
  const lowerName = name.toLowerCase().trim();
  const firstName = lowerName.split(' ')[0];
  
  for (const suffix of femaleSuffixes) {
    if (firstName.endsWith(suffix)) {
      return 'female';
    }
  }
  
  return 'male';
}

// Get emoji for role
function getEmojiForRole(role: string, name: string): string {
  const gender = inferGender(name);
  const lowerRole = role.toLowerCase();
  
  for (const [key, emojis] of Object.entries(ROLE_EMOJI_MAP)) {
    if (lowerRole.includes(key)) {
      return emojis[gender];
    }
  }
  
  return ROLE_EMOJI_MAP.default[gender];
}

// Get background color based on index
function getBackgroundColor(index: number): string {
  return PITCH_DECK_COLORS[index % PITCH_DECK_COLORS.length].value;
}

// Export persona as pitch deck card
export async function exportPersonaAsPitchDeck(
  persona: Persona,
  colorIndex: number = 0,
  backgroundColor?: string
): Promise<void> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // High DPI for crisp output
  const scale = 2;
  const width = 600;
  const height = 700;
  
  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.scale(scale, scale);

  // Background
  const bgColor = backgroundColor || getBackgroundColor(colorIndex);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Get description and keywords
  const { description, keywords } = generatePersonaDescription(persona);
  
  // Get emoji
  const emoji = getEmojiForRole(persona.role || 'user', persona.name);

  // Draw emoji avatar
  ctx.font = '80px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(emoji, 40, 40);

  // Draw name (blue, bold)
  ctx.font = 'bold 36px Poppins, Inter, sans-serif';
  ctx.fillStyle = '#3B82F6'; // Blue
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(persona.name, 40, 150);

  // Draw description with keyword highlighting
  ctx.font = '18px Inter, Poppins, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  const maxWidth = width - 80;
  const lineHeight = 28;
  let y = 210;

  // Split description into words and highlight keywords
  const words = description.split(' ');
  let currentLine = '';
  let x = 40;

  words.forEach((word, index) => {
    const testLine = currentLine + word + ' ';
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine !== '') {
      // Draw current line
      drawLineWithHighlights(ctx, currentLine.trim(), x, y, keywords);
      currentLine = word + ' ';
      y += lineHeight;
    } else {
      currentLine = testLine;
    }
  });
  
  // Draw last line
  if (currentLine) {
    drawLineWithHighlights(ctx, currentLine.trim(), x, y, keywords);
  }

  // Draw branding
  ctx.font = '12px Inter, sans-serif';
  ctx.fillStyle = '#9CA3AF'; // Light gray
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('by ProdStack', width - 40, height - 40);

  // Export as PNG
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${persona.name.replace(/\s+/g, '-')}-pitch-deck.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, 'image/png');
}

// Helper function to draw text with keyword highlighting
function drawLineWithHighlights(
  ctx: CanvasRenderingContext2D,
  line: string,
  x: number,
  y: number,
  keywords: string[]
): void {
  const words = line.split(' ');
  let currentX = x;

  words.forEach((word, index) => {
    const isKeyword = keywords.some(keyword => 
      word.toLowerCase().includes(keyword.toLowerCase().replace(/[^\w\s]/g, ''))
    );

    if (isKeyword) {
      ctx.font = 'bold 18px Inter, Poppins, sans-serif';
      ctx.fillStyle = '#3B82F6'; // Blue for keywords
    } else {
      ctx.font = '18px Inter, Poppins, sans-serif';
      ctx.fillStyle = '#374151'; // Dark gray
    }

    ctx.fillText(word, currentX, y);
    currentX += ctx.measureText(word + ' ').width;
  });
}

// Generate preview canvas (returns data URL)
export async function generatePitchDeckPreview(
  persona: Persona,
  colorIndex: number = 0,
  backgroundColor?: string
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    const scale = 2;
    const width = 600;
    const height = 700;
    
    canvas.width = width * scale;
    canvas.height = height * scale;
    ctx.scale(scale, scale);

    const bgColor = backgroundColor || getBackgroundColor(colorIndex);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    const { description, keywords } = generatePersonaDescription(persona);
    const emoji = getEmojiForRole(persona.role || 'user', persona.name);

    ctx.font = '80px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(emoji, 40, 40);

    ctx.font = 'bold 36px Poppins, Inter, sans-serif';
    ctx.fillStyle = '#3B82F6';
    ctx.fillText(persona.name, 40, 150);

    ctx.font = '18px Inter, Poppins, sans-serif';
    const maxWidth = width - 80;
    const lineHeight = 28;
    let y = 210;

    const words = description.split(' ');
    let currentLine = '';
    let x = 40;

    words.forEach((word) => {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine !== '') {
        drawLineWithHighlights(ctx, currentLine.trim(), x, y, keywords);
        currentLine = word + ' ';
        y += lineHeight;
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) {
      drawLineWithHighlights(ctx, currentLine.trim(), x, y, keywords);
    }

    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#9CA3AF';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('by ProdStack', width - 40, height - 40);

    resolve(canvas.toDataURL('image/png'));
  });
}

export { PITCH_DECK_COLORS, getBackgroundColor };
