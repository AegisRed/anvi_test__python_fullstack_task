import { Activity, BarChart3, Gauge, Hash, ShieldAlert, TrendingUp } from 'lucide-react';
import { categoryClassName, categoryLabels } from './categoryStyles.js';

const metrics = [
  { key: 'totalEntries', label: 'Reflections', icon: Activity },
  { key: 'pulseScore', label: 'Pulse score', icon: Gauge },
  { key: 'dominantCategory', label: 'Top vibe', icon: TrendingUp },
  { key: 'averageWordCount', label: 'Avg. words', icon: BarChart3 },
];

function InsightSkeleton() {
  return (
    <section className="insights" aria-label="Insights">
      <div className="metric-grid">
        {[0, 1, 2, 3].map((item) => (
          <article className="metric-card skeleton-card" key={item}>
            <span />
            <p />
          </article>
        ))}
      </div>
      <div className="panel insight-panel skeleton-card tall" />
      <div className="panel insight-panel skeleton-card tall" />
    </section>
  );
}

export function InsightsPanel({ insights, isLoading }) {
  const safeInsights = insights ?? {
    totalEntries: 0,
    averageWordCount: 0,
    dominantCategory: 'Balanced',
    categoryCounts: {},
    commonKeywords: [],
    pulseScore: 65,
    streak: { message: 'No streak yet.', count: 0 },
    riskLevel: 'Low',
    teamSummary: 'No reflections yet.',
    recentTrend: [],
  };

  if (isLoading) {
    return <InsightSkeleton />;
  }

  const maxCount = Math.max(1, ...Object.values(safeInsights.categoryCounts ?? {}));

  return (
    <section className="insights" aria-label="Insights">
      <div className="metric-grid">
        {metrics.map(({ key, label, icon: Icon }) => (
          <article className="metric-card" key={key}>
            <div className="metric-icon">
              <Icon size={18} aria-hidden="true" />
            </div>
            <span>{label}</span>
            <strong title={String(safeInsights[key])}>{safeInsights[key]}</strong>
          </article>
        ))}
      </div>

      <div className="panel insight-panel pulse-panel">
        <div className="section-title">
          <ShieldAlert size={18} aria-hidden="true" />
          <h2>AI Synthesis</h2>
        </div>
        <div className="pulse-meter" aria-label={`Pulse score ${safeInsights.pulseScore} out of 100`}>
          <div style={{ width: `${safeInsights.pulseScore}%` }} />
        </div>
        <p className="team-summary">{safeInsights.teamSummary}</p>
        <div className="insight-meta-grid">
          <span>{safeInsights.riskLevel} risk</span>
          <span>{safeInsights.streak?.message}</span>
        </div>
      </div>

      <div className="panel insight-panel">
        <div className="section-title">
          <TrendingUp size={18} aria-hidden="true" />
          <h2>Recent Trend</h2>
        </div>
        {safeInsights.recentTrend.length > 0 ? (
          <div className="trend-strip" aria-label="Recent vibe trend">
            {safeInsights.recentTrend.map((item, index) => (
              <span
                className={`trend-dot ${categoryClassName(item.category)}`}
                key={item.id ?? `${item.category}-${index}`}
                title={item.category}
              />
            ))}
          </div>
        ) : (
          <p className="muted">No trend yet.</p>
        )}
      </div>

      <div className="panel insight-panel">
        <div className="section-title">
          <Hash size={18} aria-hidden="true" />
          <h2>Common Keywords</h2>
        </div>
        {safeInsights.commonKeywords.length > 0 ? (
          <div className="keyword-cloud">
            {safeInsights.commonKeywords.map((keyword) => (
              <span className="keyword-chip" key={keyword.word}>
                {keyword.word}
                <small>{keyword.count}</small>
              </span>
            ))}
          </div>
        ) : (
          <p className="muted">No keywords yet.</p>
        )}
      </div>

      <div className="panel insight-panel">
        <div className="section-title">
          <TrendingUp size={18} aria-hidden="true" />
          <h2>Vibe Mix</h2>
        </div>
        <div className="vibe-bars">
          {categoryLabels.map((category) => {
            const count = safeInsights.categoryCounts?.[category] ?? 0;
            const width = `${Math.round((count / maxCount) * 100)}%`;

            return (
              <div className="vibe-row" key={category}>
                <span className={`category-dot ${categoryClassName(category)}`} />
                <span>{category}</span>
                <div className="bar-track" aria-hidden="true">
                  <div className={`bar-fill ${categoryClassName(category)}`} style={{ width }} />
                </div>
                <strong>{count}</strong>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
