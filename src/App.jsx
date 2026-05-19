import { useEffect, useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  deleteReflection,
  fetchReflections,
  loadDemoReflections,
  submitReflection,
  updateReflection,
} from './api/reflections.js';
import { DashboardControls } from './components/DashboardControls.jsx';
import { InsightsPanel } from './components/InsightsPanel.jsx';
import { ReflectionForm } from './components/ReflectionForm.jsx';
import { ReflectionList } from './components/ReflectionList.jsx';
import { Toast } from './components/Toast.jsx';

const initialInsights = {
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
  pulseScore: 65,
  streak: {
    category: 'Balanced',
    count: 0,
    message: 'No streak yet.',
  },
  riskLevel: 'Low',
  teamSummary: 'No reflections yet.',
  recentTrend: [],
};

const initialFilters = {
  query: '',
  category: 'All',
  sort: 'newest',
};

function sortEntries(entries, sort) {
  const sortedEntries = [...entries];

  if (sort === 'oldest') {
    return sortedEntries.sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt));
  }

  if (sort === 'wordCount') {
    return sortedEntries.sort((left, right) => right.wordCount - left.wordCount);
  }

  if (sort === 'confidence') {
    return sortedEntries.sort((left, right) => (right.confidence ?? 0) - (left.confidence ?? 0));
  }

  return sortedEntries.sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

export default function App() {
  const [entries, setEntries] = useState([]);
  const [insights, setInsights] = useState(initialInsights);
  const [filters, setFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let isMounted = true;

    fetchReflections()
      .then((payload) => {
        if (!isMounted) {
          return;
        }

        setEntries(payload.entries ?? []);
        setInsights(payload.insights ?? initialInsights);
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const visibleEntries = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    const filteredEntries = entries.filter((entry) => {
      const matchesCategory = filters.category === 'All' || entry.category === filters.category;
      const matchesQuery =
        query.length === 0 ||
        entry.text.toLowerCase().includes(query) ||
        entry.category.toLowerCase().includes(query) ||
        entry.keywords?.some((keyword) => keyword.word.includes(query));

      return matchesCategory && matchesQuery;
    });

    return sortEntries(filteredEntries, filters.sort);
  }, [entries, filters]);

  const showSuccess = (message) => setToast({ type: 'success', message });

  const showError = (message) => {
    setError(message);
    setToast({ type: 'error', message });
  };

  const handleSubmit = async (text) => {
    setIsSubmitting(true);
    setError('');

    try {
      const payload = await submitReflection(text);
      setEntries((currentEntries) => [payload.entry, ...currentEntries]);
      setInsights(payload.insights ?? initialInsights);
      showSuccess('Reflection submitted.');
      return true;
    } catch (requestError) {
      showError(requestError.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id, text) => {
    setIsBusy(true);
    setError('');

    try {
      const payload = await updateReflection(id, text);
      setEntries((currentEntries) => currentEntries.map((entry) => (entry.id === id ? payload.entry : entry)));
      setInsights(payload.insights ?? initialInsights);
      showSuccess('Reflection updated.');
      return true;
    } catch (requestError) {
      showError(requestError.message);
      return false;
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async (id) => {
    setIsBusy(true);
    setError('');

    try {
      const payload = await deleteReflection(id);
      setEntries(payload.entries ?? []);
      setInsights(payload.insights ?? initialInsights);
      showSuccess('Reflection deleted.');
    } catch (requestError) {
      showError(requestError.message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleLoadDemo = async () => {
    setIsBusy(true);
    setError('');

    try {
      const payload = await loadDemoReflections();
      setEntries(payload.entries ?? []);
      setInsights(payload.insights ?? initialInsights);
      showSuccess('Demo data loaded.');
    } catch (requestError) {
      showError(requestError.message);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <main className="app-shell">
      <div className="top-strip">
        <span>Remote Team Pulse</span>
        <strong>{isLoading ? 'Syncing' : `${insights.totalEntries} reflections`}</strong>
      </div>

      {error && (
        <div className="error-banner" role="alert">
          <AlertCircle size={17} aria-hidden="true" />
          {error}
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />

      <div className="dashboard-grid">
        <div className="main-column">
          <ReflectionForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          <DashboardControls
            filters={filters}
            onFilterChange={(nextFilters) => setFilters((currentFilters) => ({ ...currentFilters, ...nextFilters }))}
            onLoadDemo={handleLoadDemo}
            isBusy={isBusy}
          />
          <ReflectionList
            entries={visibleEntries}
            totalEntries={entries.length}
            isLoading={isLoading}
            isBusy={isBusy}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </div>
        <InsightsPanel insights={insights} isLoading={isLoading} />
      </div>
    </main>
  );
}
