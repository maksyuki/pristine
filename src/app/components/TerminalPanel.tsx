import { Suspense, lazy } from 'react';

const TerminalSurface = lazy(() => import('./TerminalSurface').then((module) => ({ default: module.TerminalSurface })));

export function TerminalPanel() {
  return (
    <Suspense
      fallback={(
        <div className="flex h-full items-center justify-center bg-ide-editor-bg text-ide-text-muted text-[12px]">
          Initializing terminal...
        </div>
      )}
    >
      <TerminalSurface />
    </Suspense>
  );
}
