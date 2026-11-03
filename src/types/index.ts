export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string; // persistent Base64 / data URL
  createdAt: number;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  categoryId: string; // '' or 'uncategorized' if no category
  tags: string[];
  isFavorite: boolean;
  usageCount: number;
  lastUsedAt?: number;
  createdAt: number;
  updatedAt: number;
  attachments: Attachment[];
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
  order: number;
  isSystem?: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  enableHaptics: boolean;
  geminiApiKey: string;
  geminiModel: string;
  enableAiFeatures: boolean;
  compactView: boolean;
  sortBy: 'recent_added' | 'recent_used' | 'alphabetical' | 'most_used';
}

export interface VariableItem {
  key: string;
  label: string;
  defaultValue?: string;
}
