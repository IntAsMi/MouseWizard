import React, { useState, useEffect } from 'react';
import { 
  ButtonGestureConfig, 
  GestureDirection, 
  ActionDefinition, 
  MouseButtonId, 
  HARDWARE_BUTTONS,
  KeyCombo 
} from '../types/gestures';
import { PRESET_ACTIONS } from '../types/presets';
import { 
  Sliders, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  MousePointer, 
  Keyboard, 
  Zap, 
  Check, 
  SlidersHorizontal,
  Radio
} from 'lucide-react';

interface GestureConfiguratorProps {
  buttonConfig: ButtonGestureConfig;
  onUpdateConfig: (newConfig: ButtonGestureConfig) => void;
}

export const GestureConfigurator: React.FC<GestureConfiguratorProps> = ({
  buttonConfig,
  onUpdateConfig,
}) => {
  const [activeTab, setActiveTab] = useState<GestureDirection>('click');
  const [isRecordingKey, setIsRecordingKey] = useState<boolean>(false);
  const [customKeyName, setCustomKeyName] = useState<string>('');
  const [recordedCombo, setRecordedCombo] = useState<KeyCombo | null>(null);

  const hwButton = HARDWARE_BUTTONS.find(b => b.id === buttonConfig.buttonId);

  // Key recording listener
  useEffect(() => {
    if (!isRecordingKey) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        return;
      }

      const ctrl = e.ctrlKey;
      const shift = e.shiftKey;
      const alt = e.altKey;
      const meta = e.metaKey;
      const key = e.key;

      const parts: string[] = [];
      if (ctrl) parts.push('Ctrl');
      if (shift) parts.push('Shift');
      if (alt) parts.push('Alt');
      if (meta) parts.push('Win/Cmd');
      parts.push(key.toUpperCase());

      const combo: KeyCombo = {
        ctrl,
        shift,
        alt,
        meta,
        key,
        displayName: parts.join(' + '),
      };

      setRecordedCombo(combo);
      setIsRecordingKey(false);

      const customAction: ActionDefinition = {
        id: `custom_key_${Date.now()}`,
        category: 'keyboard_shortcut',
        name: customKeyName.trim() || combo.displayName,
        description: `Simulated keystroke ${combo.displayName}`,
        iconName: 'Keyboard',
        keyCombo: combo,
      };

      handleSetActionForDirection(activeTab, customAction);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isRecordingKey, activeTab, customKeyName]);

  const handleModeChange = (mode: 'gesture' | 'standard') => {
    onUpdateConfig({
      ...buttonConfig,
      mode,
    });
  };

  const handleThresholdChange = (val: number) => {
    onUpdateConfig({
      ...buttonConfig,
      thresholdPx: val,
    });
  };

  const handleSetActionForDirection = (direction: GestureDirection, action: ActionDefinition) => {
    onUpdateConfig({
      ...buttonConfig,
      gestures: {
        ...buttonConfig.gestures,
        [direction]: {
          enabled: true,
          action,
        },
      },
    });
  };

  const handleToggleDirection = (direction: GestureDirection) => {
    const current = buttonConfig.gestures[direction];
    onUpdateConfig({
      ...buttonConfig,
      gestures: {
        ...buttonConfig.gestures,
        [direction]: {
          ...current,
          enabled: !current.enabled,
        },
      },
    });
  };

  const currentGesture = buttonConfig.gestures[activeTab];

  const gestureIcons: Record<GestureDirection, React.ReactNode> = {
    click: <MousePointer className="w-3.5 h-3.5" />,
    up: <ArrowUp className="w-3.5 h-3.5" />,
    down: <ArrowDown className="w-3.5 h-3.5" />,
    left: <ArrowLeft className="w-3.5 h-3.5" />,
    right: <ArrowRight className="w-3.5 h-3.5" />,
  };

  const gestureLabels: Record<GestureDirection, string> = {
    click: 'Single Click (Tap)',
    up: 'Drag UP',
    down: 'Drag DOWN',
    left: 'Drag LEFT',
    right: 'Drag RIGHT',
  };

  return (
    <div className="flex flex-col gap-5 p-6 bg-[#0f1217] rounded-xl border border-[#252c38] shadow-2xl font-mono text-slate-200">
      {/* Header with Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#222833]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-wide uppercase">
              {hwButton?.label || buttonConfig.buttonId}
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] bg-[#161a22] text-amber-400 border border-[#3b3424]">
              {buttonConfig.mode === 'gesture' ? '5-WAY ACTIVE' : 'DIRECT ACTION'}
            </span>
          </div>
          <p className="text-xs text-[#808997] mt-0.5 font-sans">
            {hwButton?.subLabel} • <span className="font-mono text-[#6b7280]">{hwButton?.hardwareDetail}</span>
          </p>
        </div>

        {/* Operating Mode Selector - Utilitarian */}
        <div className="flex items-center bg-[#13161c] p-0.5 rounded border border-[#222833] text-xs">
          <button
            onClick={() => handleModeChange('gesture')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
              buttonConfig.mode === 'gesture'
                ? 'bg-[#28313e] text-white font-bold shadow-sm'
                : 'text-[#808997] hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>5-WAY GESTURE</span>
          </button>
          <button
            onClick={() => handleModeChange('standard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
              buttonConfig.mode === 'standard'
                ? 'bg-[#28313e] text-white font-bold shadow-sm'
                : 'text-[#808997] hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>DIRECT ONLY</span>
          </button>
        </div>
      </div>

      {/* Physics & Trigger Threshold Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded bg-[#13161c] border border-[#222833] text-xs">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              DRAG THRESHOLD
            </span>
            <span className="font-bold text-amber-400">
              {buttonConfig.thresholdPx} px
            </span>
          </div>
          <input
            type="range"
            min="15"
            max="80"
            step="1"
            value={buttonConfig.thresholdPx}
            onChange={(e) => handleThresholdChange(parseInt(e.target.value, 10))}
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-[#252c38] rounded"
          />
          <span className="text-[10px] text-[#6b7280] mt-1 block font-sans">
            Recommended: 35px for MX Master thumb wing.
          </span>
        </div>

        <div>
          <span className="text-slate-300 font-medium block mb-2">
            FEEDBACK CUES
          </span>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={buttonConfig.showHUD}
                onChange={(e) => onUpdateConfig({ ...buttonConfig, showHUD: e.target.checked })}
                className="rounded accent-amber-400"
              />
              On-Screen HUD
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={buttonConfig.hapticFeedback}
                onChange={(e) => onUpdateConfig({ ...buttonConfig, hapticFeedback: e.target.checked })}
                className="rounded accent-amber-400"
              />
              Haptic Click
            </label>
          </div>
          <span className="text-[10px] text-[#6b7280] mt-1 block font-sans">
            Tactile sound and visual popups.
          </span>
        </div>

        <div>
          <span className="text-slate-300 font-medium block mb-1">
            OS HOOK SUPPRESSION
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-200">SUPPRESS_HARDWARE: ON</span>
          </div>
          <span className="text-[10px] text-[#6b7280] mt-1 block font-sans">
            Returns 1 from WH_MOUSE_LL callback.
          </span>
        </div>
      </div>

      {/* 5-Direction Tab Bar - Utilitarian Matrix */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#808997]">
            GESTURE MAPPINGS (CLICK / UP / DOWN / LEFT / RIGHT)
          </span>
          <span className="text-xs text-amber-400">
            {Object.values(buttonConfig.gestures).filter(g => g.enabled).length} OF 5 CONFIGURED
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(['click', 'up', 'down', 'left', 'right'] as GestureDirection[]).map((dir) => {
            const isTab = activeTab === dir;
            const mapping = buttonConfig.gestures[dir];

            return (
              <button
                key={dir}
                onClick={() => setActiveTab(dir)}
                className={`flex flex-col items-center justify-center p-2.5 rounded border transition-all text-xs ${
                  isTab
                    ? 'bg-[#202734] border-amber-400/90 text-white font-bold shadow-md'
                    : mapping.enabled
                    ? 'bg-[#141820] border-[#252c38] text-slate-300 hover:bg-[#1a202a]'
                    : 'bg-[#101217] border-[#1d222b] text-[#555f6d] hover:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={isTab ? 'text-amber-400' : 'text-[#808997]'}>
                    {gestureIcons[dir]}
                  </span>
                  <span className="uppercase text-[11px]">{dir}</span>
                </div>
                <span className="text-[10px] truncate max-w-[110px] text-center font-normal font-sans">
                  {mapping.enabled ? mapping.action.name : 'Disabled'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Direction Configuration Panel */}
      <div className="p-4 rounded bg-[#13161c] border border-[#222833] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#222833]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#1c222c] border border-[#333e4f] flex items-center justify-center text-amber-400">
              {gestureIcons[activeTab]}
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase">
                {gestureLabels[activeTab]}
              </h3>
              <p className="text-[11px] text-[#808997] font-sans">
                Mapped: <strong className="text-slate-100 font-mono">{currentGesture.action.name}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => handleToggleDirection(activeTab)}
            className={`px-3 py-1 rounded text-xs font-medium border transition-all ${
              currentGesture.enabled
                ? 'bg-[#1f2530] text-amber-300 border-amber-500/50 hover:bg-[#28313f]'
                : 'bg-[#161a22] text-[#6b7280] border-[#222833] hover:text-white'
            }`}
          >
            {currentGesture.enabled ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        {/* Action Picker Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Preset Action Catalog */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-[#808997] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              ACTION CATALOG
            </span>

            <div className="space-y-1 max-h-[280px] overflow-y-auto pr-1">
              {Object.values(PRESET_ACTIONS).map((action) => {
                const isSelected = currentGesture.action.id === action.id;

                return (
                  <button
                    key={action.id}
                    onClick={() => handleSetActionForDirection(activeTab, action)}
                    className={`w-full flex items-center justify-between p-2 rounded border text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-[#202734] border-amber-400/90 text-white font-medium shadow-sm'
                        : 'bg-[#101318] border-[#1e232b] text-[#808997] hover:bg-[#161a22] hover:text-slate-200'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-slate-200 font-medium truncate">{action.name}</div>
                      <div className="text-[10px] text-[#6b7280] font-sans truncate">{action.description}</div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {action.keyCombo && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#0c0e12] text-[#9ca3af] border border-[#222833]">
                          {action.keyCombo.displayName}
                        </span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Shortcut Recorder */}
          <div className="flex flex-col gap-3 p-3.5 rounded bg-[#101318] border border-[#1e232b]">
            <span className="text-xs font-bold text-[#808997] flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-amber-400" />
              RECORD SHORTCUT
            </span>

            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] text-[#6b7280] block mb-1">
                  LABEL / IDENTIFIER
                </label>
                <input
                  type="text"
                  placeholder="e.g. VS Code Quick Open"
                  value={customKeyName}
                  onChange={(e) => setCustomKeyName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-[#0b0d10] border border-[#252c38] text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Recording Box */}
              <div
                onClick={() => setIsRecordingKey(true)}
                className={`p-5 rounded border border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isRecordingKey
                    ? 'border-amber-400 bg-[#1e2430] text-amber-300 animate-pulse'
                    : 'border-[#2e3745] bg-[#0c0e12] hover:border-slate-500 text-[#808997]'
                }`}
              >
                <Keyboard className="w-6 h-6 mb-1 text-amber-400" />
                {isRecordingKey ? (
                  <>
                    <span className="text-xs font-bold text-amber-300">PRESS KEYS NOW...</span>
                    <span className="text-[10px] text-amber-400/80 mt-0.5">
                      Press your combination (e.g. Ctrl + Shift + Esc)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-bold text-slate-200">
                      [ CLICK TO RECORD KEYSTROKE ]
                    </span>
                    <span className="text-[10px] text-[#6b7280] mt-0.5 font-sans">
                      Captures Ctrl, Alt, Shift, Win + keys
                    </span>
                  </>
                )}
              </div>

              {recordedCombo && (
                <div className="flex items-center justify-between p-2 rounded bg-[#161b24] border border-[#2b3442] text-xs">
                  <span className="text-amber-300">Recorded: {recordedCombo.displayName}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">MAPPED TO {activeTab.toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
