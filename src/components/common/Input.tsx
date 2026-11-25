import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  /** Optional leading icon rendered inside the control. */
  startIcon?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, startIcon, endAdornment, ...rest },
  ref,
) {
  const control = (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'field-control hide-spin-button',
        startIcon && 'ps-10',
        endAdornment && 'pe-11',
        invalid && 'field-error',
        className,
      )}
      {...rest}
    />
  );

  if (!startIcon && !endAdornment) return control;

  return (
    <div className="relative">
      {startIcon && (
        <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-subtle">
          {startIcon}
        </span>
      )}
      {control}
      {endAdornment && (
        <span className="absolute inset-y-0 end-1.5 flex items-center">{endAdornment}</span>
      )}
    </div>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, rows = 5, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn('field-control resize-y leading-relaxed', invalid && 'field-error', className)}
      {...rest}
    />
  );
});
