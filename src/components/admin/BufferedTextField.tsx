import React, { useEffect, useRef, useState } from 'react';

type BufferedInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
  value: string;
  onCommit: (value: string) => void;
};

type BufferedTextareaProps = Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> & {
  value: string;
  onCommit: (value: string) => void;
};

export const BufferedTextInput: React.FC<BufferedInputProps> = ({ value, onCommit, ...props }) => {
  const [draft, setDraft] = useState(value);
  const focused = useRef(false);

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
        if (draft !== value) onCommit(draft);
        props.onBlur?.(event);
      }}
    />
  );
};

export const BufferedTextarea: React.FC<BufferedTextareaProps> = ({ value, onCommit, ...props }) => {
  const [draft, setDraft] = useState(value);
  const focused = useRef(false);

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
        if (draft !== value) onCommit(draft);
        props.onBlur?.(event);
      }}
    />
  );
};

