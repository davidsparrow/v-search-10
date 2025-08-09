import React from 'react';
import { MemoryTemplate } from '../../data/memoryTemplates';

interface TemplateRendererProps {
  template: MemoryTemplate;
  mainPhoto?: string;
  thumbnails?: string[];
  selectedEmojis?: string[];
  textObjects?: string[];
  scale?: number; // For responsive scaling
}

export function TemplateRenderer({
  template,
  mainPhoto,
  thumbnails = [],
  selectedEmojis = [],
  textObjects = [],
  scale = 1
}: TemplateRendererProps) {
  const scaledDimensions = {
    width: template.dimensions.width * scale,
    height: template.dimensions.height * scale
  };

  // Helper function to scale position
  const scalePosition = (pos: any) => ({
    ...pos,
    x: pos.x * scale,
    y: pos.y * scale,
    width: pos.width ? pos.width * scale : undefined,
    height: pos.height ? pos.height * scale : undefined,
    size: pos.size ? pos.size * scale : undefined,
    maxWidth: pos.maxWidth ? pos.maxWidth * scale : undefined
  });

  return (
    <div
      style={{
        position: 'relative',
        width: scaledDimensions.width,
        height: scaledDimensions.height,
        backgroundColor: template.backgroundColor,
        borderRadius: template.borderRadius * scale,
        overflow: 'hidden',
        margin: '0 auto'
      }}
    >
      {/* Main Photo */}
      {mainPhoto && (
        <div
          style={{
            position: 'absolute',
            ...scalePosition(template.mainPhoto),
            borderRadius: 16 * scale,
            overflow: 'hidden',
            backgroundColor: '#f0f0f0'
          }}
        >
          <img
            src={mainPhoto}
            alt="Main photo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
      )}

      {/* Placeholder for main photo if not provided */}
      {!mainPhoto && (
        <div
          style={{
            position: 'absolute',
            ...scalePosition(template.mainPhoto),
            borderRadius: 16 * scale,
            backgroundColor: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px dashed #999`,
            color: '#666',
            fontSize: 16 * scale,
            fontWeight: 'bold'
          }}
        >
          i1
        </div>
      )}

      {/* Thumbnail Photos */}
      {template.thumbnails.map((thumbPos, index) => {
        const thumbPhoto = thumbnails[index];
        const scaledPos = scalePosition(thumbPos);
        
        return (
          <div
            key={`thumb-${index}`}
            style={{
              position: 'absolute',
              ...scaledPos,
              borderRadius: 12 * scale,
              overflow: 'hidden',
              backgroundColor: thumbPhoto ? '#f0f0f0' : '#e0e0e0'
            }}
          >
            {thumbPhoto ? (
              <img
                src={thumbPhoto}
                alt={`Thumbnail ${index + 2}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px dashed #999`,
                  color: '#666',
                  fontSize: 14 * scale,
                  fontWeight: 'bold'
                }}
              >
                i{index + 2}
              </div>
            )}
          </div>
        );
      })}

      {/* Emoji Positions */}
      {template.emojiPositions.map((emojiPos, index) => {
        const emoji = selectedEmojis[index];
        const scaledPos = scalePosition(emojiPos);
        
        return (
          <div
            key={`emoji-${index}`}
            style={{
              position: 'absolute',
              left: scaledPos.x,
              top: scaledPos.y,
              width: scaledPos.size,
              height: scaledPos.size,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: scaledPos.size * 0.8,
              backgroundColor: emoji ? 'transparent' : 'rgba(255, 0, 255, 0.7)',
              borderRadius: '50%',
              color: emoji ? 'inherit' : 'white',
              fontWeight: 'bold',
              border: emoji ? 'none' : '2px solid #ff00ff'
            }}
          >
            {emoji || `e${index + 1}`}
          </div>
        );
      })}

      {/* Text Positions */}
      {template.textPositions.map((textPos, index) => {
        const text = textObjects[index];
        const scaledPos = scalePosition(textPos);
        
        return (
          <div
            key={`text-${index}`}
            style={{
              position: 'absolute',
              left: scaledPos.x,
              top: scaledPos.y,
              height: scaledPos.height,
              minWidth: text ? 'auto' : scaledPos.maxWidth,
              maxWidth: scaledPos.maxWidth,
              display: 'flex',
              alignItems: 'center',
              justifyContent: textPos.growDirection === 'center' ? 'center' : 
                           textPos.growDirection === 'right' ? 'flex-start' : 'flex-end',
              backgroundColor: text ? '#000' : 'rgba(0, 0, 0, 0.7)',
              borderRadius: scaledPos.height / 2,
              padding: text ? `0 ${16 * scale}px` : `0 ${8 * scale}px`,
              color: text ? 'white' : 'white',
              fontSize: 14 * scale,
              fontWeight: 'bold',
              border: text ? 'none' : '2px solid #000'
            }}
          >
            {text || `t${index + 1}`}
          </div>
        );
      })}
    </div>
  );
}
