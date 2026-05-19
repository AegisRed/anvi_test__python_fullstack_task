export const categoryLabels = ['Productive', 'Stressed', 'Creative', 'Collaborative', 'Balanced'];

export function categoryClassName(category) {
  return `category-${String(category ?? 'Balanced').toLowerCase()}`;
}
