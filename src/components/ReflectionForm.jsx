import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

export function ReflectionForm({ onSubmit, isSubmitting }) {
  const [text, setText] = useState('');
  const trimmedText = text.trim();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (trimmedText.length >= 3) {
      const didSubmit = await onSubmit(trimmedText);

      if (didSubmit) {
        setText('');
      }
    }
  };

  return (
    <form className="panel reflection-form" onSubmit={handleSubmit}>
      <div className="panel-header">
        <div>
          <p className="eyebrow">Daily Vibe Check</p>
          <h1>Team Reflection</h1>
        </div>
        <span className="status-badge">
          <Sparkles size={16} aria-hidden="true" />
          AI synthesis
        </span>
      </div>

      <label htmlFor="reflection">Reflection</label>
      <textarea
        id="reflection"
        name="reflection"
        minLength={3}
        maxLength={2000}
        onChange={(event) => setText(event.target.value)}
        placeholder="I shipped the dashboard polish, paired on review feedback, and still feel a little blocked by deploy timing."
        rows={7}
        value={text}
        required
      />

      <div className="form-actions">
        <button className="primary-button" type="submit" disabled={isSubmitting || trimmedText.length < 3}>
          <Send size={17} aria-hidden="true" />
          {isSubmitting ? 'Submitting' : 'Submit'}
        </button>
      </div>
    </form>
  );
}
