import React from 'react';
import { ICONS_DATA, COLORS_DATA } from '@/utils/badgeData';
import local from './BadgeSelector.module.css';

interface BadgeSelectorProps {
  selectedIconId?: number;
  selectedIconName?: string;
  selectedColorHex?: string;
  selectedColorId?: number;
  onIconChange: (id: number, name: string) => void;
  onColorChange: (id: number, hex: string) => void;
}

export default function BadgeSelector({
  selectedIconId,
  selectedIconName,
  selectedColorHex,
  selectedColorId,
  onIconChange,
  onColorChange,
}: BadgeSelectorProps) {
  // Determine if a specific icon is selected
  const isActiveIcon = (icon: any) => {
    if (selectedIconId) return icon.id === selectedIconId;
    if (selectedIconName) return icon.name === selectedIconName;
    return false;
  };

  // Determine if a specific color is selected
  const isActiveColor = (color: any) => {
    if (selectedColorId) return color.id === selectedColorId;
    if (selectedColorHex) return color.hex === selectedColorHex;
    return false;
  };

  // Current color to tint the icons
  const currentColorHex = selectedColorHex 
    || COLORS_DATA.find((c) => c.id === selectedColorId)?.hex 
    || '#A3A3A3';

  return (
    <div className={local.container}>
      <label className={local.label}>Badgets</label>
      
      <div className={local.iconGrid}>
        {ICONS_DATA.map((iconData) => {
          const IconComponent = iconData.component;
          const active = isActiveIcon(iconData);
          return (
            <button
              key={iconData.id}
              type="button"
              title={iconData.name}
              className={`${local.iconBtn} ${active ? local.active : ''}`}
              style={{
                borderColor: active ? currentColorHex : 'transparent',
                color: active ? currentColorHex : '#6B7280',
              }}
              onClick={() => onIconChange(iconData.id, iconData.name)}
            >
              <IconComponent size={20} strokeWidth={2} />
            </button>
          );
        })}
      </div>

      <div className={local.colorRow}>
        {COLORS_DATA.map((colorData) => {
          const active = isActiveColor(colorData);
          return (
            <button
              key={colorData.id}
              type="button"
              title={colorData.name}
              className={`${local.colorDotWrapper} ${active ? local.active : ''}`}
              style={{
                borderColor: active ? colorData.hex : 'transparent',
              }}
              onClick={() => onColorChange(colorData.id, colorData.hex)}
            >
              <div 
                className={local.colorDot} 
                style={{ backgroundColor: colorData.hex }} 
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
