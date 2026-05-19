import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';

const initialPayload = {
  entries: [],
  insights: {
    totalEntries: 0,
    averageWordCount: 0,
    dominantCategory: 'Balanced',
    categoryCounts: {
      Productive: 0,
      Stressed: 0,
      Creative: 0,
      Collaborative: 0,
      Balanced: 0,
    },
    commonKeywords: [],
    recentTrend: [],
  },
};

const submittedEntry = {
  id: 'reflection-1',
  text: 'I shipped a creative prototype with the team.',
  wordCount: 8,
  category: 'Creative',
  score: 1,
  matchedKeywords: ['creative', 'prototype'],
  keywords: [
    { word: 'prototype', count: 1 },
    { word: 'shipped', count: 1 },
  ],
  createdAt: '2026-05-19T08:30:00.000Z',
};

describe('App submission flow', () => {
  beforeEach(() => {
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => initialPayload,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          entry: submittedEntry,
          insights: {
            ...initialPayload.insights,
            totalEntries: 1,
            averageWordCount: 8,
            dominantCategory: 'Creative',
            categoryCounts: {
              ...initialPayload.insights.categoryCounts,
              Creative: 1,
            },
            commonKeywords: [{ word: 'prototype', count: 1 }],
            recentTrend: ['Creative'],
          },
        }),
      });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('submits a reflection and updates entries and insights without a reload', async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByText('No reflections submitted yet.');
    await user.type(screen.getByRole('textbox', { name: /^reflection$/i }), submittedEntry.text);
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/reflections',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ text: submittedEntry.text }),
        }),
      );
    });

    expect(await screen.findByText(submittedEntry.text)).toBeInTheDocument();
    expect(screen.getAllByText('Creative').length).toBeGreaterThan(0);
    expect(screen.getAllByText('prototype').length).toBeGreaterThan(0);
    expect(screen.getByText('1 reflections')).toBeInTheDocument();
  });
});
