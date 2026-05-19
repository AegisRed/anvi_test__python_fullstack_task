import Fastify from 'fastify';
import cors from '@fastify/cors';
import { randomUUID } from 'node:crypto';
import { analyzeReflection } from './vibeAnalyzer.js';
import { buildInsights } from './insights.js';
import { createReflectionStore } from './reflectionStore.js';
import { validateReflectionPayload } from './validation.js';
import { demoReflections } from './demoData.js';

function sortNewestFirst(entries) {
  return [...entries].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

function createReflectionEntry(text, overrides = {}) {
  return {
    id: overrides.id ?? randomUUID(),
    text,
    ...analyzeReflection(text),
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    updatedAt: overrides.updatedAt,
  };
}

function hydrateReflectionEntry(entry) {
  return createReflectionEntry(entry.text ?? '', {
    id: entry.id,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  });
}

async function reflectionPayload(entries) {
  const hydratedEntries = entries.map(hydrateReflectionEntry);

  return {
    entries: sortNewestFirst(hydratedEntries),
    insights: buildInsights(hydratedEntries),
  };
}

export async function buildApp({ logger = false, store = createReflectionStore() } = {}) {
  const app = Fastify({ logger });

  await app.register(cors, {
    origin: true,
  });

  app.get('/api/health', async () => ({ ok: true }));

  app.get('/api/reflections', async () => {
    const entries = await store.list();

    return reflectionPayload(entries);
  });

  app.post('/api/reflections', async (request, reply) => {
    const validation = validateReflectionPayload(request.body);

    if (!validation.ok) {
      return reply.code(400).send({ message: validation.message });
    }

    const entry = createReflectionEntry(validation.text);
    const entries = await store.append(entry);

    return reply.code(201).send({
      entry,
      insights: buildInsights(entries),
    });
  });

  app.patch('/api/reflections/:id', async (request, reply) => {
    const validation = validateReflectionPayload(request.body);

    if (!validation.ok) {
      return reply.code(400).send({ message: validation.message });
    }

    const result = await store.update(request.params.id, (entry) =>
      createReflectionEntry(validation.text, {
        id: entry.id,
        createdAt: entry.createdAt,
        updatedAt: new Date().toISOString(),
      }),
    );

    if (!result) {
      return reply.code(404).send({ message: 'Reflection was not found.' });
    }

    return {
      entry: result.entry,
      insights: buildInsights(result.entries),
    };
  });

  app.delete('/api/reflections/:id', async (request, reply) => {
    const entries = await store.remove(request.params.id);

    if (!entries) {
      return reply.code(404).send({ message: 'Reflection was not found.' });
    }

    return reflectionPayload(entries);
  });

  app.post('/api/reflections/demo', async () => {
    const entries = await store.replace(demoReflections.map((reflection) => createReflectionEntry(reflection.text, reflection)));

    return reflectionPayload(entries);
  });

  return app;
}
