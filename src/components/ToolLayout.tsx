import { ReactNode } from 'react';

interface ToolLayoutProps {
  title: string;
  description?: string;
  toolbar?: ReactNode;
  children: ReactNode;
}

export function ToolLayout({ title, description, toolbar, children }: ToolLayoutProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-bg-panel px-5 py-3">
        <div>
          <h1 className="text-base font-semibold text-text">{title}</h1>
          {description && (
            <p className="mt-0.5 text-xs text-text-muted">{description}</p>
          )}
        </div>
        {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
