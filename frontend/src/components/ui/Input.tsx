import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?:     string
  error?:     string
  hint?:      string
  icon?:      ReactNode
  iconRight?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, className = '', ...props }, ref) => {
    const inputClass = [
      'gc-input',
      icon      ? 'has-icon-left'  : '',
      iconRight ? 'has-icon-right' : '',
      error     ? 'gc-input-error' : '',
      className,
    ].filter(Boolean).join(' ')

    return (
      <div className="gc-field">
        {label && <label className="gc-label">{label}</label>}
        <div className="gc-input-wrap">
          {icon      && <span className="gc-input-icon-left">{icon}</span>}
          <input ref={ref} className={inputClass} {...props} />
          {iconRight && <span className="gc-input-icon-right">{iconRight}</span>}
        </div>
        {error && <p className="gc-field-error">{error}</p>}
        {hint && !error && <p className="gc-field-hint">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, children, className = '', ...props }, ref) => {
    return (
      <div className="gc-field">
        {label && <label className="gc-label">{label}</label>}
        <select
          ref={ref}
          className={['gc-select', error ? 'gc-select-error' : '', className].filter(Boolean).join(' ')}
          {...props}
        >
          {children}
        </select>
        {error && <p className="gc-field-error">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="gc-field">
        {label && <label className="gc-label">{label}</label>}
        <textarea
          ref={ref}
          className={['gc-textarea', error ? 'gc-input-error' : '', className].filter(Boolean).join(' ')}
          {...props}
        />
        {error && <p className="gc-field-error">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export default Input
