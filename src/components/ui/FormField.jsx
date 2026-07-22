import React, { useId } from 'react';

/**
 * Shared accessibility-first FormField wrapper
 * Automatically links label htmlFor to input id, handles aria-invalid & aria-describedby for errors (WCAG 3.3.1, 3.3.2).
 */
function FormField({
  label,
  id: customId,
  error,
  hint,
  required = false,
  className = '',
  labelClassName = '',
  children,
  readOnly = false,
}) {
  const generatedId = useId();
  const fieldId = customId || generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  const describedByIDs = [
    error ? errorId : null,
    hint ? hintId : null,
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={fieldId}
          className={`text-sm font-semibold text-text-2 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red ml-1" aria-hidden="true">*</span>}
        </label>
      )}

      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child, {
          id: fieldId,
          required,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': describedByIDs,
          'aria-readonly': readOnly ? true : undefined,
        });
      })}

      {hint && !error && (
        <span id={hintId} className="text-xs text-text-3 font-medium">
          {hint}
        </span>
      )}

      {error && (
        <span id={errorId} role="alert" className="text-xs text-red font-semibold">
          {error}
        </span>
      )}
    </div>
  );
}

export default FormField;
