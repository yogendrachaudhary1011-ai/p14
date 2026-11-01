import React, { useEffect, useRef } from 'react';

type BufferedInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
  value: string;
  onCommit: (value: string) => void;
};

type BufferedTextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> & {
  value: string;
  onCommit: (value: string) => void;
};

const BufferedTextInputField: React.FC<BufferedInputProps> = ({ value, onCommit, ...props }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const focused = useRef(false);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  useEffect(() => {
    if (!focused.current && inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  return (
    <input
      {...props}
      ref={inputRef}
      defaultValue={value}
      onFocus={(event) => {
        focused.current = true;
        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        focused.current = false;
        if (event.currentTarget.value !== value) onCommitRef.current(event.currentTarget.value);
        props.onBlur?.(event);
      }}
    />
  );
};

const BufferedTextareaField: React.FC<BufferedTextareaProps> = ({ value, onCommit, ...props }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const focused = useRef(false);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  useEffect(() => {
    if (!focused.current && textareaRef.current && textareaRef.current.value !== value) {
      textareaRef.current.value = value;
    }
  }, [value]);

  return (
    <textarea
      {...props}
      ref={textareaRef}
      defaultValue={value}
      onFocus={(event) => {
        focused.current = true;
        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        focused.current = false;
        if (event.currentTarget.value !== value) onCommitRef.current(event.currentTarget.value);
        props.onBlur?.(event);
      }}
    />
  );
};

const equalInputProps = <T extends { onCommit: (value: string) => void }>(previous: T, next: T) => {
  const previousProps = previous as Record<string, unknown>;
  const nextProps = next as Record<string, unknown>;
  const keys = new Set([...Object.keys(previousProps), ...Object.keys(nextProps)]);
  keys.delete('onCommit');
  return [...keys].every((key) => Object.is(previousProps[key], nextProps[key]));
};

export const BufferedTextInput = React.memo(BufferedTextInputField, equalInputProps);
export const BufferedTextarea = React.memo(BufferedTextareaField, equalInputProps);

