import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractVariables,
  replaceVariables,
  searchPrompts,
  sortPrompts,
  validateBackupData,
  formatFileSize,
} from './promptUtils';
import { Prompt, Category } from '../types';

test('extractVariables finds unique variables with and without defaults', () => {
  const template = 'Act as {{ROLE:Senior Engineer}}. Create a {{OUTPUT_TYPE}} for {{TOPIC}} with {{ROLE}} perspective.';
  const vars = extractVariables(template);

  assert.equal(vars.length, 3);
  assert.equal(vars[0].key, 'ROLE');
  assert.equal(vars[0].defaultValue, 'Senior Engineer');
  assert.equal(vars[1].key, 'OUTPUT_TYPE');
  assert.equal(vars[1].defaultValue, undefined);
  assert.equal(vars[2].key, 'TOPIC');
});

test('replaceVariables replaces variables and defaults properly', () => {
  const template = 'Act as {{ROLE:Senior Engineer}}. Create a {{OUTPUT_TYPE}} for {{TOPIC}}.';
  
  // Custom values
  const customized = replaceVariables(template, {
    ROLE: 'UX Designer',
    OUTPUT_TYPE: 'Figma wireframe',
    TOPIC: 'Mobile banking',
  });
  assert.equal(customized, 'Act as UX Designer. Create a Figma wireframe for Mobile banking.');

  // Relying on default value for ROLE
  const withDefault = replaceVariables(template, {
    OUTPUT_TYPE: 'Dashboard',
    TOPIC: 'Analytics',
  });
  assert.equal(withDefault, 'Act as Senior Engineer. Create a Dashboard for Analytics.');

  // Leaving placeholder if empty and preserveEmptyAsPlaceholder is true
  const partial = replaceVariables(template, {
    ROLE: '', // should fall back to default or placeholder
  });
  assert.equal(partial, 'Act as Senior Engineer. Create a {{OUTPUT_TYPE}} for {{TOPIC}}.');
});

test('searchPrompts matches across title, tags, content, and category filters', () => {
  const samplePrompts: Prompt[] = [
    {
      id: 'p1',
      title: 'YouTube Thumbnail Concept',
      content: 'Generate cinematic 3D render of cyberpunk city',
      categoryId: 'graphics',
      tags: ['youtube', 'cinematic'],
      isFavorite: true,
      usageCount: 10,
      createdAt: 1000,
      updatedAt: 1000,
      attachments: [],
    },
    {
      id: 'p2',
      title: 'Python FastApi Boilerplate',
      content: 'Write an asynchronous backend server in python',
      categoryId: 'coding',
      tags: ['backend', 'python'],
      isFavorite: false,
      usageCount: 2,
      createdAt: 2000,
      updatedAt: 2000,
      attachments: [],
    },
  ];

  // Match keyword in content
  const resultsContent = searchPrompts(samplePrompts, 'cyberpunk');
  assert.equal(resultsContent.length, 1);
  assert.equal(resultsContent[0].id, 'p1');

  // Match keyword in tags
  const resultsTag = searchPrompts(samplePrompts, 'python');
  assert.equal(resultsTag.length, 1);
  assert.equal(resultsTag[0].id, 'p2');

  // Filter favorites
  const favResults = searchPrompts(samplePrompts, '', undefined, undefined, true);
  assert.equal(favResults.length, 1);
  assert.equal(favResults[0].id, 'p1');

  // Filter category
  const catResults = searchPrompts(samplePrompts, '', 'coding');
  assert.equal(catResults.length, 1);
  assert.equal(catResults[0].id, 'p2');
});

test('sortPrompts sorts correctly by usage, recent, and alphabetical', () => {
  const samplePrompts: Prompt[] = [
    {
      id: 'p1',
      title: 'Beta prompt',
      content: '...',
      categoryId: '',
      tags: [],
      isFavorite: false,
      usageCount: 5,
      createdAt: 200,
      lastUsedAt: 500,
      updatedAt: 200,
      attachments: [],
    },
    {
      id: 'p2',
      title: 'Alpha prompt',
      content: '...',
      categoryId: '',
      tags: [],
      isFavorite: false,
      usageCount: 15,
      createdAt: 100,
      lastUsedAt: 1000,
      updatedAt: 100,
      attachments: [],
    },
  ];

  // Alphabetical
  const alpha = sortPrompts(samplePrompts, 'alphabetical');
  assert.equal(alpha[0].id, 'p2');

  // Most used
  const mostUsed = sortPrompts(samplePrompts, 'most_used');
  assert.equal(mostUsed[0].id, 'p2');

  // Recent added
  const recentAdded = sortPrompts(samplePrompts, 'recent_added');
  assert.equal(recentAdded[0].id, 'p1');
});

test('validateBackupData validates valid and catches malformed data', () => {
  const invalid = validateBackupData({ notPrompts: [] });
  assert.equal(invalid.valid, false);

  const valid = validateBackupData({
    prompts: [
      {
        id: 'p1',
        title: 'Test',
        content: 'Content here',
        tags: ['test'],
      },
    ],
    categories: [
      {
        id: 'c1',
        name: 'Design',
      },
    ],
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.prompts?.length, 1);
  assert.equal(valid.prompts?.[0].title, 'Test');
  assert.equal(valid.categories?.length, 1);
});

test('formatFileSize formats units appropriately', () => {
  assert.equal(formatFileSize(500), '500 B');
  assert.equal(formatFileSize(2048), '2.0 KB');
  assert.equal(formatFileSize(1048576 * 2.5), '2.5 MB');
});
