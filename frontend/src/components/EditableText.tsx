import { useState, useRef, useEffect, type KeyboardEvent } from 'react';

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  placeholder?: string;
  as?: 'h1' | 'p' | 'span';
  className?: string;
  inputClassName?: string;
  required?: boolean;
  maxLength?: number;
  multiline?: boolean;
}

export function EditableText({
  value,
  onSave,
  placeholder = 'Click to edit',
  as: Component = 'span',
  className = '',
  inputClassName = '',
  required = false,
  maxLength,
  multiline = false,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const trimmedValue = editValue.trim();

    if (required && !trimmedValue) {
      setEditValue(value);
      setIsEditing(false);
      return;
    }

    if (trimmedValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(trimmedValue);
      setIsEditing(false);
    } catch {
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Enter' && multiline && e.metaKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    const sharedProps = {
      ref: inputRef as never,
      value: editValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setEditValue(e.target.value),
      onBlur: handleSave,
      onKeyDown: handleKeyDown,
      disabled: isSaving,
      maxLength,
      className: `w-full bg-cream border border-warmsand rounded px-2 py-1 text-warmcharcoal focus:outline-none focus:ring-2 focus:ring-softblue ${inputClassName}`,
    };

    if (multiline) {
      return (
        <textarea
          {...sharedProps}
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          rows={3}
          placeholder={placeholder}
        />
      );
    }

    return (
      <input
        {...sharedProps}
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        placeholder={placeholder}
      />
    );
  }

  const displayValue = value || placeholder;
  const isPlaceholder = !value;

  const sharedDisplayProps = {
    onClick: () => setIsEditing(true),
    className: `cursor-pointer hover:bg-warmsand/30 rounded px-1 -mx-1 transition-colors ${
      isPlaceholder ? 'text-softbrowngray italic' : ''
    } ${className}`,
    tabIndex: 0,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsEditing(true);
      }
    },
    'aria-label': `Edit ${displayValue}`,
  };

  return <Component {...sharedDisplayProps}>{displayValue}</Component>;
}
