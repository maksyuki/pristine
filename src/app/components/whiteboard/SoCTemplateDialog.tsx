import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import type { SoCTemplate, SoCTemplateTag } from './types';
import { defaultSoCTemplateList } from './constants';
import drawioImageSrc from '../../../assets/images/demo.drawio.svg';

interface SoCTemplateDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  socSearchInput: string;
  onSetSoCSearchInput: (v: string) => void;
  socTemplateOption: string;
  socTemplateInstanceNum: string;
  socTemplateTags: SoCTemplateTag[];
  onSelectTemplate: (item: SoCTemplate) => void;
}

const statusColorMap: Record<string, string> = {
  success: 'bg-green-500',
  warn: 'bg-yellow-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
};

export const SoCTemplateDialog: React.FC<SoCTemplateDialogProps> = ({
  open, onOpenChange,
  socSearchInput, onSetSoCSearchInput,
  socTemplateOption, socTemplateInstanceNum, socTemplateTags,
  onSelectTemplate,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[var(--wb-overlay-bg)] z-[200]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] border border-[var(--wb-glass-border)] rounded-2xl bg-[var(--wb-glass-bg)] overflow-hidden backdrop-blur-[35px] max-w-[50rem] w-full shadow-md outline-none">
          {/* Search header */}
          <div className="flex w-full items-center justify-between p-4 gap-4">
            <div className="flex flex-1 items-center gap-2">
              <i className="ri-search-line text-[var(--wb-glass-text)]" />
              <input
                value={socSearchInput}
                onChange={(e) => onSetSoCSearchInput(e.target.value)}
                type="text"
                placeholder="Search templates and more..."
                className="flex-1 border-0 bg-transparent shadow-none outline-0 text-[var(--wb-glass-text)] text-base leading-normal placeholder:text-[var(--wb-glass-text-secondary)]"
              />
            </div>
            <span className="p-1 bg-[var(--wb-glass-btn-bg)] border-[var(--wb-glass-border)] border rounded-md text-[var(--wb-glass-text)] text-xs">⌘K</span>
          </div>

          <div className="border-t border-[var(--wb-glass-border)]">
            <div className="flex flex-col md:flex-row">
              {/* Template list */}
              <div className="flex-1 p-3 md:border-b-0 border-b border-[var(--wb-glass-border)]">
                <div className="flex flex-col gap-1">
                  {defaultSoCTemplateList.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-transparent hover:bg-[var(--wb-glass-btn-hover)] hover:border-[var(--wb-glass-border)] text-[var(--wb-glass-text-secondary)] hover:text-[var(--wb-glass-text)] cursor-pointer"
                      onClick={() => onSelectTemplate(item)}
                    >
                      <i className="ri-file-line text-base leading-normal" />
                      <span className="flex-1 text-base leading-normal">{item.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${statusColorMap[item.status.tag] ?? 'bg-gray-500'} text-white`}>
                        {item.status.name}
                      </span>
                      <i className="ri-arrow-right-s-line text-base leading-normal" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Detail pane */}
              <div className="flex-1 border-l border-[var(--wb-glass-border)] py-4 px-3 flex flex-col items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-fit h-[100px] shadow-md rounded-lg">
                    <img src={drawioImageSrc} alt="SoC template" className="w-fit h-[100px] object-cover rounded-lg" />
                  </div>
                  <span className="text-base text-[var(--wb-glass-text)] font-medium text-center">{socTemplateOption}</span>
                </div>

                <div className="flex items-center gap-2 w-full">
                  {['copy', 'info', 'eye', 'star'].map((icon, i) => (
                    <button
                      key={i}
                      className="p-2 flex-1 rounded-md bg-[var(--wb-glass-btn-bg)] hover:bg-[var(--wb-glass-btn-hover)] transition-all group"
                    >
                      <i className={`ri-${icon === 'copy' ? 'file-copy' : icon === 'info' ? 'information' : icon === 'eye' ? 'eye' : 'star'}-line text-base leading-normal text-[var(--wb-glass-text-secondary)] group-hover:text-[var(--wb-glass-text)]`} />
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-2 w-full px-1 mt-1">
                  <div className="flex justify-between gap-2">
                    <span className="text-base font-medium text-[var(--wb-glass-text)]">Instance Num</span>
                    <span className="text-base text-[var(--wb-glass-text)]">{socTemplateInstanceNum}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-medium text-[var(--wb-glass-text)]">Location</span>
                    <div className="flex items-center gap-1">
                      <span className="text-base text-[var(--wb-glass-text)]">IP Marketplace/official/SoC/</span>
                      <span className="w-4 h-4 rounded-full flex items-center justify-center bg-[var(--wb-glass-btn-bg)]">
                        <i className="ri-folder-open-line text-[15px] leading-normal text-[var(--wb-glass-text-secondary)]" />
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium text-[var(--wb-glass-text)]">Tags</span>
                    <div className="flex items-center">
                      {socTemplateTags.map((tag, i) => (
                        <div key={i} className="flex items-center gap-1 mr-2">
                          <span className={`w-3 h-3 rounded-full ${tag.color}`} />
                          <span className="text-base text-[var(--wb-glass-text)]">{tag.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 flex items-center bg-[var(--wb-glass-btn-bg)] border-t border-[var(--wb-glass-border)] gap-3">
            <div className="group flex items-center gap-1 leading-none">
              <span className="text-xs text-[var(--wb-glass-text-secondary)] group-hover:text-[var(--wb-glass-text)] p-1 min-w-5 flex items-center justify-center rounded-md border border-[var(--wb-glass-border)] bg-[var(--wb-glass-btn-bg)]">⏎</span>
              <span className="text-xs text-[var(--wb-glass-text-secondary)] group-hover:text-[var(--wb-glass-text)]">Select</span>
            </div>
            <div className="group flex items-center gap-1 leading-none">
              <span className="text-xs text-[var(--wb-glass-text-secondary)] group-hover:text-[var(--wb-glass-text)] p-1 min-w-5 flex items-center justify-center rounded-md border border-[var(--wb-glass-border)] bg-[var(--wb-glass-btn-bg)]">↑</span>
              <span className="text-xs text-[var(--wb-glass-text-secondary)] group-hover:text-[var(--wb-glass-text)] p-1 min-w-5 flex items-center justify-center rounded-md border border-[var(--wb-glass-border)] bg-[var(--wb-glass-btn-bg)]">↓</span>
              <span className="text-xs text-[var(--wb-glass-text-secondary)] group-hover:text-[var(--wb-glass-text)]">Navigate</span>
            </div>
            <div className="group flex items-center gap-1 leading-none">
              <span className="text-xs text-[var(--wb-glass-text-secondary)] group-hover:text-[var(--wb-glass-text)] p-1 min-w-5 flex items-center justify-center rounded-md border border-[var(--wb-glass-border)] bg-[var(--wb-glass-btn-bg)]">esc</span>
              <span className="text-xs text-[var(--wb-glass-text-secondary)] group-hover:text-[var(--wb-glass-text)]">Close</span>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
