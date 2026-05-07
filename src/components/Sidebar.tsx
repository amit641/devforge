import { TOOLS, ToolId } from '../tools';

interface SidebarProps {
  active: ToolId;
  onSelect: (id: ToolId) => void;
}

export function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-bg-panel">
      <div className="flex-1 overflow-y-auto p-2">
        {TOOLS.map((t) => {
          const isActive = active === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className={`group mb-0.5 flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                isActive
                  ? 'bg-accent-subtle text-text border border-accent/40'
                  : 'text-text-muted hover:bg-bg-hover hover:text-text border border-transparent'
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center text-base">
                {t.icon}
              </span>
              <span className="font-medium">{t.name}</span>
            </button>
          );
        })}
      </div>
      <div className="border-t border-border px-3 py-2 text-[10px] uppercase tracking-wider text-text-dim">
        v0.1.0 · {(window as any).devforge?.platform ?? 'web'}
      </div>
    </aside>
  );
}
