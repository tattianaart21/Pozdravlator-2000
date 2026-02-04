import './Input.css';

export function Input({ label, id, error, className = '', ...props }) {
  const inputId = id ?? props.name ?? label?.toLowerCase()?.replace(/\s/g, '-');
  return (
    <div className={`input-group ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="input-group__label">
          {label}
        </label>
      )}
      <input id={inputId} className="input-group__input" {...props} />
      {error && <span className="input-group__error">{error}</span>}
    </div>
  );
}

export function Textarea({ label, id, error, className = '', ...props }) {
  const inputId = id ?? props.name ?? label?.toLowerCase()?.replace(/\s/g, '-');
  return (
    <div className={`input-group ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="input-group__label">
          {label}
        </label>
      )}
      <textarea id={inputId} className="input-group__textarea" {...props} />
      {error && <span className="input-group__error">{error}</span>}
    </div>
  );
}
