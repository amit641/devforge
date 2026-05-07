import { useEffect, useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';

export function TimestampTool() {
  const [now, setNow] = useState(() => Date.now());
  const [tsInput, setTsInput] = useState<string>(() => String(Math.floor(Date.now() / 1000)));
  const [dateInput, setDateInput] = useState<string>(() => new Date().toISOString());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  let tsResult: { ms: number; date: Date; rel: string } | null = null;
  try {
    let n = Number(tsInput);
    if (!Number.isFinite(n)) throw new Error();
    if (n < 1e12) n = n * 1000; // looks like seconds
    const d = new Date(n);
    if (isNaN(d.getTime())) throw new Error();
    tsResult = { ms: n, date: d, rel: relTime(n - Date.now()) };
  } catch {
    /* invalid */
  }

  let dateResult: { ms: number; date: Date } | null = null;
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) throw new Error();
    dateResult = { ms: d.getTime(), date: d };
  } catch {
    /* invalid */
  }

  return (
    <ToolLayout title="Timestamp" description="Convert between Unix timestamps and human-readable dates.">
      <div className="grid h-full grid-cols-2 gap-0 overflow-y-auto">
        <div className="border-r border-border p-5">
          <div className="rounded-md border border-border bg-bg-subtle p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-text-muted">Now</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <Row k="Unix (s)" v={String(Math.floor(now / 1000))} />
              <Row k="Unix (ms)" v={String(now)} />
              <Row k="ISO 8601" v={new Date(now).toISOString()} />
              <Row k="Local" v={new Date(now).toLocaleString()} />
            </div>
          </div>

          <div className="mt-6">
            <label className="label">Timestamp → Date</label>
            <input
              value={tsInput}
              onChange={(e) => setTsInput(e.target.value)}
              className="input font-mono"
              placeholder="1704067200 or 1704067200000"
            />
            {tsResult ? (
              <div className="mt-3 space-y-1.5 rounded-md border border-border bg-bg-subtle p-3 text-xs">
                <Row k="ISO" v={tsResult.date.toISOString()} />
                <Row k="UTC" v={tsResult.date.toUTCString()} />
                <Row k="Local" v={tsResult.date.toLocaleString()} />
                <Row k="Relative" v={tsResult.rel} />
              </div>
            ) : (
              <div className="mt-2 text-xs text-danger">Invalid timestamp.</div>
            )}
          </div>
        </div>

        <div className="p-5">
          <div className="rounded-md border border-border bg-bg-subtle p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-text-muted">Common Timestamps</div>
            <div className="mt-2 space-y-1 text-xs font-mono">
              {commonTimestamps().map((c) => (
                <div key={c.label} className="flex items-center justify-between border-b border-border-subtle py-1 last:border-b-0">
                  <span className="text-text-muted">{c.label}</span>
                  <button
                    onClick={() => setTsInput(String(c.ts))}
                    className="text-accent hover:underline"
                  >
                    {c.ts}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label className="label">Date → Timestamp</label>
            <input
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="input font-mono"
              placeholder="2026-01-01T00:00:00Z"
            />
            {dateResult ? (
              <div className="mt-3 space-y-1.5 rounded-md border border-border bg-bg-subtle p-3 text-xs">
                <Row k="Unix (s)" v={String(Math.floor(dateResult.ms / 1000))} />
                <Row k="Unix (ms)" v={String(dateResult.ms)} />
                <Row k="ISO" v={dateResult.date.toISOString()} />
              </div>
            ) : (
              <div className="mt-2 text-xs text-danger">Invalid date.</div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-text-muted">{k}</span>
      <button
        className="truncate font-mono text-text hover:text-accent"
        onClick={() => navigator.clipboard.writeText(v)}
        title="Copy"
      >
        {v}
      </button>
    </div>
  );
}

function relTime(diff: number) {
  const abs = Math.abs(diff);
  const sec = Math.round(abs / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  const dir = diff > 0 ? 'in' : 'ago';
  if (sec < 60) return `${sec}s ${dir}`;
  if (min < 60) return `${min}m ${dir}`;
  if (hr < 24) return `${hr}h ${dir}`;
  if (day < 365) return `${day}d ${dir}`;
  return `${Math.round(day / 365)}y ${dir}`;
}

function commonTimestamps() {
  const now = Math.floor(Date.now() / 1000);
  return [
    { label: 'Now', ts: now },
    { label: '1 hour ago', ts: now - 3600 },
    { label: '1 day ago', ts: now - 86400 },
    { label: '1 week ago', ts: now - 604800 },
    { label: '30 days ago', ts: now - 2592000 },
    { label: '1 year ago', ts: now - 31536000 },
    { label: 'Unix epoch', ts: 0 },
    { label: 'Y2K', ts: 946684800 },
  ];
}
