/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MasterGestureConfig, MouseButtonId, ButtonGestureConfig, AppProfile } from './types/gestures';
import { INITIAL_CONFIG } from './types/presets';
import { Navbar, AppTab } from './components/Navbar';
import { MouseVisualizer } from './components/MouseVisualizer';
import { GestureSimulator } from './components/GestureSimulator';
import { GestureConfigurator } from './components/GestureConfigurator';
import { ProfileManager } from './components/ProfileManager';
import { MacroEditor } from './components/MacroEditor';
import { ArchitectureDocs } from './components/ArchitectureDocs';
import { PortableSettingsPanel } from './components/PortableSettingsPanel';
import { MultiMouseConfigEditor } from './components/MultiMouseConfigEditor';
import { PythonPackageHub } from './components/PythonPackageHub';
import { Sliders, Play, Layers, Cpu, Compass, FolderArchive, FileJson, ArrowRight } from 'lucide-react';

const STORAGE_KEY = 'mastergesture_config_v1';

export default function App() {
  const [config, setConfig] = useState<MasterGestureConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return INITIAL_CONFIG;
  });

  const [currentTab, setCurrentTab] = useState<AppTab>('studio');
  const [selectedButtonId, setSelectedButtonId] = useState<MouseButtonId>('thumb_gesture');
  const [activePhysicalButton, setActivePhysicalButton] = useState<MouseButtonId | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Ignore
    }
  }, [config]);

  // Current active profile
  const activeProfile = config.profiles.find(p => p.id === config.activeProfileId) || config.profiles[0];
  const currentButtonConfig = activeProfile.buttons[selectedButtonId] || activeProfile.buttons.thumb_gesture;

  // Update button configuration within the active profile
  const handleUpdateButtonConfig = (newButtonConfig: ButtonGestureConfig) => {
    const updatedProfiles = config.profiles.map((prof) => {
      if (prof.id === activeProfile.id) {
        return {
          ...prof,
          buttons: {
            ...prof.buttons,
            [newButtonConfig.buttonId]: newButtonConfig,
          },
        };
      }
      return prof;
    });

    setConfig({
      ...config,
      profiles: updatedProfiles,
    });
  };

  const handleSelectProfile = (id: string) => {
    setConfig(prev => ({
      ...prev,
      activeProfileId: id,
    }));
  };

  const handleUpdateProfiles = (profiles: AppProfile[], activeId: string) => {
    setConfig(prev => ({
      ...prev,
      profiles,
      activeProfileId: activeId,
    }));
  };

  return (
    <div className="min-h-screen bg-[#0c0e12] text-slate-200 flex flex-col font-sans selection:bg-[#2c3545] selection:text-white">
      {/* Top Application Bar */}
      <Navbar
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        config={config}
        onUpdateConfig={setConfig}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Utilitarian Quick Status & Suite Banner */}
        <div className="p-3 px-4 rounded bg-[#11141b] border border-[#222833] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
              PYTHON STANDALONE LIBRARY READY
            </span>
            <span className="text-[#6b7280] hidden md:inline">
              // RAM: &lt; 25MB // LATENCY: &lt; 0.28ms // BOOT: &lt; 0.18s
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentTab('python_pkg')}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#202733] hover:bg-[#2b3545] text-slate-100 text-[11px] font-bold border border-[#333f52] transition-all"
            >
              <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
              <span>DOWNLOAD PYTHON SUITE (.ZIP)</span>
            </button>
            <button
              onClick={() => setCurrentTab('multi_mouse')}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#161a22] hover:bg-[#202530] text-[#9ca3af] hover:text-white text-[11px] border border-[#2b3341] transition-all"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>MULTI-MOUSE JSON</span>
            </button>
          </div>
        </div>

        {/* Profile Switcher Ribbon */}
        <ProfileManager
          config={config}
          activeProfileId={config.activeProfileId}
          onSelectProfile={handleSelectProfile}
          onUpdateProfiles={handleUpdateProfiles}
        />

        {/* Tab 1: Hardware Visualizer & Gesture Configurator Studio */}
        {currentTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Logitech MX Master 3S Hardware Visualizer */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <MouseVisualizer
                selectedButtonId={selectedButtonId}
                onSelectButton={setSelectedButtonId}
                activeButtonsConfig={activeProfile.buttons}
                activePhysicalButton={activePhysicalButton}
              />

              {/* Quick Launch into Simulator */}
              <div className="p-4 rounded-xl bg-[#11141b] border border-[#222833] flex items-center justify-between font-mono">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5 uppercase">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    LIVE ARENA &amp; LATENCY MONITOR
                  </div>
                  <p className="text-[11px] text-[#808997] mt-0.5 font-sans">
                    Measure sub-millisecond physical button to action response
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('simulator')}
                  className="px-3 py-1.5 rounded bg-[#242c3a] hover:bg-[#303a4c] text-white text-xs font-bold transition-all border border-[#3b4759]"
                >
                  TEST ARENA →
                </button>
              </div>
            </div>

            {/* Right Column: 5-Way Gesture & Action Configurator */}
            <div className="lg:col-span-7">
              <GestureConfigurator
                buttonConfig={currentButtonConfig}
                onUpdateConfig={handleUpdateButtonConfig}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Live Testing Arena & HUD Simulator */}
        {currentTab === 'simulator' && (
          <div className="flex flex-col gap-6">
            <GestureSimulator
              buttonConfig={currentButtonConfig}
              activeProfileName={activeProfile.name}
              onPhysicalButtonStateChange={setActivePhysicalButton}
            />

            {/* Quick Switch Button Controls while in Simulator */}
            <div className="p-4 rounded-xl bg-[#11141b] border border-[#222833] flex items-center justify-between font-mono">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#808997] uppercase">
                  ACTIVE BUTTON:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(['thumb_gesture', 'mode_shift', 'middle_click', 'forward', 'back'] as MouseButtonId[]).map((btnId) => (
                    <button
                      key={btnId}
                      onClick={() => setSelectedButtonId(btnId)}
                      className={`px-3 py-1 rounded text-xs font-medium border transition-all ${
                        selectedButtonId === btnId
                          ? 'bg-[#293240] text-white font-bold border-[#49576e]'
                          : 'bg-[#151921] text-[#9ca3af] border-[#222833] hover:bg-[#1d222c] hover:text-white'
                      }`}
                    >
                      {btnId === 'thumb_gesture' ? 'Thumb Rest' : btnId === 'mode_shift' ? 'Mode Shift' : btnId.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setCurrentTab('studio')}
                className="text-xs text-amber-400 hover:underline font-mono"
              >
                ← BACK TO MAPPING
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Multi-Mouse JSON Editor */}
        {currentTab === 'multi_mouse' && (
          <MultiMouseConfigEditor
            config={config}
            onUpdateConfig={setConfig}
          />
        )}

        {/* Tab 4: Standalone Python Package Hub */}
        {currentTab === 'python_pkg' && (
          <PythonPackageHub
            config={config}
          />
        )}

        {/* Tab 5: Macro Studio */}
        {currentTab === 'macros' && (
          <MacroEditor
            onSaveMacroToAction={(action) => {
              handleUpdateButtonConfig({
                ...currentButtonConfig,
                gestures: {
                  ...currentButtonConfig.gestures,
                  click: {
                    enabled: true,
                    action,
                  },
                },
              });
            }}
          />
        )}

        {/* Tab 6: Portable & Non-Admin Auto-Start Settings */}
        {currentTab === 'portable' && (
          <PortableSettingsPanel
            config={config}
            onUpdateSettings={(newEngineSettings) => {
              setConfig({
                ...config,
                engineSettings: newEngineSettings,
              });
            }}
          />
        )}

        {/* Tab 7: Architecture & Native Code Hub */}
        {currentTab === 'architecture' && (
          <ArchitectureDocs currentConfig={config} />
        )}
      </main>

      {/* Footer Info */}
      <footer className="w-full border-t border-[#1c212b] bg-[#090b0e] py-4 px-6 text-center text-[11px] font-mono text-[#6b7280]">
        MasterGesture Engine // Tailored for Logitech MX Master 1 / 2S / 3 / 3S // Sub-millisecond WH_MOUSE_LL Interception // Pure Python Library Suite
      </footer>
    </div>
  );
}
