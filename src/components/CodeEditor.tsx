import Editor, { OnMount } from '@monaco-editor/react';
import { useEffect, useRef } from 'react';

interface CodeEditorProps {
  value: string;
  language?: string;
  onChange?: (val: string) => void;
  onRun?: () => void;
  readOnly?: boolean;
}

export function CodeEditor({
  value,
  language = 'javascript',
  onChange,
  onRun,
  readOnly,
}: CodeEditorProps) {
  const onRunRef = useRef(onRun);
  onRunRef.current = onRun;

  const handleMount: OnMount = (editor, monaco) => {
    editor.addAction({
      id: 'run-code',
      label: 'Run code',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => onRunRef.current?.(),
    });
  };

  useEffect(() => {
    // Disable noisy unused-var lints
  }, []);

  return (
    <Editor
      value={value}
      language={language}
      theme="vs-dark"
      onChange={(v) => onChange?.(v ?? '')}
      onMount={handleMount}
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        fontFamily: 'SF Mono, JetBrains Mono, Menlo, monospace',
        fontLigatures: true,
        smoothScrolling: true,
        scrollBeyondLastLine: false,
        readOnly,
        tabSize: 2,
        padding: { top: 12, bottom: 12 },
        renderLineHighlight: 'line',
        wordWrap: 'on',
        automaticLayout: true,
      }}
    />
  );
}
