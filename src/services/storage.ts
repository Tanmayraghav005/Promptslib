import { Prompt, Category, AppSettings } from '../types';

const DB_NAME = 'PersonalPromptLibraryDB';
const DB_VERSION = 1;

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-img-gen', name: 'Image Generation', iconName: 'Image', color: '#ec4899', order: 1 },
  { id: 'cat-img-edit', name: 'Image Editing', iconName: 'Sparkles', color: '#a855f7', order: 2 },
  { id: 'cat-thumb-gfx', name: 'Thumbnail & Graphics', iconName: 'Layout', color: '#f59e0b', order: 3 },
  { id: 'cat-video-edit', name: 'Video Editing', iconName: 'Film', color: '#06b6d4', order: 4 },
  { id: 'cat-video-gen', name: 'Video Generation', iconName: 'Video', color: '#3b82f6', order: 5 },
  { id: 'cat-audio', name: 'Audio & Voice', iconName: 'Mic', color: '#10b981', order: 6 },
  { id: 'cat-writing', name: 'Content Writing', iconName: 'PenTool', color: '#6366f1', order: 7 },
  { id: 'cat-social', name: 'YouTube & Social Media', iconName: 'Share2', color: '#ef4444', order: 8 },
  { id: 'cat-automation', name: 'AI & Automation', iconName: 'Cpu', color: '#8b5cf6', order: 9 },
  { id: 'cat-misc', name: 'General / Miscellaneous', iconName: 'Folder', color: '#64748b', order: 10 },
];

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  enableHaptics: true,
  geminiApiKey: '',
  geminiModel: 'gemini-2.5-flash',
  enableAiFeatures: true,
  compactView: false,
  sortBy: 'recent_added',
};

export const INITIAL_SEED_PROMPTS: Prompt[] = [
  {
    id: 'seed-yt-thumbnail',
    title: 'High-CTR YouTube Thumbnail Concept',
    description: 'Detailed prompt for Midjourney / DALL-E generating thumb-stopping YouTube thumbnails with dynamic expressions.',
    categoryId: 'cat-thumb-gfx',
    tags: ['YouTube', 'Thumbnail', 'Cinematic', 'High CTR'],
    isFavorite: true,
    usageCount: 14,
    lastUsedAt: Date.now() - 1000 * 60 * 30, // 30 mins ago
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    updatedAt: Date.now() - 1000 * 60 * 60 * 48,
    attachments: [],
    content: `Create a viral, high-CTR YouTube thumbnail visual composition about {{TOPIC}}.

Foreground: Extreme close-up of a central character with an intensely {{EXPRESSION:shocked and amazed}} facial expression, eyes wide, looking slightly off-camera.
Lighting: Dramatic {{LIGHTING:neon rim lighting with cyan and magenta split-tone}}, volumetric fog and glowing particles.
Background: Suspenseful cinematic scene depicting {{ENVIRONMENT:an epic hidden underground temple}}, depth of field blur (bokeh).
Color Palette: High-contrast {{COLOR_THEME:vibrant gold and deep obsidian}}.
Composition: Rule of thirds, ample negative space on the left side for overlay bold 3D text. Photorealistic, 8k resolution, Unreal Engine 5 render aesthetic.`,
  },
  {
    id: 'seed-midjourney-cinema',
    title: 'Photorealistic Cinematic Scene',
    description: 'Master prompt for cinematic stills with specific lens, lighting, and camera angle variables.',
    categoryId: 'cat-img-gen',
    tags: ['Midjourney', 'Photorealistic', 'Cinematic', 'Lighting'],
    isFavorite: true,
    usageCount: 8,
    lastUsedAt: Date.now() - 1000 * 60 * 120, // 2 hrs ago
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
    updatedAt: Date.now() - 1000 * 60 * 60 * 72,
    attachments: [],
    content: `Award-winning film still of {{SUBJECT:a futuristic cybernetic archaeologist}} discovering an ancient artifact in {{LOCATION:a mist-shrouded rain forest in Kyoto}}.

Shot on {{CAMERA:35mm anamorphic lens}}, {{LIGHTING_STYLE:golden hour sunlight piercing through dense canopy}}, subtle lens flare, shallow depth of field. Intricate textures, hyper-detailed skin pores, realistic cloth weave, cinematic color grading inspired by Denis Villeneuve films. --ar {{ASPECT_RATIO:16:9}} --style raw --v 6.1`,
  },
  {
    id: 'seed-viral-hook',
    title: 'Viral Short-Form Video Script Hook',
    description: '3-second psychological hook formulas for TikTok, Instagram Reels, and YouTube Shorts.',
    categoryId: 'cat-social',
    tags: ['Shorts', 'TikTok', 'Hook', 'Copywriting'],
    isFavorite: false,
    usageCount: 21,
    lastUsedAt: Date.now() - 1000 * 60 * 360,
    createdAt: Date.now() - 1000 * 60 * 60 * 96,
    updatedAt: Date.now() - 1000 * 60 * 60 * 96,
    attachments: [],
    content: `Act as a world-class viral video strategist. Write 5 high-retention video opening hooks for {{TARGET_AUDIENCE:freelance software developers}} struggling with {{PAIN_POINT:landing high-paying clients without burnout}}.

Format requirements:
- Opening 0-3 seconds visual action + caption.
- The psychological hook angle: {{HOOK_ANGLE:Counter-intuitive revelation}}.
- Rapid pattern interruption.
- Immediate bridge to the payoff without fluff.`,
  },
  {
    id: 'seed-code-architect',
    title: 'Senior Software Architect Code Review',
    description: 'Deep architectural and performance audit prompt with structured checklist.',
    categoryId: 'cat-automation',
    tags: ['Engineering', 'Architecture', 'Performance', 'TypeScript'],
    isFavorite: false,
    usageCount: 5,
    lastUsedAt: Date.now() - 1000 * 60 * 1440,
    createdAt: Date.now() - 1000 * 60 * 60 * 120,
    updatedAt: Date.now() - 1000 * 60 * 60 * 120,
    attachments: [],
    content: `Act as a Principal Staff Engineer and Security Architect specializing in {{TECH_STACK:TypeScript, React 19, and Node.js}}.

Review the following code module for:
1. Performance bottlenecks (unnecessary re-renders, memory leaks, O(n^2) hot paths).
2. Security vulnerabilities and sanitize checks.
3. Edge cases and error boundaries.
4. Clean code principles & type safety.

Provide the review in three sections:
- Executive Summary (Critical / Major / Minor).
- Line-by-line constructive feedback with concrete refactored code snippets.
- Suggested architectural improvements for scalability.

Here is the code to audit:
{{CODE_SNIPPET:[Paste code here]}}`,
  },
];

class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB is not supported in this environment'));
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Prompts store
        if (!db.objectStoreNames.contains('prompts')) {
          const promptStore = db.createObjectStore('prompts', { keyPath: 'id' });
          promptStore.createIndex('categoryId', 'categoryId', { unique: false });
          promptStore.createIndex('createdAt', 'createdAt', { unique: false });
          promptStore.createIndex('lastUsedAt', 'lastUsedAt', { unique: false });
          promptStore.createIndex('usageCount', 'usageCount', { unique: false });
          promptStore.createIndex('isFavorite', 'isFavorite', { unique: false });
        }

        // Categories store
        if (!db.objectStoreNames.contains('categories')) {
          const catStore = db.createObjectStore('categories', { keyPath: 'id' });
          catStore.createIndex('order', 'order', { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // --- Prompts ---

  async getAllPrompts(): Promise<Prompt[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('prompts', 'readonly');
        const store = tx.objectStore('prompts');
        const req = store.getAll();
        req.onsuccess = () => {
          let list = req.result as Prompt[];
          if (!list || list.length === 0) {
            // First time initialization: populate seed prompts
            this.seedInitialData().then((seeded) => resolve(seeded));
          } else {
            resolve(list);
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch (_err) {
      // Fallback to localStorage if IndexedDB fails
      const raw = localStorage.getItem('ppl_prompts');
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
      return INITIAL_SEED_PROMPTS;
    }
  }

  async savePrompt(prompt: Prompt): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('prompts', 'readwrite');
        const store = tx.objectStore('prompts');
        const req = store.put(prompt);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (_err) {
      const all = await this.getAllPrompts();
      const idx = all.findIndex((p) => p.id === prompt.id);
      if (idx >= 0) all[idx] = prompt;
      else all.push(prompt);
      localStorage.setItem('ppl_prompts', JSON.stringify(all));
    }
  }

  async deletePrompt(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('prompts', 'readwrite');
        const store = tx.objectStore('prompts');
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (_err) {
      const all = await this.getAllPrompts();
      const filtered = all.filter((p) => p.id !== id);
      localStorage.setItem('ppl_prompts', JSON.stringify(filtered));
    }
  }

  // --- Categories ---

  async getAllCategories(): Promise<Category[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('categories', 'readonly');
        const store = tx.objectStore('categories');
        const req = store.getAll();
        req.onsuccess = () => {
          const list = req.result as Category[];
          if (!list || list.length === 0) {
            this.saveDefaultCategories().then((defaults) => resolve(defaults));
          } else {
            resolve(list.sort((a, b) => a.order - b.order));
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch (_err) {
      const raw = localStorage.getItem('ppl_categories');
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {}
      }
      return DEFAULT_CATEGORIES;
    }
  }

  async saveCategory(category: Category): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('categories', 'readwrite');
        const store = tx.objectStore('categories');
        const req = store.put(category);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (_err) {
      const all = await this.getAllCategories();
      const idx = all.findIndex((c) => c.id === category.id);
      if (idx >= 0) all[idx] = category;
      else all.push(category);
      localStorage.setItem('ppl_categories', JSON.stringify(all));
    }
  }

  async deleteCategory(
    categoryId: string,
    reassignTargetId: string = 'uncategorized'
  ): Promise<void> {
    // 1. Reassign affected prompts
    const prompts = await this.getAllPrompts();
    const affected = prompts.filter((p) => p.categoryId === categoryId);
    for (const p of affected) {
      p.categoryId = reassignTargetId;
      p.updatedAt = Date.now();
      await this.savePrompt(p);
    }

    // 2. Remove category
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('categories', 'readwrite');
        const store = tx.objectStore('categories');
        const req = store.delete(categoryId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (_err) {
      const all = await this.getAllCategories();
      const filtered = all.filter((c) => c.id !== categoryId);
      localStorage.setItem('ppl_categories', JSON.stringify(filtered));
    }
  }

  // --- Settings ---

  async getSettings(): Promise<AppSettings> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('settings', 'readonly');
        const store = tx.objectStore('settings');
        const req = store.get('app_settings');
        req.onsuccess = () => {
          if (req.result && req.result.value) {
            resolve({ ...DEFAULT_SETTINGS, ...req.result.value });
          } else {
            resolve(DEFAULT_SETTINGS);
          }
        };
        req.onerror = () => resolve(DEFAULT_SETTINGS);
      });
    } catch (_err) {
      const raw = localStorage.getItem('ppl_settings');
      if (raw) {
        try {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
        } catch {}
      }
      return DEFAULT_SETTINGS;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('settings', 'readwrite');
        const store = tx.objectStore('settings');
        const req = store.put({ key: 'app_settings', value: settings });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (_err) {
      localStorage.setItem('ppl_settings', JSON.stringify(settings));
    }
  }

  // --- Seeding & Defaults ---

  private async saveDefaultCategories(): Promise<Category[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction('categories', 'readwrite');
      const store = tx.objectStore('categories');
      for (const cat of DEFAULT_CATEGORIES) {
        store.put(cat);
      }
    } catch (_e) {
      localStorage.setItem('ppl_categories', JSON.stringify(DEFAULT_CATEGORIES));
    }
    return DEFAULT_CATEGORIES;
  }

  async seedInitialData(): Promise<Prompt[]> {
    await this.saveDefaultCategories();
    try {
      const db = await this.getDB();
      const tx = db.transaction('prompts', 'readwrite');
      const store = tx.objectStore('prompts');
      for (const p of INITIAL_SEED_PROMPTS) {
        store.put(p);
      }
    } catch (_e) {
      localStorage.setItem('ppl_prompts', JSON.stringify(INITIAL_SEED_PROMPTS));
    }
    return INITIAL_SEED_PROMPTS;
  }

  async resetAllData(): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(['prompts', 'categories'], 'readwrite');
      tx.objectStore('prompts').clear();
      tx.objectStore('categories').clear();
    } catch (_e) {
      localStorage.removeItem('ppl_prompts');
      localStorage.removeItem('ppl_categories');
    }
    await this.seedInitialData();
  }

  async bulkImport(prompts: Prompt[], categories: Category[], mode: 'merge' | 'replace'): Promise<void> {
    if (mode === 'replace') {
      try {
        const db = await this.getDB();
        const tx = db.transaction(['prompts', 'categories'], 'readwrite');
        tx.objectStore('prompts').clear();
        tx.objectStore('categories').clear();
      } catch (_e) {
        localStorage.removeItem('ppl_prompts');
        localStorage.removeItem('ppl_categories');
      }
    }

    // Save categories
    for (const cat of categories) {
      await this.saveCategory(cat);
    }
    // Save prompts
    for (const p of prompts) {
      await this.savePrompt(p);
    }
  }
}

export const storage = new StorageService();
