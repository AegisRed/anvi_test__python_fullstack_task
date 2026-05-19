import { Database, Search } from 'lucide-react';
import { categoryLabels } from './categoryStyles.js';

export function DashboardControls({ filters, onFilterChange, onLoadDemo, isBusy }) {
  return (
    <section className="panel controls-panel" aria-label="Dashboard controls">
      <div className="search-field">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          value={filters.query}
          onChange={(event) => onFilterChange({ query: event.target.value })}
          placeholder="Search reflections"
          aria-label="Search reflections"
        />
      </div>

      <select
        value={filters.category}
        onChange={(event) => onFilterChange({ category: event.target.value })}
        aria-label="Filter by category"
      >
        <option value="All">All vibes</option>
        {categoryLabels.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <select
        value={filters.sort}
        onChange={(event) => onFilterChange({ sort: event.target.value })}
        aria-label="Sort reflections"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="wordCount">Most detailed</option>
        <option value="confidence">Highest confidence</option>
      </select>

      <button className="secondary-button" type="button" onClick={onLoadDemo} disabled={isBusy}>
        <Database size={17} aria-hidden="true" />
        Load demo
      </button>
    </section>
  );
}
