
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
