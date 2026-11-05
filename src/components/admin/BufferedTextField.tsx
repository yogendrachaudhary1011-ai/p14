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
  const draftRef = useRef(value);
  const focused = useRef(false);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  useEffect(() => {
    if (!focused.current) {
      draftRef.current = value;
      setDraft(value);
    }
  }, [value]);

  return (
    <input
      {...props}
      value={draft}
      onFocus={(event) => {
        focused.current = true;
        draftRef.current = event.currentTarget.value;
        props.onFocus?.(event);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.currentTarget.blur();
        }
        props.onKeyDown?.(event);
      }}
      onChange={(event) => {
        draftRef.current = event.target.value;
        setDraft(event.target.value);
      }}
      onBlur={(event) => {
        focused.current = false;
        const nextValue = draftRef.current;
        if (nextValue !== value) onCommitRef.current(nextValue);
        props.onBlur?.(event);
      }}
    />
  );
};

const BufferedTextareaField: React.FC<BufferedTextareaProps> = ({ value, onCommit, ...props }) => {
  const [draft, setDraft] = useState(value);
  const draftRef = useRef(value);
  const focused = useRef(false);
  const onCommitRef = useRef(onCommit);
  onCommitRef.current = onCommit;

  useEffect(() => {
    if (!focused.current) {
      draftRef.current = value;
      setDraft(value);
    }
  }, [value]);

  return (
    <textarea
      {...props}
      value={draft}
      onFocus={(event) => {
        focused.current = true;
        draftRef.current = event.currentTarget.value;
        props.onFocus?.(event);
      }}
      onChange={(event) => {
        draftRef.current = event.target.value;
        setDraft(event.target.value);
      }}
      onBlur={(event) => {
        focused.current = false;
        const nextValue = draftRef.current;
        if (nextValue !== value) onCommitRef.current(nextValue);
        props.onBlur?.(event);
      }}
    />
  );
};

export const BufferedTextInput = BufferedTextInputField;
export const BufferedTextarea = BufferedTextareaField;
