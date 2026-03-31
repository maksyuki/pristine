import React from 'react';
import type { SoCInPagePanelSelected, SoCPanelAddr } from './types';
import { defaultSoCPanelAddr } from './constants';

interface SoCInPagePanelsProps {
  veSoCInPagePanelSelected: SoCInPagePanelSelected;
  veSoCInPagePanelFiles: string;
  veSoCInPagePanelFilelist: string;
  veSoCInPagePanelGitAddr: string;
  veSoCInPagePanelGitURL: boolean;
  onSetGitURL: (v: boolean) => void;
  onConfirmClick?: () => void;
}

export const SoCInPagePanels: React.FC<SoCInPagePanelsProps> = ({
  veSoCInPagePanelSelected,
  veSoCInPagePanelFiles,
  veSoCInPagePanelFilelist,
  veSoCInPagePanelGitAddr,
  veSoCInPagePanelGitURL,
  onSetGitURL,
  onConfirmClick,
}) => {
  return (
    <>
      {/* CORE panel */}
      {veSoCInPagePanelSelected === 'CORE' && (
        <div className="absolute top-40 left-56">
          <div className="flex flex-col w-56 h-fit rounded-2xl border-[var(--wb-glass-border)] bg-[var(--wb-glass-bg)] backdrop-blur-[35px] shadow-md">
            <div className="flex items-center justify-center text-base font-bold text-[var(--wb-glass-text)]">CORE</div>
            <div className="flex justify-center items-center gap-2 mt-2">
              <input disabled value={veSoCInPagePanelFiles} className="flex text-base text-center text-[var(--wb-glass-text)] w-36 py-1 rounded-md bg-transparent" />
              <button className="flex bg-[var(--wb-glass-btn-bg)] rounded-lg w-12 py-2 justify-center items-center cursor-pointer transition-all text-[var(--wb-glass-text)] hover:bg-[var(--wb-glass-btn-hover)]">
                <i className="ri-upload-line" />
              </button>
            </div>
            <div className="flex justify-center items-center gap-2 my-2">
              <input disabled value={veSoCInPagePanelFilelist} className="flex text-base text-center text-[var(--wb-glass-text)] w-36 py-1 rounded-md bg-transparent" />
              <button className="flex bg-[var(--wb-glass-btn-bg)] rounded-lg w-12 py-2 justify-center items-center cursor-pointer transition-all text-[var(--wb-glass-text)] hover:bg-[var(--wb-glass-btn-hover)]">
                <i className="ri-upload-line" />
              </button>
            </div>
            <hr className="flex justify-center text-[var(--wb-glass-text)] font-light m-2" />
            <div className="flex justify-center items-center gap-2 my-2">
              <input disabled value={veSoCInPagePanelGitAddr} className="flex text-base text-center text-[var(--wb-glass-text)] w-36 py-1 rounded-md bg-transparent" />
              <button
                className={`w-10 h-5 rounded-full flex items-center transition-all cursor-pointer ${veSoCInPagePanelGitURL ? 'bg-blue-500 justify-end' : 'bg-gray-400 justify-start'}`}
                onClick={() => onSetGitURL(!veSoCInPagePanelGitURL)}
              >
                <div className="w-4 h-4 rounded-full bg-white mx-0.5" />
              </button>
            </div>
            <div className="flex justify-center mt-2 mb-4">
              <button
                className="flex text-base bg-[var(--wb-glass-btn-bg)] rounded-lg px-4 py-2 items-center cursor-pointer transition-all text-[var(--wb-glass-text)] hover:bg-[var(--wb-glass-btn-hover)]"
                onClick={onConfirmClick}
              >confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* RCU panel */}
      {veSoCInPagePanelSelected === 'RCU' && (
        <div className="absolute top-40 right-40">
          <div className="flex flex-col w-64 h-fit rounded-2xl border-[var(--wb-glass-border)] bg-[var(--wb-glass-bg)] backdrop-blur-[35px] shadow-md">
            <div className="flex items-center justify-center text-base font-bold text-[var(--wb-glass-text)]">RCU</div>
            <div className="flex justify-center items-center gap-1 mt-2">
              <div className="text-base text-center text-[var(--wb-glass-text)]">EXTCLK: </div>
              <div className="flex text-base text-center bg-[var(--wb-glass-btn-bg)] rounded-lg w-fit px-2 py-1 justify-center items-center cursor-pointer transition-all text-[var(--wb-glass-text)] hover:bg-[var(--wb-glass-btn-hover)]">
                25~100 MHz
              </div>
            </div>
            <div className="flex justify-center items-center gap-1 mt-1">
              <div className="text-base text-center text-[var(--wb-glass-text)]">OSCCLK: </div>
              <div className="flex text-base text-center bg-[var(--wb-glass-btn-bg)] rounded-lg w-fit px-2 py-1 justify-center items-center cursor-pointer transition-all text-[var(--wb-glass-text)] hover:bg-[var(--wb-glass-btn-hover)]">
                25~100 MHz
              </div>
            </div>
            <hr className="flex justify-center text-[var(--wb-glass-text)] font-light m-2" />
            <div className="grid grid-rows-2 grid-cols-[1fr_auto_1fr_auto_1fr] justify-items-center items-center text-base text-[var(--wb-glass-text)]">
              <div>EXT</div><div>---</div>
              <div className="text-base text-center bg-[var(--wb-glass-btn-bg)] row-span-2 rounded-lg w-fit px-1 py-2 justify-center items-center cursor-pointer transition-all text-[var(--wb-glass-text)] hover:bg-[var(--wb-glass-btn-hover)]">bypass</div>
              <div>---</div><div>CORE</div>
              <div>OSC</div><div>---</div><div> </div>
            </div>
            <hr className="flex justify-center text-[var(--wb-glass-text)] font-light m-2" />
            <div className="grid grid-rows-3 grid-cols-[1fr_auto_1fr_auto_1fr] justify-items-center items-center text-base text-[var(--wb-glass-text)] mb-2">
              <div>CORE</div><div>---</div>
              <div className="text-base text-center bg-[var(--wb-glass-btn-bg)] rounded-lg w-fit px-1 p-1 cursor-pointer transition-all text-[var(--wb-glass-text)] hover:bg-[var(--wb-glass-btn-hover)]">div2/4</div>
              <div>---</div><div>SPIFS</div>
              <div>CORE</div><div>---</div>
              <div className="text-base text-center bg-[var(--wb-glass-btn-bg)] rounded-lg w-fit px-1 pb-1 cursor-pointer transition-all text-[var(--wb-glass-text)] hover:bg-[var(--wb-glass-btn-hover)]">div2</div>
              <div>---</div><div>PSRAM</div>
              <div>CORE</div><div>---</div>
              <div className="text-base text-center bg-[var(--wb-glass-btn-bg)] rounded-lg w-fit px-1 pb-1 cursor-pointer transition-all text-[var(--wb-glass-text)] hover:bg-[var(--wb-glass-btn-hover)]">div2</div>
              <div>---</div><div>QSPI</div>
            </div>
          </div>
        </div>
      )}

      {/* BUS panel */}
      {veSoCInPagePanelSelected === 'BUS' && (
        <div className="absolute top-40 right-32">
          <div className="flex flex-col w-72 h-fit rounded-2xl border-[var(--wb-glass-border)] bg-[var(--wb-glass-bg)] backdrop-blur-[35px] shadow-md">
            <div className="flex items-center justify-center text-base font-bold text-[var(--wb-glass-text)]">BUS</div>
            <hr className="flex justify-center text-[var(--wb-glass-text)] font-light m-2" />
            <div className="flex justify-center items-center gap-2">
              <div className="text-sm text-center bg-[var(--wb-glass-btn-bg)] rounded-lg w-fit px-1 py-1 cursor-pointer transition-all text-[var(--wb-glass-text)] hover:bg-[var(--wb-glass-btn-hover)]">AXIL</div>
              <div className="text-sm text-center text-[var(--wb-glass-text)]">{'<===>'}</div>
              <div className="text-sm text-center bg-[var(--wb-glass-btn-bg)] rounded-lg w-fit px-1 py-1 cursor-pointer transition-all text-[var(--wb-glass-text)] hover:bg-[var(--wb-glass-btn-hover)]">NATIVE</div>
              <div className="text-sm text-center text-[var(--wb-glass-text)]">{'<===>'}</div>
              <div className="text-sm text-center bg-[var(--wb-glass-btn-bg)] rounded-lg w-fit px-1 py-1 cursor-pointer transition-all text-[var(--wb-glass-text)] hover:bg-[var(--wb-glass-btn-hover)]">APB</div>
            </div>
            <hr className="flex justify-center text-[var(--wb-glass-text)] font-light m-2" />
            <div className="flex flex-col gap-1 mx-2 mb-4">
              {defaultSoCPanelAddr.map((item, idx) => (
                <div key={idx} className="flex justify-start items-center gap-1 text-base font-normal text-[var(--wb-glass-text)]">
                  <div className="min-w-14 font-bold">{item.name}</div>
                  <div className="flex-1 text-sm text-center bg-[var(--wb-glass-btn-bg)] rounded-lg w-fit px-1 py-1 cursor-pointer transition-all text-[var(--wb-glass-text)] hover:bg-[var(--wb-glass-btn-hover)]">
                    {item.addr}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
