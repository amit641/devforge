export function TitleBar() {
  return (
    <div className="titlebar-drag flex h-9 shrink-0 items-center justify-center border-b border-border bg-bg-panel select-none">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-sm bg-accent" />
        <span className="text-xs font-semibold tracking-wider text-text-muted">
          DEVFORGE
        </span>
      </div>
    </div>
  );
}
