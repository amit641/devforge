import { useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';

type Mode = 'base64' | 'url' | 'html';

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function htmlEncode(s: string) {
  return s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}
function htmlDecode(s: string) {
  const el = document.createElement('textarea');
  el.innerHTML = s;
  return el.value;
}

function safeBase64Encode(s: string) {
  return btoa(unescape(encodeURIComponent(s)));
}
function safeBase64Decode(s: string) {
  return decodeURIComponent(escape(atob(s)));
}

export function EncodersTool() {
  const [mode, setMode] = useState<Mode>('base64');
  const [input, setInput] = useState('Hello, DevForge! 🚀');

  let encoded = '';
  let decoded = '';
  let encErr: string | null = null;
  let decErr: string | null = null;

  try {
    if (mode === 'base64') encoded = safeBase64Encode(input);
    if (mode === 'url') encoded = encodeURIComponent(input);
    if (mode === 'html') encoded = htmlEncode(input);
  } catch (e: any) {
    encErr = e.message;
  }
  try {
    if (mode === 'base64') decoded = safeBase64Decode(input);
    if (mode === 'url') decoded = decodeURIComponent(input);
    if (mode === 'html') decoded = htmlDecode(input);
  } catch (e: any) {
    decErr = e.message;
  }

  const tabs: { id: Mode; label: string }[] = [
    { id: 'base64', label: 'Base64' },
    { id: 'url', label: 'URL' },
    { id: 'html', label: 'HTML Entities' },
  ];

  return (
    <ToolLayout title="Encoders" description="Encode and decode Base64, URL, and HTML entities.">
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 gap-1 border-b border-border bg-bg-panel px-4 py-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setMode(t.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                mode === t.id
                  ? 'bg-accent-subtle text-text border border-accent/40'
                  : 'text-text-muted hover:bg-bg-hover hover:text-text border border-transparent'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="grid flex-1 grid-cols-1 gap-0 overflow-hidden md:grid-cols-3">
          <Panel title="Input" value={input} onChange={setInput} />
          <Panel title="Encoded" value={encoded} readOnly error={encErr} onChange={() => {}} />
          <Panel title="Decoded" value={decoded} readOnly error={decErr} onChange={() => {}} />
        </div>
      </div>
    </ToolLayout>
  );
}

function Panel({
  title,
  value,
  onChange,
  readOnly,
  error,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  error?: string | null;
}) {
  return (
    <div className="flex h-full flex-col border-r border-border last:border-r-0">
      <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          {title}
        </span>
        {value && (
          <button className="btn !py-0.5 !text-xs" onClick={() => navigator.clipboard.writeText(value)}>
            Copy
          </button>
        )}
      </div>
      {error ? (
        <div className="m-4 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          spellCheck={false}
          className="textarea flex-1 rounded-none border-0"
        />
      )}
    </div>
  );
}
