import React from 'react';
import { 
  Sliders, 
  Layers, 
  Download, 
  Upload, 
  Play, 
  Cpu, 
  FolderArchive,
  ShieldCheck,
  FileJson,
  Terminal,
  MousePointer
} from 'lucide-react';
import { MasterGestureConfig } from '../types/gestures';

export type AppTab = 'studio' | 'simulator' | 'multi_mouse' | 'python_pkg' | 'macros' | 'portable' | 'architecture';

interface NavbarProps {
  currentTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
  config: MasterGestureConfig;
  onUpdateConfig: (newConfig: MasterGestureConfig) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onChangeTab,
  config,
  onUpdateConfig,
}) => {
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profiles || parsed.devices) {
          onUpdateConfig(parsed);
        }
      } catch (err) {
        alert('Invalid configuration JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#222833] bg-[#0c0e12]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between font-mono">
        {/* Brand / Logo - Utilitarian Industrial */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#1c222b] border border-[#333d4e] flex items-center justify-center text-slate-100 shadow-inner">
            <MousePointer className="w-4 h-4 text-slate-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-100 text-sm tracking-widest uppercase">
                MASTER<span className="text-amber-400">GESTURE</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#161a22] text-[#9ca3af] border border-[#2b3341]">
                v1.0 // UTILITARIAN
              </span>
            </div>
            <p className="text-[10px] text-[#6b7280]">
              MX Master Python Gesture Engine
            </p>
          </div>
        </div>

        {/* View Switcher Tabs - Utilitarian Matte Buttons */}
        <nav className="flex items-center bg-[#13161c] p-0.5 rounded border border-[#222833] text-xs">
          <button
            onClick={() => onChangeTab('studio')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-medium transition-all ${
              currentTab === 'studio'
                ? 'bg-[#28313e] text-white font-bold shadow-sm'
                : 'text-[#808997] hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>MAPPING</span>
          </button>

          <button
            onClick={() => onChangeTab('simulator')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-medium transition-all ${
              currentTab === 'simulator'
                ? 'bg-[#28313e] text-white font-bold shadow-sm'
                : 'text-[#808997] hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>ARENA &amp; LATENCY</span>
          </button>

          <button
            onClick={() => onChangeTab('multi_mouse')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-medium transition-all ${
              currentTab === 'multi_mouse'
                ? 'bg-[#28313e] text-white font-bold shadow-sm'
                : 'text-[#808997] hover:text-slate-200'
            }`}
          >
            <FileJson className="w-3.5 h-3.5 text-amber-400" />
            <span>MULTI-MOUSE JSON</span>
          </button>

          <button
            onClick={() => onChangeTab('python_pkg')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-medium transition-all ${
              currentTab === 'python_pkg'
                ? 'bg-[#28313e] text-white font-bold shadow-sm'
                : 'text-[#808997] hover:text-slate-200'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
            <span>PYTHON SUITE (.ZIP)</span>
          </button>

          <button
            onClick={() => onChangeTab('portable')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-medium transition-all ${
              currentTab === 'portable'
                ? 'bg-[#28313e] text-white font-bold shadow-sm'
                : 'text-[#808997] hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>STARTUP</span>
          </button>

          <button
            onClick={() => onChangeTab('architecture')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-[11px] font-medium transition-all ${
              currentTab === 'architecture'
                ? 'bg-[#28313e] text-white font-bold shadow-sm'
                : 'text-[#808997] hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>NATIVE CORE</span>
          </button>
        </nav>

        {/* Global Controls & JSON Export */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161a22] border border-[#2b3341] text-[#9ca3af] hover:text-white hover:bg-[#202530] transition-all"
            title="Download config.json"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CONFIG.JSON</span>
          </button>

          <label
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161a22] border border-[#2b3341] text-[#9ca3af] hover:text-white hover:bg-[#202530] transition-all cursor-pointer"
            title="Import config.json"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">IMPORT</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </header>
  );
};
