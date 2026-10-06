import React, { useState } from 'react';
import { MacroStep, ActionDefinition, GestureDirection } from '../types/gestures';
import { 
  Plus, 
  Trash2, 
  Play, 
  Clock, 
  Keyboard, 
  Mouse, 
  Sparkles, 
  Check, 
  Layers,
  ArrowRight
} from 'lucide-react';

interface MacroEditorProps {
  onSaveMacroToAction?: (action: ActionDefinition) => void;
}

export const MacroEditor: React.FC<MacroEditorProps> = ({ onSaveMacroToAction }) => {
  const [macroName, setMacroName] = useState<string>('Rapid Window Center & Focus');
  const [steps, setSteps] = useState<MacroStep[]>([
    { id: '1', type: 'key_down', key: 'Alt' },
    { id: '2', type: 'key_down', key: 'Space' },
    { id: '3', type: 'delay', delayMs: 40 },
    { id: '4', type: 'key_up', key: 'Space' },
    { id: '5', type: 'key_up', key: 'Alt' },
    { id: '6', type: 'delay', delayMs: 60 },
    { id: '7', type: 'key_down', key: 'x' },
    { id: '8', type: 'key_up', key: 'x' },
  ]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const addStep = (type: MacroStep['type']) => {
    const newStep: MacroStep = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      key: type.startsWith('key') ? 'Ctrl' : undefined,
      delayMs: type === 'delay' ? 50 : undefined,
      mouseButton: type === 'mouse_click' ? 'left' : undefined,
    };
    setSteps(prev => [...prev, newStep]);
  };

  const removeStep = (id: string) => {
    setSteps(prev => prev.filter(s => s.id !== id));
  };

  const updateStep = (id: string, updates: Partial<MacroStep>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const runSimulation = async () => {
    if (isRunning) return;
    setIsRunning(true);

    for (let i = 0; i < steps.length; i++) {
      setActiveStepIndex(i);
      const step = steps[i];
      const waitTime = step.type === 'delay' ? (step.delayMs || 50) : 100;
      await new Promise(r => setTimeout(r, waitTime));
    }

    setActiveStepIndex(-1);
    setIsRunning(false);
  };

  const handleExportMacro = () => {
    if (onSaveMacroToAction) {
      const action: ActionDefinition = {
        id: `macro_${Date.now()}`,
        category: 'macro',
        name: macroName,
        description: `Macro with ${steps.length} sequential execution steps`,
        iconName: 'Layers',
        macroSteps: steps,
      };
      onSaveMacroToAction(action);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  const loadTemplate = (templateName: string) => {
    if (templateName === 'copy_paste_unformatted') {
      setMacroName('Paste Unformatted Text');
      setSteps([
        { id: '1', type: 'key_down', key: 'Ctrl' },
        { id: '2', type: 'key_down', key: 'Shift' },
        { id: '3', type: 'key_down', key: 'v' },
        { id: '4', type: 'delay', delayMs: 30 },
        { id: '5', type: 'key_up', key: 'v' },
        { id: '6', type: 'key_up', key: 'Shift' },
        { id: '7', type: 'key_up', key: 'Ctrl' },
      ]);
    } else if (templateName === 'boss_key') {
      setMacroName('Emergency Desktop & Mute');
      setSteps([
        { id: '1', type: 'key_down', key: 'Meta' },
        { id: '2', type: 'key_down', key: 'd' },
        { id: '3', type: 'delay', delayMs: 40 },
        { id: '4', type: 'key_up', key: 'd' },
        { id: '5', type: 'key_up', key: 'Meta' },
        { id: '6', type: 'delay', delayMs: 50 },
        { id: '7', type: 'key_down', key: 'AudioVolumeMute' },
        { id: '8', type: 'key_up', key: 'AudioVolumeMute' },
      ]);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-slate-900/60 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Macro Sequencing Studio
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-400 border border-purple-800/80">
              Deterministic Multi-Step Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Chain keyboard keystrokes, precise millisecond delays, and synthetic mouse clicks into a single gesture.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runSimulation}
            disabled={isRunning || steps.length === 0}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isRunning
                ? 'bg-amber-950 text-amber-300 border-amber-800 animate-pulse'
                : 'bg-cyan-500 text-slate-950 border-cyan-400 hover:bg-cyan-400 shadow-md shadow-cyan-500/20'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isRunning ? 'Simulating...' : 'Test Playback'}
          </button>

          {onSaveMacroToAction && (
            <button
              onClick={handleExportMacro}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition-all"
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5" />}
              {savedSuccess ? 'Saved!' : 'Save as Action'}
            </button>
          )}
        </div>
      </div>

      {/* Preset Macro Quick Templates */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 text-[11px] font-mono">Templates:</span>
        <button
          onClick={() => loadTemplate('copy_paste_unformatted')}
          className="px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500"
        >
          Paste Unformatted Text (Ctrl+Shift+V)
        </button>
        <button
          onClick={() => loadTemplate('boss_key')}
          className="px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500"
        >
          Emergency Boss Key (Minimize All + Mute)
        </button>
      </div>

      {/* Macro Name Header */}
      <div>
        <label className="text-[11px] text-slate-400 font-mono block mb-1">
          MACRO IDENTIFIER
        </label>
        <input
          type="text"
          value={macroName}
          onChange={(e) => setMacroName(e.target.value)}
          className="w-full max-w-md px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Steps Visual List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-1">
          <span>EXECUTION SEQUENCE ({steps.length} STEPS)</span>
          <span>ESTIMATED DURATION: {steps.reduce((acc, s) => acc + (s.delayMs || 40), 0)}ms</span>
        </div>

        <div className="space-y-2">
          {steps.map((step, idx) => {
            const isCurrent = activeStepIndex === idx;

            return (
              <div
                key={step.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/80 border-cyan-400 ring-2 ring-cyan-400/30'
                    : 'bg-slate-950/70 border-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-400">
                    {idx + 1}
                  </span>

                  {/* Step Type Icon & Badge */}
                  {step.type === 'key_down' && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[11px] font-mono">
                        Key Down
                      </span>
                      <input
                        type="text"
                        value={step.key || ''}
                        onChange={(e) => updateStep(step.id, { key: e.target.value })}
                        className="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                      />
                    </div>
                  )}

                  {step.type === 'key_up' && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-mono">
                        Key Up
                      </span>
                      <input
                        type="text"
                        value={step.key || ''}
                        onChange={(e) => updateStep(step.id, { key: e.target.value })}
                        className="w-24 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                      />
                    </div>
                  )}

                  {step.type === 'delay' && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[11px] font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Delay
                      </span>
                      <input
                        type="number"
                        min="5"
                        max="2000"
                        step="5"
                        value={step.delayMs || 50}
                        onChange={(e) => updateStep(step.id, { delayMs: parseInt(e.target.value, 10) })}
                        className="w-20 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                      />
                      <span className="text-[11px] font-mono text-slate-400">ms</span>
                    </div>
                  )}

                  {step.type === 'mouse_click' && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-mono flex items-center gap-1">
                        <Mouse className="w-3 h-3" />
                        Click
                      </span>
                      <select
                        value={step.mouseButton || 'left'}
                        onChange={(e) => updateStep(step.id, { mouseButton: e.target.value as any })}
                        className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                      >
                        <option value="left">Left Click</option>
                        <option value="right">Right Click</option>
                        <option value="middle">Middle Click</option>
                      </select>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => removeStep(step.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Step Toolbelt */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
        <span className="text-xs text-slate-400 font-mono">Insert Step:</span>
        <button
          onClick={() => addStep('key_down')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700"
        >
          <Keyboard className="w-3.5 h-3.5" />
          Key Down
        </button>
        <button
          onClick={() => addStep('key_up')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700"
        >
          <Keyboard className="w-3.5 h-3.5" />
          Key Up
        </button>
        <button
          onClick={() => addStep('delay')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700"
        >
          <Clock className="w-3.5 h-3.5" />
          Delay (ms)
        </button>
        <button
          onClick={() => addStep('mouse_click')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700"
        >
          <Mouse className="w-3.5 h-3.5" />
          Mouse Click
        </button>
      </div>
    </div>
  );
};
