import { describe, expect, it } from 'vitest';
import { buildApp } from './app.js';

function createMemoryStore() {
  return {
    entries: [],
    async list() {
      return this.entries;
    },
    async append(entry) {
      this.entries = [...this.entries, entry];
      return this.entries;
    },
    async update(id, updater) {
      const index = this.entries.findIndex((entry) => entry.id === id);

      if (index === -1) {
        return null;
      }

      const entry = updater(this.entries[index]);
      this.entries = this.entries.map((currentEntry) => (currentEntry.id === id ? entry : currentEntry));

      return {
        entry,
        entries: this.entries,
      };
    },
    async remove(id) {
      const nextEntries = this.entries.filter((entry) => entry.id !== id);

      if (nextEntries.length === this.entries.length) {
        return null;
      }

      this.entries = nextEntries;
      return this.entries;
    },
    async replace(entries) {
      this.entries = entries;
      return this.entries;
    },
  };
}

describe('reflection API', () => {
  it('creates, updates, deletes, and refreshes insights', async () => {
    const app = await buildApp({ store: createMemoryStore() });

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/reflections',
      payload: { text: 'Focused team review shipped the prototype today.' },
    });
    const created = createResponse.json();

    expect(createResponse.statusCode).toBe(201);
    expect(created.entry.category).toBe('Productive');
    expect(created.entry.confidence).toBeGreaterThan(40);
    expect(created.insights.commonKeywords.map((keyword) => keyword.word)).toContain('prototype');

    const updateResponse = await app.inject({
      method: 'PATCH',
      url: `/api/reflections/${created.entry.id}`,
      payload: { text: 'Very stressed and blocked by a chaotic deadline.' },
    });
    const updated = updateResponse.json();

    expect(updateResponse.statusCode).toBe(200);
    expect(updated.entry.category).toBe('Stressed');
    expect(updated.insights.riskLevel).toBeDefined();

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/reflections/${created.entry.id}`,
    });

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.json().entries).toEqual([]);

    await app.close();
  });

  it('validates bad reflection payloads', async () => {
    const app = await buildApp({ store: createMemoryStore() });

    const response = await app.inject({
      method: 'POST',
      url: '/api/reflections',
      payload: { text: '  ' },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().message).toContain('at least 3 characters');

    await app.close();
  });
});
