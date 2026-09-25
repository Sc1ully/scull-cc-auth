import { clsx } from 'clsx'
import { type FC, type InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input: FC<InputProps> = ({
  label,
  error,
  className,
  icon,
  ...props
}) => {
  return (
    <div className="form-field">
      {label && <label className="input-label">{label}</label>}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}>
            {icon}
          </span>
        )}
        <input
          className={clsx('input', error && 'input-error', icon && 'pl-10', className)}
          {...props}
        />
      </div>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  )
}

export const Textarea: FC<InputHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
}> = ({ label, error, className, ...props }) => {
  return (
    <div className="form-field">
      {label && <label className="input-label">{label}</label>}
      <textarea
        className={clsx('input', error && 'input-error', className)}
        rows={4}
        {...props}
      />
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  )
}
