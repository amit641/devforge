import { useMemo, useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';

const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

function b64urlDecode(input: string) {
  let s = input.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  try {
    return decodeURIComponent(
      atob(s)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return atob(s);
  }
}

export function JwtTool() {
  const [token, setToken] = useState(SAMPLE);

  const decoded = useMemo(() => {
    const parts = token.trim().split('.');
    if (parts.length < 2)
      return { error: 'JWT must have at least 2 parts (header.payload).' };
    try {
      const header = JSON.parse(b64urlDecode(parts[0]));
      const payload = JSON.parse(b64urlDecode(parts[1]));
      const signature = parts[2] ?? '';
      return { header, payload, signature, error: null };
    } catch (e: any) {
      return { error: e.message };
    }
  }, [token]);

  const expInfo = useMemo(() => {
    if (decoded.error || !decoded.payload) return null;
    const p: any = decoded.payload;
    const out: { label: string; value: string; cls: string }[] = [];
    if (p.exp) {
      const d = new Date(p.exp * 1000);
      const now = Date.now();
      const expired = d.getTime() < now;
      out.push({
        label: 'exp',
        value: `${d.toLocaleString()} (${expired ? 'EXPIRED' : 'valid'})`,
        cls: expired ? 'text-danger' : 'text-success',
      });
    }
    if (p.iat) out.push({ label: 'iat', value: new Date(p.iat * 1000).toLocaleString(), cls: 'text-text-muted' });
    if (p.nbf) out.push({ label: 'nbf', value: new Date(p.nbf * 1000).toLocaleString(), cls: 'text-text-muted' });
    return out;
  }, [decoded]);

  return (
    <ToolLayout title="JWT Decoder" description="Inspect JSON Web Token header, payload and claims.">
      <div className="grid h-full grid-cols-2 gap-0">
        <div className="flex flex-col border-r border-border p-5">
          <label className="label">Encoded</label>
          <textarea
            className="textarea h-48 break-all"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            spellCheck={false}
          />
          {decoded.error ? (
            <div className="mt-3 rounded-md border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              {decoded.error}
            </div>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <ColoredPart label="HEADER" cls="bg-pink-500/10 text-pink-400 border-pink-500/30" value={token.split('.')[0]} />
                <ColoredPart label="PAYLOAD" cls="bg-purple-500/10 text-purple-400 border-purple-500/30" value={token.split('.')[1]} />
                <ColoredPart label="SIGNATURE" cls="bg-sky-500/10 text-sky-400 border-sky-500/30" value={token.split('.')[2] ?? ''} />
              </div>
              {expInfo && expInfo.length > 0 && (
                <div className="mt-4">
                  <div className="label">Claims</div>
                  <div className="space-y-1.5 rounded-md border border-border bg-bg-subtle p-3">
                    {expInfo.map((c) => (
                      <div key={c.label} className="flex justify-between text-xs">
                        <span className="font-mono text-text-muted">{c.label}</span>
                        <span className={`font-mono ${c.cls}`}>{c.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="overflow-y-auto p-5">
          <div className="space-y-4">
            <Section title="Header" data={decoded.header} />
            <Section title="Payload" data={decoded.payload} />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

function ColoredPart({ label, value, cls }: { label: string; value: string; cls: string }) {
  return (
    <div className={`rounded-md border px-2 py-2 ${cls}`}>
      <div className="text-[10px] font-bold tracking-wider opacity-70">{label}</div>
      <div className="mt-1 break-all font-mono text-[11px] leading-tight">
        {value || '—'}
      </div>
    </div>
  );
}

function Section({ title, data }: { title: string; data: any }) {
  return (
    <div>
      <div className="label">{title}</div>
      <pre className="overflow-x-auto rounded-md border border-border bg-bg-subtle p-3 font-mono text-xs leading-relaxed text-text">
        {data ? JSON.stringify(data, null, 2) : '—'}
      </pre>
    </div>
  );
}
