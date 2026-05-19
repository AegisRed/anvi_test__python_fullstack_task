import { useState } from 'react';
import { Check, Clock3, MessageSquareText, Pencil, Trash2, X } from 'lucide-react';
import { categoryClassName } from './categoryStyles.js';

const formatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function ReflectionSkeleton() {
  return (
    <div className="entry-stack" aria-label="Loading reflections">
      {[0, 1, 2].map((item) => (
        <article className="entry-card skeleton-card" key={item}>
          <span />
          <p />
          <p />
        </article>
      ))}
    </div>
  );
}

function EmptyState({ totalEntries }) {
  return (
    <div className="empty-state">
      <MessageSquareText size={30} aria-hidden="true" />
      <p>{totalEntries > 0 ? 'No reflections match the current filters.' : 'No reflections submitted yet.'}</p>
      <span>{totalEntries > 0 ? 'Adjust search or vibe filter.' : 'Submit one manually or load demo data.'}</span>
    </div>
  );
}

export function ReflectionList({ entries, totalEntries, isLoading, isBusy, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [draftText, setDraftText] = useState('');

  const startEditing = (entry) => {
    setEditingId(entry.id);
    setDraftText(entry.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraftText('');
  };

  const submitEdit = async (entry) => {
    const didUpdate = await onUpdate(entry.id, draftText);

    if (didUpdate) {
      cancelEditing();
    }
  };

  return (
    <section className="panel reflection-list" aria-label="Previous reflections">
      <div className="section-title">
        <MessageSquareText size={18} aria-hidden="true" />
        <h2>Previous Reflections</h2>
      </div>

      {isLoading ? (
        <ReflectionSkeleton />
      ) : entries.length === 0 ? (
        <EmptyState totalEntries={totalEntries} />
      ) : (
        <div className="entry-stack">
          {entries.map((entry) => {
            const isEditing = editingId === entry.id;

            return (
              <article className="entry-card" key={entry.id}>
                <div className="entry-meta">
                  <span className={`category-pill ${categoryClassName(entry.category)}`}>{entry.category}</span>
                  <span className="timestamp">
                    <Clock3 size={14} aria-hidden="true" />
                    {formatter.format(new Date(entry.createdAt))}
                  </span>
                  <span>{entry.wordCount} words</span>
                  <span>{entry.confidence ?? 0}% confidence</span>
                </div>

                {isEditing ? (
                  <textarea
                    className="edit-textarea"
                    value={draftText}
                    onChange={(event) => setDraftText(event.target.value)}
                    minLength={3}
                    maxLength={2000}
                    aria-label="Edit reflection"
                  />
                ) : (
                  <>
                    <p>{entry.text}</p>
                    <small className="entry-summary">{entry.summary}</small>
                  </>
                )}

                <div className="entry-footer">
                  {entry.keywords?.length > 0 && (
                    <div className="entry-keywords">
                      {entry.keywords.slice(0, 4).map((keyword) => (
                        <span key={keyword.word}>{keyword.word}</span>
                      ))}
                    </div>
                  )}

                  <div className="icon-actions">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => submitEdit(entry)}
                          disabled={isBusy || draftText.trim().length < 3}
                          aria-label="Save reflection"
                        >
                          <Check size={16} aria-hidden="true" />
                        </button>
                        <button type="button" onClick={cancelEditing} disabled={isBusy} aria-label="Cancel editing">
                          <X size={16} aria-hidden="true" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" onClick={() => startEditing(entry)} disabled={isBusy} aria-label="Edit reflection">
                          <Pencil size={16} aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => onDelete(entry.id)} disabled={isBusy} aria-label="Delete reflection">
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
