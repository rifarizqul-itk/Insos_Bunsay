import React, { useId, createContext, useContext } from 'react';
import { cn } from '../utils/cn';

export const FormFieldContext = createContext(null);
export const useFormField = () => useContext(FormFieldContext);

function injectFormProps(child, fieldProps, isRootChild = false) {
  if (!React.isValidElement(child)) return child;

  const isFormControl = typeof child.type === 'string' && ['input', 'select', 'textarea'].includes(child.type);

  if (isFormControl) {
    return React.cloneElement(child, {
      id: child.props.id || fieldProps.id,
      required: child.props.required ?? fieldProps.required,
      'aria-required': fieldProps.required ? true : undefined,
      'aria-invalid': fieldProps.error ? true : undefined,
      'aria-describedby': fieldProps.describedByIDs || child.props['aria-describedby'],
      'aria-readonly': fieldProps.readOnly ? true : undefined,
    });
  }

  // If container element (e.g. <div> wrapping input and toggle button), traverse its children
  if (child.props && child.props.children) {
    let hasModifiedControl = false;
    const clonedChildren = React.Children.map(child.props.children, (nestedChild) => {
      const cloned = injectFormProps(nestedChild, fieldProps, false);
      if (cloned !== nestedChild) hasModifiedControl = true;
      return cloned;
    });

    if (hasModifiedControl) {
      return React.cloneElement(child, {}, clonedChildren);
    }
  }

  // Fallback for root single child if no input was found inside
  if (isRootChild) {
    return React.cloneElement(child, {
      id: child.props.id || fieldProps.id,
      required: child.props.required ?? fieldProps.required,
      'aria-required': fieldProps.required ? true : undefined,
      'aria-invalid': fieldProps.error ? true : undefined,
      'aria-describedby': fieldProps.describedByIDs || child.props['aria-describedby'],
      'aria-readonly': fieldProps.readOnly ? true : undefined,
    });
  }

  return child;
}

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

  const contextValue = {
    fieldId,
    errorId,
    hintId,
    describedByIDs,
    error,
    required,
    readOnly,
  };

  const fieldProps = {
    id: fieldId,
    describedByIDs,
    error,
    required,
    readOnly,
  };

  return (
    <FormFieldContext.Provider value={contextValue}>
      <div data-slot="formfield" className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <label
            htmlFor={fieldId}
            className={cn('text-sm sm:text-base font-bold text-text', labelClassName)}
          >
            {label}
            {required && (
              <>
                <span className="text-red ms-1 font-extrabold" aria-hidden="true">*</span>
                <span className="sr-only"> (wajib diisi)</span>
              </>
            )}
          </label>
        )}

        {React.Children.map(children, (child) => injectFormProps(child, fieldProps, true))}

        {hint && !error && (
          <span id={hintId} className="text-xs sm:text-sm text-text-3 font-medium">
            {hint}
          </span>
        )}

        {error && (
          <span id={errorId} role="alert" className="text-xs sm:text-sm text-red font-bold">
            {error}
          </span>
        )}
      </div>
    </FormFieldContext.Provider>
  );
}

export default FormField;
export { FormField };
