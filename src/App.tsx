import React, { useState, useEffect, useCallback } from 'react';
import { Prompt, Category, AppSettings, Attachment } from './types';
import { storage, DEFAULT_SETTINGS } from './services/storage';
import { Toast, ToastMessage } from './components/Toast';
import { AndroidFrame } from './components/AndroidFrame';
import { BottomNav, NavTab } from './components/BottomNav';
import { HomeView } from './views/HomeView';
import { LibraryView } from './views/LibraryView';
import { CategoriesView } from './views/CategoriesView';
import { SettingsView } from './views/SettingsView';
import { PromptDetailModal } from './components/PromptDetailModal';
import { CustomizeModal } from './components/CustomizeModal';
import { PromptEditorModal } from './components/PromptEditorModal';
import { CategoryEditorModal } from './components/CategoryEditorModal';
import { CategoryDeleteModal } from './components/CategoryDeleteModal';
import { AttachmentViewerModal } from './components/AttachmentViewerModal';

export default function App() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [libraryCategoryFilter, setLibraryCategoryFilter] = useState('all');
  const [libraryInitialQuery, setLibraryInitialQuery] = useState('');

  // Modals state
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [customizingPrompt, setCustomizingPrompt] = useState<Prompt | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [isCategoryEditorOpen, setIsCategoryEditorOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [activeAttachment, setActiveAttachment] = useState<Attachment | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToast({ id, text, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 2400);
  }, []);

  // Initial data loading from IndexedDB
  useEffect(() => {
    async function loadData() {
      try {
        const [loadedPrompts, loadedCategories, loadedSettings] = await Promise.all([
          storage.getAllPrompts(),
          storage.getAllCategories(),
          storage.getSettings(),
        ]);
        setPrompts(loadedPrompts);
        setCategories(loadedCategories);
        setSettings(loadedSettings);
      } catch (err) {
        console.error('Failed to initialize database:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Theme synchronization
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [settings.theme]);

  // --- Handlers ---

  const handleUpdateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await storage.saveSettings(newSettings);
  };

  const handleSavePrompt = async (prompt: Prompt) => {
    await storage.savePrompt(prompt);
    setPrompts((prev) => {
      const idx = prev.findIndex((p) => p.id === prompt.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = prompt;
        return copy;
      }
      return [prompt, ...prev];
    });
    showToast(editingPrompt ? 'Prompt updated' : 'Prompt saved to vault', 'success');
  };

  const handleDeletePrompt = async (id: string) => {
    await storage.deletePrompt(id);
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    showToast('Prompt deleted', 'info');
  };

  const handleToggleFavorite = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = prompts.find((p) => p.id === id);
    if (!target) return;

    const updated: Prompt = {
      ...target,
      isFavorite: !target.isFavorite,
      updatedAt: Date.now(),
    };

    await storage.savePrompt(updated);
    setPrompts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    if (selectedPrompt?.id === id) {
      setSelectedPrompt(updated);
    }
    showToast(updated.isFavorite ? 'Added to Favourites' : 'Removed from Favourites', 'info');
  };

  const handleCopySuccess = async (title: string) => {
    showToast(`Copied "${title}" to clipboard!`, 'success');

    // Find if prompt exists to increment usage and record lastUsedAt
    const match = prompts.find((p) => p.title === title || title.startsWith(p.title));
    if (match) {
      const updated: Prompt = {
        ...match,
        usageCount: (match.usageCount || 0) + 1,
        lastUsedAt: Date.now(),
      };
      await storage.savePrompt(updated);
      setPrompts((prev) => prev.map((p) => (p.id === match.id ? updated : p)));
      if (selectedPrompt?.id === match.id) {
        setSelectedPrompt(updated);
      }
    }
  };

  const handleDuplicatePrompt = async (original: Prompt) => {
    const duplicate: Prompt = {
      ...original,
      id: `prompt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: `${original.title} (Copy)`,
      usageCount: 0,
      lastUsedAt: undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await storage.savePrompt(duplicate);
    setPrompts((prev) => [duplicate, ...prev]);
    showToast(`Duplicated "${original.title}"`, 'success');
    setSelectedPrompt(duplicate);
  };

  const handleSaveCategory = async (category: Category) => {
    await storage.saveCategory(category);
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === category.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = category;
        return copy;
      }
      return [...prev, category];
    });
    showToast(categoryToEdit ? 'Category updated' : 'Category created', 'success');
  };

  const handleDeleteCategory = async (categoryId: string, reassignTargetId: string) => {
    await storage.deleteCategory(categoryId, reassignTargetId);
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    // Refresh prompts since some were reassigned
    const refreshedPrompts = await storage.getAllPrompts();
    setPrompts(refreshedPrompts);
    showToast('Category deleted and prompts safely preserved', 'info');
  };

  const handleImportData = async (
    importedPrompts: Prompt[],
    importedCategories: Category[],
    mode: 'merge' | 'replace'
  ) => {
    await storage.bulkImport(importedPrompts, importedCategories, mode);
    const [freshPrompts, freshCategories] = await Promise.all([
      storage.getAllPrompts(),
      storage.getAllCategories(),
    ]);
    setPrompts(freshPrompts);
    setCategories(freshCategories);
  };

  const handleResetData = async () => {
    await storage.resetAllData();
    const [freshPrompts, freshCategories] = await Promise.all([
      storage.getAllPrompts(),
      storage.getAllCategories(),
    ]);
    setPrompts(freshPrompts);
    setCategories(freshCategories);
  };

  // Quick navigation helpers
  const handleNavigateToCategory = (catId: string) => {
    setLibraryCategoryFilter(catId);
    setLibraryInitialQuery('');
    setActiveTab('library');
  };

  const handleNavigateToLibrary = (query = '') => {
    setLibraryInitialQuery(query);
    setLibraryCategoryFilter('all');
    setActiveTab('library');
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center text-white space-y-3">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono text-neutral-400">Loading your prompt vault...</p>
      </div>
    );
  }

  return (
    <AndroidFrame>
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Screen Views */}
      <main className="flex-1 w-full flex flex-col overflow-hidden relative">
        {activeTab === 'home' && (
          <HomeView
            prompts={prompts}
            categories={categories}
            onOpenPrompt={(p) => setSelectedPrompt(p)}
            onOpenCreate={() => {
              setEditingPrompt(null);
              setIsEditorOpen(true);
            }}
            onToggleFavorite={handleToggleFavorite}
            onCustomize={(p) => setCustomizingPrompt(p)}
            onCopySuccess={handleCopySuccess}
            onNavigateToCategory={handleNavigateToCategory}
            onNavigateToLibrary={handleNavigateToLibrary}
            enableHaptics={settings.enableHaptics}
          />
        )}

        {activeTab === 'library' && (
          <LibraryView
            prompts={prompts}
            categories={categories}
            initialCategory={libraryCategoryFilter}
            initialQuery={libraryInitialQuery}
            onOpenPrompt={(p) => setSelectedPrompt(p)}
            onOpenCreate={() => {
              setEditingPrompt(null);
              setIsEditorOpen(true);
            }}
            onToggleFavorite={handleToggleFavorite}
            onCustomize={(p) => setCustomizingPrompt(p)}
            onCopySuccess={handleCopySuccess}
            enableHaptics={settings.enableHaptics}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesView
            categories={categories}
            prompts={prompts}
            onOpenCreateCategory={() => {
              setCategoryToEdit(null);
              setIsCategoryEditorOpen(true);
            }}
            onEditCategory={(cat) => {
              setCategoryToEdit(cat);
              setIsCategoryEditorOpen(true);
            }}
            onRequestDeleteCategory={(cat) => setCategoryToDelete(cat)}
            onOpenPrompt={(p) => setSelectedPrompt(p)}
            onToggleFavorite={handleToggleFavorite}
            onCustomize={(p) => setCustomizingPrompt(p)}
            onCopySuccess={handleCopySuccess}
            enableHaptics={settings.enableHaptics}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            prompts={prompts}
            categories={categories}
            onImportData={handleImportData}
            onResetData={handleResetData}
            onShowToast={showToast}
            enableHaptics={settings.enableHaptics}
          />
        )}
      </main>

      {/* Liquid Glass Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        enableHaptics={settings.enableHaptics}
      />

      {/* --- Modals & Sheets --- */}

      {/* Prompt Detail View Modal */}
      <PromptDetailModal
        prompt={selectedPrompt}
        category={categories.find((c) => c.id === selectedPrompt?.categoryId)}
        isOpen={Boolean(selectedPrompt)}
        onClose={() => setSelectedPrompt(null)}
        onEdit={(p) => {
          setSelectedPrompt(null);
          setEditingPrompt(p);
          setIsEditorOpen(true);
        }}
        onDuplicate={handleDuplicatePrompt}
        onDelete={handleDeletePrompt}
        onToggleFavorite={handleToggleFavorite}
        onCustomize={(p) => {
          setSelectedPrompt(null);
          setCustomizingPrompt(p);
        }}
        onCopySuccess={handleCopySuccess}
        onViewAttachment={(att) => setActiveAttachment(att)}
        enableHaptics={settings.enableHaptics}
      />

      {/* Customize & Copy Variables Modal */}
      <CustomizeModal
        prompt={customizingPrompt}
        isOpen={Boolean(customizingPrompt)}
        onClose={() => setCustomizingPrompt(null)}
        onCopySuccess={handleCopySuccess}
        enableHaptics={settings.enableHaptics}
      />

      {/* Add / Edit Prompt Modal */}
      <PromptEditorModal
        initialPrompt={editingPrompt}
        categories={categories}
        settings={settings}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingPrompt(null);
        }}
        onSave={handleSavePrompt}
        enableHaptics={settings.enableHaptics}
      />

      {/* Create / Edit Category Modal */}
      <CategoryEditorModal
        initialCategory={categoryToEdit}
        isOpen={isCategoryEditorOpen}
        onClose={() => {
          setIsCategoryEditorOpen(false);
          setCategoryToEdit(null);
        }}
        onSave={handleSaveCategory}
        enableHaptics={settings.enableHaptics}
      />

      {/* Delete Category Confirmation with Reassignment Modal */}
      <CategoryDeleteModal
        category={categoryToDelete}
        allCategories={categories}
        affectedPromptCount={
          categoryToDelete ? prompts.filter((p) => p.categoryId === categoryToDelete.id).length : 0
        }
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirmDelete={handleDeleteCategory}
        enableHaptics={settings.enableHaptics}
      />

      {/* Attachment Fullscreen Viewer */}
      <AttachmentViewerModal
        attachment={activeAttachment}
        isOpen={Boolean(activeAttachment)}
        onClose={() => setActiveAttachment(null)}
      />
    </AndroidFrame>
  );
}
