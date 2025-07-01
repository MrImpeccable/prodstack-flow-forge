
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export const generatePersonaWordDoc = async (persona: any): Promise<Blob> => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: `User Persona: ${persona.name}`,
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Age: `,
                bold: true,
              }),
              new TextRun({
                text: persona.age ? persona.age.toString() : 'Not specified',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Role: `,
                bold: true,
              }),
              new TextRun({
                text: persona.role || 'Not specified',
              }),
            ],
          }),
          new Paragraph({
            text: '',
          }),
          new Paragraph({
            text: 'Bio:',
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: persona.bio || 'No bio provided',
          }),
          new Paragraph({
            text: '',
          }),
          new Paragraph({
            text: 'Goals:',
            heading: HeadingLevel.HEADING_2,
          }),
          ...(persona.goals || []).map((goal: string) => 
            new Paragraph({
              text: `• ${goal}`,
            })
          ),
          new Paragraph({
            text: '',
          }),
          new Paragraph({
            text: 'Frustrations:',
            heading: HeadingLevel.HEADING_2,
          }),
          ...(persona.frustrations || []).map((frustration: string) => 
            new Paragraph({
              text: `• ${frustration}`,
            })
          ),
          new Paragraph({
            text: '',
          }),
          new Paragraph({
            text: 'Tools:',
            heading: HeadingLevel.HEADING_2,
          }),
          ...(persona.tools || []).map((tool: string) => 
            new Paragraph({
              text: `• ${tool}`,
            })
          ),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
};

export const generateDocumentWordDoc = async (title: string, content: string): Promise<Blob> => {
  // Split content into paragraphs and format properly
  const paragraphs = content.split('\n').filter(line => line.trim() !== '');
  
  const children = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({
      text: '',
    }),
  ];

  // Process each line and create appropriate paragraph types
  paragraphs.forEach(paragraph => {
    const trimmed = paragraph.trim();
    
    if (trimmed.startsWith('#')) {
      // Handle markdown-style headers
      const headerText = trimmed.replace(/^#+\s*/, '');
      const headerLevel = trimmed.startsWith('###') ? HeadingLevel.HEADING_3 : 
                         trimmed.startsWith('##') ? HeadingLevel.HEADING_2 : 
                         HeadingLevel.HEADING_1;
      
      children.push(new Paragraph({
        text: headerText,
        heading: headerLevel,
      }));
    } else if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
      // Handle bullet points
      children.push(new Paragraph({
        text: `• ${trimmed.substring(1).trim()}`,
      }));
    } else if (trimmed.length > 0) {
      // Regular paragraph
      children.push(new Paragraph({
        text: trimmed,
      }));
    }
    
    // Add spacing after paragraphs
    children.push(new Paragraph({ text: '' }));
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
};

export const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportPersonaToWord = async (persona: any) => {
  try {
    const blob = await generatePersonaWordDoc(persona);
    downloadFile(blob, `persona-${persona.name.replace(/\s+/g, '-').toLowerCase()}.docx`);
  } catch (error) {
    console.error('Error exporting persona to Word:', error);
    throw error;
  }
};

export const exportPersonaToPNG = (persona: any) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = 800;
  canvas.height = 600;

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Border
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // Title
  ctx.fillStyle = '#1f2937';
  ctx.font = 'bold 32px Arial';
  ctx.fillText('PERSONA CARD', 50, 80);

  // Name
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#dc2626';
  ctx.fillText(persona.name, 50, 130);

  // Role and Age
  ctx.font = '20px Arial';
  ctx.fillStyle = '#6b7280';
  ctx.fillText(`${persona.role || 'Role not specified'} | Age: ${persona.age || 'Not specified'}`, 50, 160);

  // Bio
  if (persona.bio) {
    ctx.font = '16px Arial';
    ctx.fillStyle = '#374151';
    const bioLines = persona.bio.match(/.{1,80}(\s|$)/g) || [persona.bio];
    bioLines.forEach((line: string, index: number) => {
      ctx.fillText(line.trim(), 50, 200 + (index * 20));
    });
  }

  // Goals
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#059669';
  ctx.fillText('Goals:', 50, 280);
  ctx.font = '16px Arial';
  ctx.fillStyle = '#374151';
  (persona.goals || []).slice(0, 4).forEach((goal: string, index: number) => {
    ctx.fillText(`• ${goal.substring(0, 60)}${goal.length > 60 ? '...' : ''}`, 70, 305 + (index * 20));
  });

  // Frustrations
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#dc2626';
  ctx.fillText('Frustrations:', 50, 410);
  ctx.font = '16px Arial';
  ctx.fillStyle = '#374151';
  (persona.frustrations || []).slice(0, 4).forEach((frustration: string, index: number) => {
    ctx.fillText(`• ${frustration.substring(0, 60)}${frustration.length > 60 ? '...' : ''}`, 70, 435 + (index * 20));
  });

  // Tools
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#7c3aed';
  ctx.fillText('Tools:', 50, 540);
  ctx.font = '16px Arial';
  ctx.fillStyle = '#374151';
  const toolsText = (persona.tools || []).join(', ');
  ctx.fillText(toolsText.substring(0, 80) + (toolsText.length > 80 ? '...' : ''), 70, 565);

  // Download the image
  canvas.toBlob((blob) => {
    if (blob) {
      downloadFile(blob, `persona-${persona.name.replace(/\s+/g, '-').toLowerCase()}.png`);
    }
  }, 'image/png');
};
