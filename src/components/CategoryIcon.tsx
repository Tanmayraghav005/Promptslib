import React from 'react';
import {
  Image,
  Sparkles,
  Layout,
  Film,
  Video,
  Mic,
  PenTool,
  Share2,
  Cpu,
  Folder,
  Code,
  Music,
  Briefcase,
  Camera,
  Layers,
  MessageSquare,
  Zap,
} from 'lucide-react';

export const ICON_OPTIONS: { name: string; label: string; icon: React.ElementType }[] = [
  { name: 'Image', label: 'Image', icon: Image },
  { name: 'Sparkles', label: 'Magic', icon: Sparkles },
  { name: 'Layout', label: 'Layout', icon: Layout },
  { name: 'Film', label: 'Film', icon: Film },
  { name: 'Video', label: 'Video', icon: Video },
  { name: 'Mic', label: 'Audio', icon: Mic },
  { name: 'PenTool', label: 'Writing', icon: PenTool },
  { name: 'Share2', label: 'Social', icon: Share2 },
  { name: 'Cpu', label: 'Tech & AI', icon: Cpu },
  { name: 'Folder', label: 'Folder', icon: Folder },
  { name: 'Code', label: 'Coding', icon: Code },
  { name: 'Music', label: 'Music', icon: Music },
  { name: 'Briefcase', label: 'Work', icon: Briefcase },
  { name: 'Camera', label: 'Photo', icon: Camera },
  { name: 'Layers', label: 'Design', icon: Layers },
  { name: 'MessageSquare', label: 'Chat', icon: MessageSquare },
  { name: 'Zap', label: 'Speed', icon: Zap },
];

export const COLOR_OPTIONS = [
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#a855f7', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f59e0b', // amber
  '#10b981', // emerald
  '#14b8a6', // teal
  '#64748b', // slate
];

interface CategoryIconProps {
  name: string;
  className?: string;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4', color }) => {
  const match = ICON_OPTIONS.find((item) => item.name.toLowerCase() === (name || '').toLowerCase());
  const IconComponent = match ? match.icon : Folder;

  return <IconComponent className={className} style={color ? { color } : undefined} />;
};
