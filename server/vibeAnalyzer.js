export const CATEGORY_KEYWORDS = {
  Productive: {
    complete: 2,
    completed: 2,
    deliver: 2,
    delivered: 2,
    done: 1,
    focus: 2,
    focused: 2,
    milestone: 2,
    planned: 1,
    progress: 2,
    productive: 3,
    ship: 2,
    shipped: 2,
    solved: 2,
  },
  Stressed: {
    anxious: 2,
    blocked: 3,
    bug: 1,
    bugs: 1,
    chaotic: 2,
    deadline: 2,
    exhausted: 3,
    exhausting: 3,
    fire: 2,
    overwhelmed: 3,
    pressure: 2,
    stressed: 3,
    stuck: 2,
    tired: 2,
  },
  Creative: {
    brainstorm: 2,
    concept: 1,
    creative: 3,
    design: 2,
    experiment: 2,
    experimenting: 2,
    explored: 2,
    idea: 1,
    ideas: 2,
    imagine: 2,
    inspiration: 2,
    prototype: 2,
    sketch: 2,
  },
  Collaborative: {
    aligned: 2,
    collaborated: 3,
    collaboration: 3,
    feedback: 2,
    paired: 3,
    review: 1,
    sync: 2,
    team: 2,
    together: 2,
    workshop: 2,
  },
};

const STOP_WORDS = new Set([
  'about',
  'after',
  'again',
  'also',
  'and',
  'are',
  'because',
  'been',
  'but',
  'can',
  'could',
  'day',
  'did',
  'for',
  'from',
  'had',
  'has',
  'have',
  'into',
  'just',
  'our',
  'out',
  'over',
  'really',
  'some',
  'that',
  'the',
  'their',
  'then',
  'there',
  'this',
  'today',
  'was',
  'were',
  'with',
  'work',
  'worked',
  'working',
]);

const INTENSIFIERS = new Set(['very', 'super', 'really', 'extremely', 'highly', 'massively']);
const NEGATORS = new Set(['not', 'never', 'no', 'without']);
const CATEGORY_ORDER = ['Productive', 'Stressed', 'Creative', 'Collaborative'];

export function tokenize(text) {
  if (typeof text !== 'string') {
    return [];
  }

  return text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'-]*/gu) ?? [];
}

export function extractKeywords(text, limit = 6) {
  const counts = new Map();

  tokenize(text)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
    .forEach((token) => counts.set(token, (counts.get(token) ?? 0) + 1));

  return [...counts.entries()]
    .sort(([leftWord, leftCount], [rightWord, rightCount]) => {
      if (rightCount !== leftCount) {
        return rightCount - leftCount;
      }

      return leftWord.localeCompare(rightWord);
    })
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

function modifierForToken(tokens, index) {
  const previous = tokens[index - 1];
  const twoBack = tokens[index - 2];

  if (NEGATORS.has(previous) || NEGATORS.has(twoBack)) {
    return -0.6;
  }

  if (INTENSIFIERS.has(previous)) {
    return 1.35;
  }

  return 1;
}

function summarize(category, confidence, matchedKeywords) {
  if (category === 'Balanced') {
    return 'No strong mood signal yet; the entry reads steady and neutral.';
  }

  const signal = confidence >= 75 ? 'strong' : confidence >= 50 ? 'clear' : 'light';
  const keywordText = matchedKeywords.slice(0, 3).join(', ');

  return `${signal[0].toUpperCase()}${signal.slice(1)} ${category.toLowerCase()} signal based on ${keywordText}.`;
}

export function analyzeReflection(text) {
  const tokens = tokenize(text);
  const scores = Object.fromEntries(CATEGORY_ORDER.map((category) => [category, 0]));
  const matchedKeywordSet = new Set();

  tokens.forEach((token, index) => {
    CATEGORY_ORDER.forEach((category) => {
      const weight = CATEGORY_KEYWORDS[category][token];

      if (!weight) {
        return;
      }

      const adjustedWeight = Number((weight * modifierForToken(tokens, index)).toFixed(2));
      scores[category] = Number((scores[category] + adjustedWeight).toFixed(2));
      matchedKeywordSet.add(token);
    });
  });

  const rankedScores = Object.entries(scores).sort(([leftName, leftScore], [rightName, rightScore]) => {
    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return leftName.localeCompare(rightName);
  });
  const [topCategory, topScore] = rankedScores[0];
  const totalSignal = Object.values(scores).reduce((total, score) => total + Math.max(0, score), 0);
  const category = topScore > 0 ? topCategory : 'Balanced';
  const confidence = category === 'Balanced' ? 28 : Math.min(96, Math.round((topScore / Math.max(1, totalSignal)) * 100));
  const matchedKeywords = [...matchedKeywordSet].sort();

  return {
    wordCount: tokens.length,
    category,
    confidence,
    score: topScore > 0 ? topScore : 0,
    scores,
    matchedKeywords,
    keywords: extractKeywords(text),
    summary: summarize(category, confidence, matchedKeywords),
  };
}
