import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TitleBar } from './components/TitleBar';
import { TOOLS, ToolId } from './tools';

export default function App() {
  const [active, setActive] = useState<ToolId>('playground');
  const Tool = TOOLS.find((t) => t.id === active)!.component;

  return (
    <div className="flex h-screen w-screen flex-col bg-bg text-text">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={active} onSelect={setActive} />
        <main className="flex-1 overflow-hidden bg-bg">
          <Tool />
        </main>
      </div>
    </div>
  );
}
