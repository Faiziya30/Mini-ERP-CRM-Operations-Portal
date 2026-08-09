const AuthField = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  autoComplete,
  icon: Icon,
  rightElement,
  name,
  required = false,
  disabled = false
}) => {
  return (
    <div className="auth-field-group">
      <label htmlFor={id} className="auth-label">
        {label}
        {required ? <span aria-hidden="true">*</span> : null}
      </label>

      <div className={`auth-input-shell ${error ? 'has-error' : ''}`}>
        {Icon ? <Icon className="auth-input-icon" size={18} aria-hidden="true" /> : null}
        <input
          id={id}
          className="auth-input"
          type={type}
          name={name}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          required={required}
          disabled={disabled}
        />
        {rightElement ? <div className="auth-input-action">{rightElement}</div> : null}
      </div>

      {error ? (
        <p id={`${id}-error`} className="auth-field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default AuthField;