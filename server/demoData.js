const now = Date.now();
const hour = 60 * 60 * 1000;

export const demoReflections = [
  {
    text: 'Focused morning. Shipped the onboarding polish, solved two bugs, and completed the rollout notes.',
    createdAt: new Date(now - 7 * hour).toISOString(),
  },
  {
    text: 'Paired with the team on review feedback. We aligned quickly and moved the prototype forward together.',
    createdAt: new Date(now - 6 * hour).toISOString(),
  },
  {
    text: 'A little stressed by the deadline and a blocked deploy, but the plan is clearer now.',
    createdAt: new Date(now - 5 * hour).toISOString(),
  },
  {
    text: 'Brainstormed a fresh design concept and explored a creative experiment for the insights panel.',
    createdAt: new Date(now - 4 * hour).toISOString(),
  },
  {
    text: 'Productive sync with support. We delivered a small fix and gathered useful customer feedback.',
    createdAt: new Date(now - 3 * hour).toISOString(),
  },
  {
    text: 'Feeling tired after a chaotic incident, but the team stayed together and documented the follow-up.',
    createdAt: new Date(now - 2 * hour).toISOString(),
  },
];
