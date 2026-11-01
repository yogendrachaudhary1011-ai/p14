import React, { useEffect, useRef, useState } from 'react';

type BufferedInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
  value: string;
  onCommit: (value: string) => void;
};

type BufferedTextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> & {
  value: string;
  onCommit: (value: string) => void;
};

const BufferedTextInputField: React.FC<BufferedInputProps> = ({ value, onCommit, ...props }) => {
  const [draft, setDraft] = useState(value);
  const focused = useRef(false);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  useEffect(() => {
    if (!focused.current) setDraft(value);
  }, [value]);

  return (
    <input
      {...props}
      value={draft}
      onFocus={(event) => {
        focused.current = true;
        props.onFocus?.(event);
      }}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={(event) => {
        focused.current = false;
        if (draft !== value) onCommitRef.current(draft);
        props.onBlur?.(event);
      }}
    />
  );
};

const BufferedTextareaField: React.FC<BufferedTextareaProps> = ({ value, onCommit, ...props }) => {
  const [draft, setDraft] = useState(value);
  const focused = useRef(false);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  useEffect(() => {
    if (!focused.current) setDraft(value);
  }, [value]);

  return (
    <textarea
      {...props}
      value={draft}
      onFocus={(event) => {
        focused.current = true;
        props.onFocus?.(event);
      }}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={(event) => {
        focused.current = false;
        if (draft !== value) onCommitRef.current(draft);
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

