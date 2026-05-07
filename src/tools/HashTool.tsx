import { useEffect, useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';

const ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;

async function hash(algo: typeof ALGORITHMS[number], text: string) {
  const buf = new TextEncoder().encode(text);
  const out = await crypto.subtle.digest(algo, buf);
  return [...new Uint8Array(out)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Pure-JS MD5 (Public Domain — Joseph Myers)
function md5(str: string) {
  function r(n: number, b: number) {
    return (n << b) | (n >>> (32 - b));
  }
  function add32(a: number, b: number) {
    return (a + b) & 0xffffffff;
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return add32(r(add32(add32(a, (b & c) | (~b & d)), add32(x, t)), s), b);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return add32(r(add32(add32(a, (b & d) | (c & ~d)), add32(x, t)), s), b);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return add32(r(add32(add32(a, b ^ c ^ d), add32(x, t)), s), b);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return add32(r(add32(add32(a, c ^ (b | ~d)), add32(x, t)), s), b);
  }
  function toBytes(s: string) {
    const utf = unescape(encodeURIComponent(s));
    const out: number[] = [];
    for (let i = 0; i < utf.length; i++) out.push(utf.charCodeAt(i));
    return out;
  }
  const bytes = toBytes(str);
  const len = bytes.length * 8;
  bytes.push(0x80);
  while ((bytes.length % 64) !== 56) bytes.push(0);
  for (let i = 0; i < 8; i++) bytes.push((len >>> (i * 8)) & 0xff);
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  for (let i = 0; i < bytes.length; i += 64) {
    const x: number[] = [];
    for (let j = 0; j < 16; j++) {
      x[j] = bytes[i + j * 4] | (bytes[i + j * 4 + 1] << 8) | (bytes[i + j * 4 + 2] << 16) | (bytes[i + j * 4 + 3] << 24);
    }
    const aa = a, bb = b, cc = c, dd = d;
    a = ff(a, b, c, d, x[0], 7, -680876936); d = ff(d, a, b, c, x[1], 12, -389564586); c = ff(c, d, a, b, x[2], 17, 606105819); b = ff(b, c, d, a, x[3], 22, -1044525330);
    a = ff(a, b, c, d, x[4], 7, -176418897); d = ff(d, a, b, c, x[5], 12, 1200080426); c = ff(c, d, a, b, x[6], 17, -1473231341); b = ff(b, c, d, a, x[7], 22, -45705983);
    a = ff(a, b, c, d, x[8], 7, 1770035416); d = ff(d, a, b, c, x[9], 12, -1958414417); c = ff(c, d, a, b, x[10], 17, -42063); b = ff(b, c, d, a, x[11], 22, -1990404162);
    a = ff(a, b, c, d, x[12], 7, 1804603682); d = ff(d, a, b, c, x[13], 12, -40341101); c = ff(c, d, a, b, x[14], 17, -1502002290); b = ff(b, c, d, a, x[15], 22, 1236535329);
    a = gg(a, b, c, d, x[1], 5, -165796510); d = gg(d, a, b, c, x[6], 9, -1069501632); c = gg(c, d, a, b, x[11], 14, 643717713); b = gg(b, c, d, a, x[0], 20, -373897302);
    a = gg(a, b, c, d, x[5], 5, -701558691); d = gg(d, a, b, c, x[10], 9, 38016083); c = gg(c, d, a, b, x[15], 14, -660478335); b = gg(b, c, d, a, x[4], 20, -405537848);
    a = gg(a, b, c, d, x[9], 5, 568446438); d = gg(d, a, b, c, x[14], 9, -1019803690); c = gg(c, d, a, b, x[3], 14, -187363961); b = gg(b, c, d, a, x[8], 20, 1163531501);
    a = gg(a, b, c, d, x[13], 5, -1444681467); d = gg(d, a, b, c, x[2], 9, -51403784); c = gg(c, d, a, b, x[7], 14, 1735328473); b = gg(b, c, d, a, x[12], 20, -1926607734);
    a = hh(a, b, c, d, x[5], 4, -378558); d = hh(d, a, b, c, x[8], 11, -2022574463); c = hh(c, d, a, b, x[11], 16, 1839030562); b = hh(b, c, d, a, x[14], 23, -35309556);
    a = hh(a, b, c, d, x[1], 4, -1530992060); d = hh(d, a, b, c, x[4], 11, 1272893353); c = hh(c, d, a, b, x[7], 16, -155497632); b = hh(b, c, d, a, x[10], 23, -1094730640);
    a = hh(a, b, c, d, x[13], 4, 681279174); d = hh(d, a, b, c, x[0], 11, -358537222); c = hh(c, d, a, b, x[3], 16, -722521979); b = hh(b, c, d, a, x[6], 23, 76029189);
    a = hh(a, b, c, d, x[9], 4, -640364487); d = hh(d, a, b, c, x[12], 11, -421815835); c = hh(c, d, a, b, x[15], 16, 530742520); b = hh(b, c, d, a, x[2], 23, -995338651);
    a = ii(a, b, c, d, x[0], 6, -198630844); d = ii(d, a, b, c, x[7], 10, 1126891415); c = ii(c, d, a, b, x[14], 15, -1416354905); b = ii(b, c, d, a, x[5], 21, -57434055);
    a = ii(a, b, c, d, x[12], 6, 1700485571); d = ii(d, a, b, c, x[3], 10, -1894986606); c = ii(c, d, a, b, x[10], 15, -1051523); b = ii(b, c, d, a, x[1], 21, -2054922799);
    a = ii(a, b, c, d, x[8], 6, 1873313359); d = ii(d, a, b, c, x[15], 10, -30611744); c = ii(c, d, a, b, x[6], 15, -1560198380); b = ii(b, c, d, a, x[13], 21, 1309151649);
    a = ii(a, b, c, d, x[4], 6, -145523070); d = ii(d, a, b, c, x[11], 10, -1120210379); c = ii(c, d, a, b, x[2], 15, 718787259); b = ii(b, c, d, a, x[9], 21, -343485551);
    a = add32(a, aa); b = add32(b, bb); c = add32(c, cc); d = add32(d, dd);
  }
  function hex(n: number) {
    let s = '';
    for (let i = 0; i < 4; i++) s += ((n >>> (i * 8)) & 0xff).toString(16).padStart(2, '0');
    return s;
  }
  return hex(a) + hex(b) + hex(c) + hex(d);
}

export function HashTool() {
  const [input, setInput] = useState('Hello, DevForge!');
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [uuids, setUuids] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const out: Record<string, string> = { MD5: md5(input) };
      for (const algo of ALGORITHMS) {
        out[algo] = await hash(algo, input);
      }
      if (!cancelled) setHashes(out);
    })();
    return () => {
      cancelled = true;
    };
  }, [input]);

  function genUuids(n: number) {
    const arr = Array.from({ length: n }, () => crypto.randomUUID());
    setUuids(arr);
  }

  return (
    <ToolLayout title="Hash & UUID" description="Generate cryptographic hashes and UUIDs.">
      <div className="grid h-full grid-cols-2 overflow-hidden">
        <div className="flex flex-col border-r border-border p-5 overflow-hidden">
          <label className="label">Text</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="textarea h-32"
          />
          <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
            {Object.entries(hashes).map(([algo, h]) => (
              <div
                key={algo}
                className="rounded-md border border-border bg-bg-subtle p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-accent">
                    {algo}
                  </span>
                  <button className="btn !py-0.5 !text-xs" onClick={() => navigator.clipboard.writeText(h)}>
                    Copy
                  </button>
                </div>
                <div className="mt-1 break-all font-mono text-xs text-text">{h}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col p-5 overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">UUID v4 Generator</h2>
            <div className="flex gap-2">
              <button className="btn" onClick={() => genUuids(1)}>1</button>
              <button className="btn" onClick={() => genUuids(10)}>10</button>
              <button className="btn btn-primary" onClick={() => genUuids(50)}>50</button>
            </div>
          </div>
          <div className="mt-4 flex-1 space-y-1 overflow-y-auto rounded-md border border-border bg-bg-subtle p-3 font-mono text-xs">
            {uuids.length === 0 ? (
              <div className="text-text-dim">Click a number above to generate UUIDs.</div>
            ) : (
              uuids.map((u, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border-subtle py-1 last:border-b-0">
                  <span className="text-text">{u}</span>
                  <button className="text-text-dim hover:text-accent" onClick={() => navigator.clipboard.writeText(u)}>copy</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
