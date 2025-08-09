// Memory Builder Template Definitions

export interface TemplatePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EmojiPosition {
  x: number;
  y: number;
  size: number;
}

export interface TextPosition {
  x: number;
  y: number;
  maxWidth: number;
  height: number;
  growDirection: 'left' | 'right' | 'center';
}

export interface MemoryTemplate {
  id: string;
  name: string;
  displayName: string;
  type: 'tall' | 'wide';
  dimensions: {
    width: number;
    height: number;
  };
  previewImage: string; // Emoji for template selection
  templateImageUrl: string; // Path to actual template image file
  maxThumbnails: number;
  maxEmojis: number;
  maxTextObjects: number;
  
  // Template positions
  mainPhoto: TemplatePosition;
  thumbnails: TemplatePosition[];
  emojiPositions: EmojiPosition[];
  textPositions: TextPosition[];
  
  // Background styling
  backgroundColor: string;
  borderRadius: number;
}

// Trifold A Template - Test Implementation
export const TRIFOLD_A: MemoryTemplate = {
  id: 'trifold-a',
  name: 'Trifold A',
  displayName: 'Trifold A',
  type: 'tall',
  dimensions: {
    width: 640,
    height: 574
  },
  previewImage: '📸',
  templateImageUrl: '/memory_mashup_templates/mmu_template_trifoldA.png',
  maxThumbnails: 2,
  maxEmojis: 4,
  maxTextObjects: 2,
  
  // Main photo (center, i1)
  mainPhoto: {
    x: 160,
    y: 60,
    width: 320,
    height: 400
  },
  
  // Thumbnail positions (i2 left, i3 right)
  thumbnails: [
    { x: 40, y: 120, width: 100, height: 300 }, // i2 - left
    { x: 500, y: 120, width: 100, height: 300 }  // i3 - right
  ],
  
  // Emoji positions (e1-e4)
  emojiPositions: [
    { x: 60, y: 80, size: 32 },   // e1 - top left
    { x: 60, y: 280, size: 32 },  // e2 - middle left
    { x: 550, y: 400, size: 32 }, // e3 - bottom right
    { x: 550, y: 80, size: 32 }   // e4 - top right
  ],
  
  // Text pill positions (t1, t2)
  textPositions: [
    { 
      x: 200, 
      y: 30, 
      maxWidth: 240, 
      height: 32, 
      growDirection: 'center' 
    }, // t1 - top horizontal
    { 
      x: 200, 
      y: 480, 
      maxWidth: 240, 
      height: 32, 
      growDirection: 'center' 
    }  // t2 - bottom horizontal
  ],
  
  backgroundColor: '#9ACD32', // Light green background
  borderRadius: 20
};

// Template collection
export const MEMORY_TEMPLATES: MemoryTemplate[] = [
  TRIFOLD_A
];

// Helper function to get template by ID
export function getTemplateById(id: string): MemoryTemplate | undefined {
  return MEMORY_TEMPLATES.find(template => template.id === id);
}

// Helper function to get templates by type
export function getTemplatesByType(type: 'tall' | 'wide'): MemoryTemplate[] {
  return MEMORY_TEMPLATES.filter(template => template.type === type);
}
