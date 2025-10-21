interface Persona {
  id?: string;
  name: string;
  avatar_url?: string;
  age?: number;
  role?: string;
  goals?: string[];
  frustrations?: string[];
  tools?: string[];
  bio?: string;
}

// Brand colors
const COLORS = {
  white: '#FFFFFF',
  black: '#1A1A1A',
  red: '#D63A3A',
  green: '#10B981',
  blue: '#3B82F6',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
};

export async function exportPersonaAsModernPNG(persona: Persona): Promise<void> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  // High-res canvas
  canvas.width = 1200;
  canvas.height = 1600;

  // Background
  ctx.fillStyle = COLORS.white;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Load fonts
  await loadFonts();

  let yPos = 60;
  const leftMargin = 60;
  const rightMargin = canvas.width - 60;
  const avatarSize = 200;

  // Draw Avatar
  if (persona.avatar_url) {
    try {
      const avatarImg = await loadImage(persona.avatar_url);
      drawCircularImage(ctx, avatarImg, leftMargin, yPos, avatarSize);
    } catch (error) {
      console.warn('Failed to load avatar, using initials:', error);
      drawInitialsCircle(ctx, persona.name, leftMargin, yPos, avatarSize);
    }
  } else {
    drawInitialsCircle(ctx, persona.name, leftMargin, yPos, avatarSize);
  }

  // ProdStack branding (top right)
  ctx.fillStyle = COLORS.red;
  ctx.font = 'bold 24px Poppins, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('PRODSTACK', rightMargin, 80);
  
  ctx.fillStyle = COLORS.gray;
  ctx.font = '18px Inter, sans-serif';
  ctx.fillText('Persona Profile', rightMargin, 110);

  yPos += avatarSize + 40;

  // Name
  ctx.fillStyle = COLORS.black;
  ctx.font = 'bold 48px Poppins, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(persona.name, leftMargin, yPos);
  yPos += 50;

  // Role and Age
  if (persona.role || persona.age) {
    ctx.fillStyle = COLORS.gray;
    ctx.font = '24px Inter, sans-serif';
    const subtitle = [persona.role, persona.age ? `${persona.age} years old` : '']
      .filter(Boolean)
      .join(' • ');
    ctx.fillText(subtitle, leftMargin, yPos);
    yPos += 60;
  }

  // Red divider line
  ctx.strokeStyle = COLORS.red;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(leftMargin, yPos);
  ctx.lineTo(rightMargin, yPos);
  ctx.stroke();
  yPos += 50;

  // Bio Section
  if (persona.bio) {
    yPos = drawSection(ctx, 'BIO', [persona.bio], leftMargin, rightMargin, yPos, COLORS.black);
    yPos += 40;
  }

  // Goals Section
  if (persona.goals && persona.goals.length > 0) {
    yPos = drawSection(ctx, 'GOALS', persona.goals, leftMargin, rightMargin, yPos, COLORS.green, '•');
    yPos += 40;
  }

  // Frustrations Section
  if (persona.frustrations && persona.frustrations.length > 0) {
    yPos = drawSection(ctx, 'FRUSTRATIONS', persona.frustrations, leftMargin, rightMargin, yPos, COLORS.red, '✗');
    yPos += 40;
  }

  // Tools Section
  if (persona.tools && persona.tools.length > 0) {
    yPos = drawToolsSection(ctx, persona.tools, leftMargin, rightMargin, yPos);
  }

  // Download
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `persona-${persona.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}

function drawSection(
  ctx: CanvasRenderingContext2D,
  title: string,
  items: string[],
  leftMargin: number,
  rightMargin: number,
  yPos: number,
  bulletColor: string,
  bullet: string = ''
): number {
  // Section title
  ctx.fillStyle = COLORS.black;
  ctx.font = 'bold 28px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(title, leftMargin, yPos);
  yPos += 10;

  // Red underline
  ctx.strokeStyle = COLORS.red;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(leftMargin, yPos);
  ctx.lineTo(leftMargin + 100, yPos);
  ctx.stroke();
  yPos += 30;

  // Items
  ctx.font = '22px Inter, sans-serif';
  const maxWidth = rightMargin - leftMargin - 40;

  items.forEach((item) => {
    const lines = wrapText(ctx, item, maxWidth);
    lines.forEach((line, idx) => {
      if (idx === 0 && bullet) {
        ctx.fillStyle = bulletColor;
        ctx.fillText(bullet, leftMargin, yPos);
        ctx.fillStyle = COLORS.black;
        ctx.fillText(line, leftMargin + 30, yPos);
      } else {
        ctx.fillStyle = COLORS.black;
        ctx.fillText(line, bullet ? leftMargin + 30 : leftMargin, yPos);
      }
      yPos += 32;
    });
    yPos += 8;
  });

  return yPos;
}

function drawToolsSection(
  ctx: CanvasRenderingContext2D,
  tools: string[],
  leftMargin: number,
  rightMargin: number,
  yPos: number
): number {
  // Section title
  ctx.fillStyle = COLORS.black;
  ctx.font = 'bold 28px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('TOOLS & TECHNOLOGIES', leftMargin, yPos);
  yPos += 10;

  // Red underline
  ctx.strokeStyle = COLORS.red;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(leftMargin, yPos);
  ctx.lineTo(leftMargin + 100, yPos);
  ctx.stroke();
  yPos += 40;

  // Draw tool badges
  ctx.font = '20px Inter, sans-serif';
  let xPos = leftMargin;
  const badgeHeight = 36;
  const badgePadding = 16;
  const badgeSpacing = 12;
  const maxWidth = rightMargin - leftMargin;

  tools.forEach((tool) => {
    const textWidth = ctx.measureText(tool).width;
    const badgeWidth = textWidth + badgePadding * 2;

    if (xPos + badgeWidth > leftMargin + maxWidth) {
      xPos = leftMargin;
      yPos += badgeHeight + badgeSpacing;
    }

    // Badge background
    ctx.fillStyle = COLORS.blue;
    roundRect(ctx, xPos, yPos - 26, badgeWidth, badgeHeight, 8);
    ctx.fill();

    // Badge text
    ctx.fillStyle = COLORS.white;
    ctx.textAlign = 'left';
    ctx.fillText(tool, xPos + badgePadding, yPos);

    xPos += badgeWidth + badgeSpacing;
  });

  return yPos + 50;
}

function drawCircularImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  size: number
): void {
  ctx.save();
  
  // Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;

  // Clip to circle
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // Draw image
  ctx.drawImage(img, x, y, size, size);

  ctx.restore();

  // Border
  ctx.strokeStyle = COLORS.lightGray;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.stroke();
}

function drawInitialsCircle(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  size: number
): void {
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  ctx.save();

  // Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;

  // Circle background
  ctx.fillStyle = COLORS.red;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Initials text
  ctx.fillStyle = COLORS.white;
  ctx.font = `bold ${size / 2.5}px Poppins, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, x + size / 2, y + size / 2);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

async function loadFonts(): Promise<void> {
  try {
    await document.fonts.load('400 16px Inter');
    await document.fonts.load('700 16px Inter');
    await document.fonts.load('400 16px Poppins');
    await document.fonts.load('700 16px Poppins');
  } catch (error) {
    console.warn('Failed to load fonts:', error);
  }
}
