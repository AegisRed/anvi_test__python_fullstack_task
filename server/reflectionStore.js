import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultStorePath = process.env.VIBE_STORE_PATH ?? path.resolve(__dirname, '..', 'data', 'reflections.json');

async function ensureStoreFile(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  try {
    await fs.access(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }

    await fs.writeFile(filePath, '[]\n', 'utf8');
  }
}

export function createReflectionStore(filePath = defaultStorePath) {
  return {
    async list() {
      await ensureStoreFile(filePath);
      const raw = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? parsed : [];
    },

    async append(entry) {
      const entries = await this.list();
      const nextEntries = [...entries, entry];
      await fs.writeFile(filePath, `${JSON.stringify(nextEntries, null, 2)}\n`, 'utf8');
      return nextEntries;
    },

    async update(id, updater) {
      const entries = await this.list();
      const index = entries.findIndex((entry) => entry.id === id);

      if (index === -1) {
        return null;
      }

      const nextEntry = typeof updater === 'function' ? updater(entries[index]) : { ...entries[index], ...updater };
      const nextEntries = entries.map((entry, entryIndex) => (entryIndex === index ? nextEntry : entry));
      await fs.writeFile(filePath, `${JSON.stringify(nextEntries, null, 2)}\n`, 'utf8');
      return {
        entry: nextEntry,
        entries: nextEntries,
      };
    },

    async remove(id) {
      const entries = await this.list();
      const nextEntries = entries.filter((entry) => entry.id !== id);

      if (nextEntries.length === entries.length) {
        return null;
      }

      await fs.writeFile(filePath, `${JSON.stringify(nextEntries, null, 2)}\n`, 'utf8');
      return nextEntries;
    },

    async replace(entries) {
      const nextEntries = Array.isArray(entries) ? entries : [];
      await ensureStoreFile(filePath);
      await fs.writeFile(filePath, `${JSON.stringify(nextEntries, null, 2)}\n`, 'utf8');
      return nextEntries;
    },

    async clear() {
      await ensureStoreFile(filePath);
      await fs.writeFile(filePath, '[]\n', 'utf8');
    },
  };
}
