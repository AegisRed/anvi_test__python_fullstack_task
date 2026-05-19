import { analyzeReflection, extractKeywords } from './vibeAnalyzer.js';

const KNOWN_CATEGORIES = ['Productive', 'Stressed', 'Creative', 'Collaborative', 'Balanced'];
const CATEGORY_PULSE = {
  Productive: 80,
  Creative: 76,
  Collaborative: 74,
  Balanced: 65,
  Stressed: 38,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeEntry(entry) {
  const analysis = analyzeReflection(entry.text ?? '');

  return {
    ...entry,
    ...analysis,
  };
}

function buildStreak(entries) {
  if (entries.length === 0) {
    return {
      category: 'Balanced',
      count: 0,
      message: 'No streak yet.',
    };
  }

  const latestCategory = entries[entries.length - 1].category;
  let count = 0;

  for (let index = entries.length - 1; index >= 0; index -= 1) {
    if (entries[index].category !== latestCategory) {
      break;
    }

    count += 1;
  }

  return {
    category: latestCategory,
    count,
    message: count > 1 ? `${count} ${latestCategory.toLowerCase()} entries in a row.` : `Latest vibe is ${latestCategory}.`,
  };
}

function buildTeamSummary({ dominantCategory, pulseScore, commonKeywords, streak, stressedRecentCount }) {
  if (stressedRecentCount >= 2) {
    return 'Stress signals are rising in recent reflections; unblockers and clearer priorities may help.';
  }

  const keywordText = commonKeywords
    .slice(0, 3)
    .map((keyword) => keyword.word)
    .join(', ');
  const keywordSuffix = keywordText ? ` Keywords to watch: ${keywordText}.` : '';

  if (pulseScore >= 75) {
    return `Team pulse is healthy and leaning ${dominantCategory.toLowerCase()}.${keywordSuffix}`;
  }

  if (pulseScore >= 55) {
    return `Team pulse is steady with a ${dominantCategory.toLowerCase()} lead.${keywordSuffix}`;
  }

  return `Team pulse needs attention; the strongest signal is ${dominantCategory.toLowerCase()}.${keywordSuffix}`;
}

export function buildInsights(entries) {
  const safeEntries = Array.isArray(entries) ? entries : [];
  const categoryCounts = Object.fromEntries(KNOWN_CATEGORIES.map((category) => [category, 0]));
  let totalWords = 0;
  const normalizedEntries = safeEntries
    .map(normalizeEntry)
    .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt));

  normalizedEntries.forEach((entry) => {
    totalWords += entry.wordCount ?? 0;
    categoryCounts[entry.category] = (categoryCounts[entry.category] ?? 0) + 1;
  });

  const rankedCategories = Object.entries(categoryCounts).sort(([leftName, leftCount], [rightName, rightCount]) => {
    if (rightCount !== leftCount) {
      return rightCount - leftCount;
    }

    return leftName.localeCompare(rightName);
  });

  const commonKeywords = extractKeywords(
    normalizedEntries
      .map((entry) => entry.text ?? '')
      .join(' '),
    8,
  );
  const recentEntries = normalizedEntries.slice(-5);
  const stressedRecentCount = recentEntries.filter((entry) => entry.category === 'Stressed').length;
  const streak = buildStreak(normalizedEntries);
  const pulseScore =
    normalizedEntries.length === 0
      ? 65
      : clamp(
          Math.round(
            normalizedEntries.reduce((total, entry) => total + CATEGORY_PULSE[entry.category], 0) /
              normalizedEntries.length -
              (stressedRecentCount >= 2 ? 7 : 0),
          ),
          0,
          100,
        );
  const dominantCategory = safeEntries.length === 0 ? 'Balanced' : rankedCategories[0][0];

  return {
    totalEntries: safeEntries.length,
    averageWordCount: safeEntries.length === 0 ? 0 : Number((totalWords / safeEntries.length).toFixed(1)),
    dominantCategory,
    categoryCounts,
    commonKeywords,
    pulseScore,
    streak,
    riskLevel: stressedRecentCount >= 2 ? 'Elevated' : pulseScore >= 70 ? 'Low' : 'Watch',
    teamSummary: buildTeamSummary({ dominantCategory, pulseScore, commonKeywords, streak, stressedRecentCount }),
    recentTrend: recentEntries.map((entry) => ({
      id: entry.id,
      category: entry.category,
      score: CATEGORY_PULSE[entry.category],
      createdAt: entry.createdAt,
    })),
  };
}
