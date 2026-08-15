import React, { useId } from 'react';
import { cn } from '../utils/cn';

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
    <div data-slot="formfield" className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label
          htmlFor={fieldId}
          className={cn('text-sm font-semibold text-text-2', labelClassName)}
        >
          {label}
          {required && (
            <>
              <span className="text-red ms-1" aria-hidden="true">*</span>
              <span className="sr-only"> (wajib diisi)</span>
            </>
          )}
        </label>
      )}

      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        const isFormControl = typeof child.type === 'string' && ['input', 'select', 'textarea'].includes(child.type);
        const shouldAttachId = isFormControl || index === 0;
        return React.cloneElement(child, {
          ...(shouldAttachId ? { id: child.props.id || fieldId } : {}),
          required,
          'aria-required': required ? true : undefined,
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
export { FormField };
