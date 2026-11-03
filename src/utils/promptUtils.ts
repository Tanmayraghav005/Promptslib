import { Prompt, Category, VariableItem, AppSettings } from '../types';

/**
 * Extracts all unique {{VARIABLE}} or {{VARIABLE:defaultValue}} placeholders from prompt text.
 */
export function extractVariables(content: string): VariableItem[] {
  if (!content) return [];
  const regex = /\{\{([^}]+)\}\}/g;
  const seen = new Set<string>();
  const variables: VariableItem[] = [];

  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const raw = match[1].trim();
    if (!raw) continue;

    let key = raw;
    let defaultValue: string | undefined = undefined;

    if (raw.includes(':')) {
      const parts = raw.split(':');
      key = parts[0].trim();
      defaultValue = parts.slice(1).join(':').trim();
    }

    const normalizedKey = key.toUpperCase().replace(/\s+/g, '_');
    if (!seen.has(normalizedKey)) {
      seen.add(normalizedKey);
      variables.push({
        key: normalizedKey,
        label: key.replace(/_/g, ' '),
        defaultValue,
      });
    }
  }

  return variables;
}

/**
 * Replaces {{VARIABLE}} in template with user provided values.
 * If a variable is unfilled and has a default value, default is used.
 * If empty and no default, keeps placeholder or returns user formatted tag.
 */
export function replaceVariables(
  template: string,
  values: Record<string, string>,
  preserveEmptyAsPlaceholder = true
): string {
  if (!template) return '';
  return template.replace(/\{\{([^}]+)\}\}/g, (_match, raw) => {
    let key = raw.trim();
    let defaultValue = '';
    if (key.includes(':')) {
      const parts = key.split(':');
      key = parts[0].trim();
      defaultValue = parts.slice(1).join(':').trim();
    }
    const normalizedKey = key.toUpperCase().replace(/\s+/g, '_');
    const userVal = values[normalizedKey];

    if (userVal !== undefined && userVal.trim() !== '') {
      return userVal;
    }
    if (defaultValue) {
      return defaultValue;
    }
    return preserveEmptyAsPlaceholder ? `{{${normalizedKey}}}` : '';
  });
}

/**
 * Filters prompts by query, category, tag, and favorites.
 */
export function searchPrompts(
  prompts: Prompt[],
  query: string,
  categoryId?: string,
  tag?: string,
  onlyFavorites?: boolean
): Prompt[] {
  const q = query.trim().toLowerCase();

  return prompts.filter((p) => {
    if (onlyFavorites && !p.isFavorite) return false;
    if (categoryId && categoryId !== 'all') {
      if (categoryId === 'uncategorized') {
        if (p.categoryId && p.categoryId !== 'uncategorized') return false;
      } else if (p.categoryId !== categoryId) {
        return false;
      }
    }
    if (tag && !p.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      return false;
    }

    if (!q) return true;

    const inTitle = p.title.toLowerCase().includes(q);
    const inDesc = p.description?.toLowerCase().includes(q) ?? false;
    const inContent = p.content.toLowerCase().includes(q);
    const inTags = p.tags.some((t) => t.toLowerCase().includes(q));

    return inTitle || inDesc || inContent || inTags;
  });
}

/**
 * Sorts prompt list according to user preference.
 */
export function sortPrompts(prompts: Prompt[], sortBy: AppSettings['sortBy']): Prompt[] {
  const copy = [...prompts];
  switch (sortBy) {
    case 'recent_added':
      return copy.sort((a, b) => b.createdAt - a.createdAt);
    case 'recent_used':
      return copy.sort((a, b) => (b.lastUsedAt || 0) - (a.lastUsedAt || 0) || b.createdAt - a.createdAt);
    case 'alphabetical':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'most_used':
      return copy.sort((a, b) => b.usageCount - a.usageCount || b.createdAt - a.createdAt);
    default:
      return copy;
  }
}

/**
 * Validates JSON structure of exported library backup.
 */
export function validateBackupData(data: any): {
  valid: boolean;
  error?: string;
  prompts?: Prompt[];
  categories?: Category[];
} {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Backup file is empty or not valid JSON.' };
  }

  if (!Array.isArray(data.prompts)) {
    return { valid: false, error: 'Backup is missing the "prompts" array.' };
  }

  const validPrompts: Prompt[] = [];
  for (let i = 0; i < data.prompts.length; i++) {
    const p = data.prompts[i];
    if (!p || typeof p.title !== 'string' || typeof p.content !== 'string') {
      continue; // skip malformed records gracefully
    }
    validPrompts.push({
      id: p.id || `prompt-${Date.now()}-${i}`,
      title: p.title.trim() || 'Untitled Prompt',
      content: p.content,
      description: p.description || '',
      categoryId: p.categoryId || 'uncategorized',
      tags: Array.isArray(p.tags) ? p.tags.filter((t: any) => typeof t === 'string') : [],
      isFavorite: Boolean(p.isFavorite),
      usageCount: typeof p.usageCount === 'number' ? p.usageCount : 0,
      lastUsedAt: p.lastUsedAt,
      createdAt: typeof p.createdAt === 'number' ? p.createdAt : Date.now(),
      updatedAt: typeof p.updatedAt === 'number' ? p.updatedAt : Date.now(),
      attachments: Array.isArray(p.attachments) ? p.attachments : [],
    });
  }

  const validCategories: Category[] = [];
  if (Array.isArray(data.categories)) {
    for (const c of data.categories) {
      if (c && typeof c.name === 'string') {
        validCategories.push({
          id: c.id || `cat-${Date.now()}-${Math.random()}`,
          name: c.name.trim(),
          iconName: c.iconName || 'Folder',
          color: c.color || '#3b82f6',
          order: typeof c.order === 'number' ? c.order : 0,
          isSystem: Boolean(c.isSystem),
        });
      }
    }
  }

  return {
    valid: true,
    prompts: validPrompts,
    categories: validCategories,
  };
}

/**
 * Generate formatted export string
 */
export function generateExportJSON(prompts: Prompt[], categories: Category[]): string {
  const exportPayload = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    appName: 'Personal Prompt Library',
    prompts,
    categories,
  };
  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Relative time formatter for UI (e.g. "Just now", "2h ago", "Yesterday")
 */
export function formatRelativeTime(timestamp?: number): string {
  if (!timestamp) return 'Never';
  const diff = Date.now() - timestamp;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'Just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Human readable file size formatter
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Safe clipboard copy with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_e) {
    // fallback
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Copy fallback failed', err);
    return false;
  }
}

/**
 * Trigger subtle Android haptic vibration if enabled and supported
 */
export function triggerHaptic(enabled = true, duration = 15): void {
  if (!enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    navigator.vibrate(duration);
  } catch (_e) {
    // ignore
  }
}
