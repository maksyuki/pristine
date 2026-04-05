import {
  Files, Bug, Hammer, Play,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Separator } from './ui/separator';
import { Button } from './ui/button';

interface ActivityBarProps {
  activeView: string;
  onItemSelect: (view: string) => void;
  isLeftSidebarHidden?: boolean;
}

const topItems = [
  { id: 'explorer', icon: Files, label: 'Explorer' },
  { id: 'debug', icon: Bug, label: 'Run & Debug' },
];

const actionItems = [
  { id: 'compile', icon: Hammer, label: 'Compile' },
  { id: 'run', icon: Play, label: 'Run' },
  { id: 'debug-action', icon: Bug, label: 'Debug' },
] as const;

export function ActivityBar({ activeView, onItemSelect, isLeftSidebarHidden = false }: ActivityBarProps) {
  return (
    <TooltipProvider delayDuration={400}>
      <div className="flex flex-col items-center w-12 bg-muted/40 border-r border-border shrink-0 z-10">
        <div className="flex flex-col flex-1">
          {topItems.map(({ id, icon: Icon, label }) => (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  title={label}
                  aria-label={label}
                  data-testid={`activity-item-${id}`}
                  onClick={() => onItemSelect(id)}
                  className={`relative w-12 h-12 flex items-center justify-center transition-colors ${
                    activeView === id && !isLeftSidebarHidden
                      ? 'text-foreground border-l-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground border-l-2 border-transparent'
                  }`}
                >
                  <Icon size={20} strokeWidth={1.5} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Separator className="w-8" />

        <div className="flex flex-col items-center gap-1.5 px-1.5 py-2 shrink-0">
          {actionItems.map(({ id, icon: Icon, label }) => (
            <Tooltip key={id}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  title={label}
                  aria-label={label}
                  data-testid={`activity-action-${id}`}
                  className="h-9 w-9 text-emerald-500 hover:text-emerald-400"
                >
                  <Icon size={18} strokeWidth={1.7} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}