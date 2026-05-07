import { useState } from 'react';
import { ToolLayout } from '../components/ToolLayout';

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([a-f\d]{3}|[a-f\d]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let s = m[1];
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

export function ColorTool() {
  const [hex, setHex] = useState('#7c5cff');
  const rgb = hexToRgb(hex) ?? [0, 0, 0];
  const hsl = rgbToHsl(...rgb);

  const palette = generatePalette(hex);

  return (
    <ToolLayout title="Color" description="Convert between HEX, RGB, HSL with live preview and palette.">
      <div className="grid h-full grid-cols-[300px_1fr] overflow-hidden">
        <div className="flex flex-col border-r border-border p-5">
          <input
            type="color"
            value={hex.length === 7 ? hex : '#000000'}
            onChange={(e) => setHex(e.target.value)}
            className="h-32 w-full cursor-pointer rounded-md border border-border bg-transparent"
          />
          <div className="mt-4 space-y-3">
            <Field label="HEX" value={hex} onChange={setHex} mono />
            <Field
              label="RGB"
              value={`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`}
              mono
              onChange={(v) => {
                const m = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/.exec(v);
                if (m) setHex(rgbToHex(+m[1], +m[2], +m[3]));
              }}
            />
            <Field
              label="HSL"
              value={`hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`}
              mono
              onChange={(v) => {
                const m = /hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/.exec(v);
                if (m) {
                  const [r, g, b] = hslToRgb(+m[1], +m[2], +m[3]);
                  setHex(rgbToHex(r, g, b));
                }
              }}
            />
          </div>
        </div>

        <div className="overflow-y-auto p-5">
          <h2 className="text-sm font-semibold text-text">Tints & Shades</h2>
          <div className="mt-3 grid grid-cols-11 overflow-hidden rounded-md border border-border">
            {palette.map((c, i) => {
              const [r, g, b] = hexToRgb(c)!;
              const isLight = (r * 299 + g * 587 + b * 114) / 1000 > 128;
              return (
                <button
                  key={i}
                  onClick={() => setHex(c)}
                  className="flex aspect-square items-end justify-center p-1 text-[10px] font-mono transition hover:scale-105"
                  style={{ background: c, color: isLight ? '#000' : '#fff' }}
                  title={c}
                >
                  {c}
                </button>
              );
            })}
          </div>

          <h2 className="mt-6 text-sm font-semibold text-text">Preview</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div
              className="flex h-32 items-center justify-center rounded-md text-xl font-bold"
              style={{ background: hex, color: '#fff' }}
            >
              Sample on color
            </div>
            <div
              className="flex h-32 items-center justify-center rounded-md border-2 text-xl font-bold"
              style={{ borderColor: hex, color: hex }}
            >
              Outlined text
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

function Field({ label, value, onChange, mono }: { label: string; value: string; onChange: (v: string) => void; mono?: boolean }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input ${mono ? 'font-mono' : ''}`}
      />
    </div>
  );
}

function generatePalette(hex: string): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [];
  const [h, s] = rgbToHsl(...rgb);
  const stops = [95, 88, 78, 68, 58, 50, 42, 32, 22, 14, 8];
  return stops.map((l) => {
    const [r, g, b] = hslToRgb(h, s, l);
    return rgbToHex(r, g, b);
  });
}
