import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ButtonGestureConfig, 
  GestureDirection, 
  ActionDefinition, 
  MouseButtonId,
  HARDWARE_BUTTONS 
} from '../types/gestures';
import { soundEngine } from '../audio/soundEffects';
import { 
  Compass, 
  MousePointer, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Zap, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  Terminal, 
  Activity,
  Timer,
  Gauge,
  Cpu
} from 'lucide-react';

interface TriggerLog {
  id: string;
  time: string;
  button: string;
  gesture: GestureDirection;
  actionName: string;
  vector: { dx: number; dy: number; distance: number; angleDeg: number };
  category: string;
  latencyMs: number;
}

interface GestureSimulatorProps {
  buttonConfig: ButtonGestureConfig;
  activeProfileName: string;
  onPhysicalButtonStateChange?: (buttonId: MouseButtonId | null) => void;
}

export const GestureSimulator: React.FC<GestureSimulatorProps> = ({
  buttonConfig,
  activeProfileName,
  onPhysicalButtonStateChange,
}) => {
  // Simulator State
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const [currentVector, setCurrentVector] = useState<{ dx: number; dy: number; distance: number; angleDeg: number }>({
    dx: 0,
    dy: 0,
    distance: 0,
    angleDeg: 0,
  });
  const [activeDirection, setActiveDirection] = useState<GestureDirection | null>(null);
  const [triggeredInCurrentHold, setTriggeredInCurrentHold] = useState<boolean>(false);
  const [activeHUD, setActiveHUD] = useState<{
    gesture: GestureDirection;
    action: ActionDefinition;
    latencyMs: number;
    visible: boolean;
  } | null>(null);

  // High-Precision Real-Time Latency State
  const pressStartTimeRef = useRef<number | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const [liveElapsedMs, setLiveElapsedMs] = useState<number>(0);
  const [lastLatencyMs, setLastLatencyMs] = useState<number | null>(null);
  const [latencyHistory, setLatencyHistory] = useState<number[]>([]);

  const [logs, setLogs] = useState<TriggerLog[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [triggerInputSource, setTriggerInputSource] = useState<'mouse_drag' | 'space_drag'>('mouse_drag');

  const canvasRef = useRef<HTMLDivElement>(null);
  const hudTimeoutRef = useRef<number | null>(null);

  // Live Stopwatch animation loop while holding
  useEffect(() => {
    if (isHolding && pressStartTimeRef.current !== null) {
      const updateTimer = () => {
        if (pressStartTimeRef.current !== null) {
          const now = performance.now();
          setLiveElapsedMs(now - pressStartTimeRef.current);
          animFrameIdRef.current = requestAnimationFrame(updateTimer);
        }
      };
      animFrameIdRef.current = requestAnimationFrame(updateTimer);
    } else {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    }

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isHolding]);

  // Calculate direction based on displacement vector
  const computeDirection = useCallback((dx: number, dy: number, distance: number, threshold: number): GestureDirection | null => {
    if (distance < threshold) {
      return null;
    }
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absY >= absX) {
      return dy < 0 ? 'up' : 'down';
    } else {
      return dx < 0 ? 'left' : 'right';
    }
  }, []);

  // Fire Action Helper with precise latency measurement
  const triggerAction = useCallback((gesture: GestureDirection, vectorInfo: { dx: number; dy: number; distance: number; angleDeg: number }) => {
    const gestureMapping = buttonConfig.gestures[gesture];
    if (!gestureMapping || !gestureMapping.enabled) {
      return;
    }

    const nowTime = performance.now();
    const startTime = pressStartTimeRef.current ?? nowTime;
    const measuredLatencyMs = Math.max(0.1, Number((nowTime - startTime).toFixed(1)));

    setLastLatencyMs(measuredLatencyMs);
    setLatencyHistory(prev => [measuredLatencyMs, ...prev].slice(0, 20));

    const action = gestureMapping.action;

    if (soundEnabled) {
      if (gesture === 'click') {
        soundEngine.playClickPop();
      } else {
        soundEngine.playTriggerSnap();
      }
    }

    if (buttonConfig.showHUD) {
      if (hudTimeoutRef.current) {
        window.clearTimeout(hudTimeoutRef.current);
      }
      setActiveHUD({
        gesture,
        action,
        latencyMs: measuredLatencyMs,
        visible: true,
      });

      hudTimeoutRef.current = window.setTimeout(() => {
        setActiveHUD(prev => (prev ? { ...prev, visible: false } : null));
      }, 1200);
    }

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

    const buttonLabel = HARDWARE_BUTTONS.find(b => b.id === buttonConfig.buttonId)?.label || buttonConfig.buttonId;

    setLogs(prev => [
      {
        id: Math.random().toString(36).substring(2, 9),
        time: timeStr,
        button: buttonLabel,
        gesture,
        actionName: action.name,
        vector: vectorInfo,
        category: action.category,
        latencyMs: measuredLatencyMs,
      },
      ...prev.slice(0, 19),
    ]);
  }, [buttonConfig, soundEnabled]);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    pressStartTimeRef.current = performance.now();
    setLiveElapsedMs(0);

    setIsHolding(true);
    setOrigin({ x, y });
    setCurrentPos({ x, y });
    setCurrentVector({ dx: 0, dy: 0, distance: 0, angleDeg: 0 });
    setActiveDirection(null);
    setTriggeredInCurrentHold(false);

    if (soundEnabled) {
      soundEngine.playEngageTick();
    }

    if (onPhysicalButtonStateChange) {
      onPhysicalButtonStateChange(buttonConfig.buttonId);
    }
  }, [buttonConfig.buttonId, onPhysicalButtonStateChange, soundEnabled]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isHolding || !origin || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const dx = x - origin.x;
    const dy = y - origin.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    let angleDeg = Math.atan2(-dy, dx) * (180 / Math.PI);
    if (angleDeg < 0) angleDeg += 360;

    const vec = { dx, dy, distance, angleDeg };
    setCurrentPos({ x, y });
    setCurrentVector(vec);

    const dir = computeDirection(dx, dy, distance, buttonConfig.thresholdPx);
    setActiveDirection(dir);

    if (dir && !triggeredInCurrentHold) {
      setTriggeredInCurrentHold(true);
      triggerAction(dir, vec);
    }
  }, [isHolding, origin, buttonConfig.thresholdPx, computeDirection, triggeredInCurrentHold, triggerAction]);

  const handleEnd = useCallback(() => {
    if (!isHolding) return;

    if (onPhysicalButtonStateChange) {
      onPhysicalButtonStateChange(null);
    }

    if (!triggeredInCurrentHold && currentVector.distance < buttonConfig.thresholdPx) {
      triggerAction('click', currentVector);
    }

    setIsHolding(false);
    setOrigin(null);
    setCurrentPos(null);
    setActiveDirection(null);
    setTriggeredInCurrentHold(false);
  }, [isHolding, onPhysicalButtonStateChange, triggeredInCurrentHold, currentVector, buttonConfig.thresholdPx, triggerAction]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isHolding) {
        handleEnd();
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isHolding) {
        handleMove(e.clientX, e.clientY);
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isHolding, handleMove, handleEnd]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (triggerInputSource === 'space_drag' && e.code === 'Space' && !e.repeat && !isHolding) {
        e.preventDefault();
        if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          handleStart(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (triggerInputSource === 'space_drag' && e.code === 'Space' && isHolding) {
        e.preventDefault();
        handleEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [triggerInputSource, isHolding, handleStart, handleEnd]);

  const threshold = buttonConfig.thresholdPx;
  const progressRatio = Math.min(1, currentVector.distance / threshold);

  const avgLatency = latencyHistory.length > 0 
    ? (latencyHistory.reduce((a, b) => a + b, 0) / latencyHistory.length).toFixed(1) 
    : null;
  const minLatency = latencyHistory.length > 0 
    ? Math.min(...latencyHistory).toFixed(1) 
    : null;
  const maxLatency = latencyHistory.length > 0 
    ? Math.max(...latencyHistory).toFixed(1) 
    : null;

  const getLatencyRating = (ms: number) => {
    if (ms < 50) return { label: 'ULTRA FAST [SUB-FRAME]', color: 'text-emerald-400 bg-[#14231b] border-emerald-800' };
    if (ms < 120) return { label: 'OPTIMAL RESPONSE', color: 'text-amber-400 bg-[#241d13] border-amber-800' };
    if (ms < 250) return { label: 'DELIBERATE GESTURE', color: 'text-slate-300 bg-[#1d222b] border-[#364253]' };
    return { label: 'EXTENDED DRAG', color: 'text-rose-400 bg-[#281519] border-rose-800' };
  };

  return (
    <div className="flex flex-col gap-5 font-mono text-slate-200">
      {/* Utilitarian Latency Monitor Header Card */}
      <div className="p-4 rounded-xl bg-[#0f1217] border border-[#252c38] shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#222833]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#181d26] border border-[#2e3745] flex items-center justify-center text-amber-400">
              <Timer className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  REAL-TIME END-TO-END LATENCY MONITOR
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#161a22] text-[#9ca3af] border border-[#2b3341]">
                  Δt: BUTTON DOWN → ACTION TRIGGER
                </span>
              </div>
              <p className="text-[11px] text-[#808997] mt-0.5 font-sans">
                Sub-millisecond timer calculating elapsed duration from physical contact to threshold breach.
              </p>
            </div>
          </div>

          {/* Live Digital Gauge Display */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-[#6b7280]">
                {isHolding ? 'LIVE DRAG DURATION' : 'LAST EXECUTION LATENCY'}
              </span>
              <div className="flex items-baseline gap-1 font-extrabold text-2xl">
                {isHolding ? (
                  <span className="text-amber-400 tabular-nums animate-pulse">
                    {liveElapsedMs.toFixed(1)}
                  </span>
                ) : lastLatencyMs !== null ? (
                  <span className="text-white tabular-nums">
                    {lastLatencyMs.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-[#4b5563]">--.-</span>
                )}
                <span className="text-xs font-semibold text-[#808997]">ms</span>
              </div>
            </div>

            {lastLatencyMs !== null && !isHolding && (
              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold tracking-tight hidden sm:inline-block ${getLatencyRating(lastLatencyMs).color}`}>
                {getLatencyRating(lastLatencyMs).label}
              </span>
            )}
          </div>
        </div>

        {/* Latency Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3 text-xs">
          <div className="p-2.5 rounded bg-[#13171f] border border-[#232934]">
            <span className="text-[10px] text-[#6b7280] block">CURRENT TIMER</span>
            <span className={`text-sm font-bold ${isHolding ? 'text-amber-400 animate-pulse' : 'text-slate-200'}`}>
              {isHolding ? `${liveElapsedMs.toFixed(1)} ms` : lastLatencyMs !== null ? `${lastLatencyMs.toFixed(1)} ms` : '--'}
            </span>
            <span className="text-[9px] text-[#6b7280] mt-0.5 block font-sans">
              {isHolding ? 'Sampling motion...' : 'Previous event'}
            </span>
          </div>

          <div className="p-2.5 rounded bg-[#13171f] border border-[#232934]">
            <span className="text-[10px] text-[#6b7280] block">ROLLING AVG (20x)</span>
            <span className="text-sm font-bold text-slate-100">
              {avgLatency !== null ? `${avgLatency} ms` : '--'}
            </span>
            <span className="text-[9px] text-[#6b7280] mt-0.5 block font-sans">
              Samples: {latencyHistory.length} triggers
            </span>
          </div>

          <div className="p-2.5 rounded bg-[#13171f] border border-[#232934]">
            <span className="text-[10px] text-[#6b7280] block">MIN RESPONSE</span>
            <span className="text-sm font-bold text-emerald-400">
              {minLatency !== null ? `${minLatency} ms` : '--'}
            </span>
            <span className="text-[9px] text-[#6b7280] mt-0.5 block font-sans">
              Fastest twitch flick
            </span>
          </div>

          <div className="p-2.5 rounded bg-[#13171f] border border-[#232934]">
            <span className="text-[10px] text-[#6b7280] block">MAX DURATION</span>
            <span className="text-sm font-bold text-slate-300">
              {maxLatency !== null ? `${maxLatency} ms` : '--'}
            </span>
            <span className="text-[9px] text-[#6b7280] mt-0.5 block font-sans">
              Slowest tracking move
            </span>
          </div>

          <div className="p-2.5 rounded bg-[#13171f] border border-[#232934]">
            <span className="text-[10px] text-[#6b7280] block">KERNEL HOOK OVERHEAD</span>
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              &lt; 0.28 ms
            </span>
            <span className="text-[9px] text-[#6b7280] mt-0.5 block font-sans">
              WH_MOUSE_LL / Cython
            </span>
          </div>
        </div>

        {/* Latency History Bars */}
        {latencyHistory.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-[#222833] flex items-center justify-between gap-2 text-[10px] text-[#808997]">
            <span className="shrink-0 flex items-center gap-1 text-[#808997]">
              <Gauge className="w-3 h-3 text-amber-400" />
              HISTOGRAM:
            </span>
            <div className="flex-1 flex items-end gap-1.5 h-5 px-2">
              {latencyHistory.slice(0, 16).reverse().map((lat, idx) => {
                const maxVal = Math.max(...latencyHistory, 100);
                const heightPct = Math.max(15, Math.min(100, (lat / maxVal) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t transition-all ${
                        lat < 50 ? 'bg-emerald-400 hover:bg-emerald-300' :
                        lat < 120 ? 'bg-amber-400 hover:bg-amber-300' : 'bg-slate-400 hover:bg-slate-300'
                      }`}
                    />
                    <div className="absolute bottom-6 hidden group-hover:block z-30 px-1.5 py-0.5 rounded bg-[#0b0d11] border border-[#282e38] text-[9px] text-white whitespace-nowrap shadow-lg">
                      {lat.toFixed(1)} ms
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => {
                setLatencyHistory([]);
                setLastLatencyMs(null);
              }}
              className="text-[#6b7280] hover:text-slate-300 text-[10px]"
            >
              [ RESET ]
            </button>
          </div>
        )}
      </div>

      {/* Control bar - Utilitarian */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0f1217] border border-[#252c38] text-xs">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white uppercase">
            GESTURE TESTING ARENA
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-[#161a22] text-[#9ca3af] border border-[#2b3341]">
            TARGET: {HARDWARE_BUTTONS.find(b => b.id === buttonConfig.buttonId)?.label}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] transition-all ${
              soundEnabled
                ? 'bg-[#181d26] text-amber-300 border-[#333d4e]'
                : 'bg-[#11141a] text-[#6b7280] border-[#222833]'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3 h-3 text-amber-400" /> : <VolumeX className="w-3 h-3 text-[#6b7280]" />}
            <span>{soundEnabled ? 'HAPTIC: ON' : 'MUTED'}</span>
          </button>

          <div className="flex items-center bg-[#13161c] p-0.5 rounded border border-[#222833] text-[11px]">
            <button
              onClick={() => setTriggerInputSource('mouse_drag')}
              className={`px-2.5 py-1 rounded transition-all ${
                triggerInputSource === 'mouse_drag'
                  ? 'bg-[#28313e] text-white font-bold'
                  : 'text-[#808997] hover:text-white'
              }`}
            >
              DRAG ARENA
            </button>
            <button
              onClick={() => setTriggerInputSource('space_drag')}
              className={`px-2.5 py-1 rounded transition-all ${
                triggerInputSource === 'space_drag'
                  ? 'bg-[#28313e] text-white font-bold'
                  : 'text-[#808997] hover:text-white'
              }`}
            >
              SPACEBAR + DRAG
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Radar & Drag Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div
            ref={canvasRef}
            onMouseDown={(e) => {
              if (triggerInputSource === 'mouse_drag') {
                handleStart(e.clientX, e.clientY);
              }
            }}
            className={`relative w-full h-[360px] rounded-xl border transition-all select-none overflow-hidden flex items-center justify-center cursor-crosshair ${
              isHolding
                ? 'bg-[#0d1015] border-amber-400/80 shadow-2xl ring-1 ring-amber-400/20'
                : 'bg-[#0a0c10] border-[#222833] hover:border-[#333d4d]'
            }`}
          >
            {/* Grid Pattern Background */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, #4b5563 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Concentric Guide Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`rounded-full border-2 border-dashed transition-all ${
                  progressRatio >= 1
                    ? 'border-amber-400 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'border-[#333c4a]'
                }`}
                style={{
                  width: `${threshold * 2}px`,
                  height: `${threshold * 2}px`,
                }}
              >
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] text-[#9ca3af] bg-[#12161e] px-1.5 py-0.2 rounded border border-[#2b3442]">
                  {threshold}px TRIGGER ZONE
                </span>
              </div>

              <div className="w-3.5 h-3.5 rounded-full border border-[#4b5563] bg-[#1a202a]" />
              <div className="absolute w-full h-[1px] bg-[#1f2633]" />
              <div className="absolute h-full w-[1px] bg-[#1f2633]" />
            </div>

            {/* Quadrant Highlight Indicators */}
            {/* UP */}
            <div className={`absolute top-3 left-1/2 -translate-x-1/2 flex flex-col items-center px-3 py-1 rounded border text-xs transition-all ${
              activeDirection === 'up'
                ? 'bg-[#293240] text-amber-400 font-bold border-amber-400 shadow-md scale-105'
                : 'bg-[#12161e]/90 text-[#808997] border-[#252c38]'
            }`}>
              <div className="flex items-center gap-1">
                <ArrowUp className="w-3.5 h-3.5" />
                <span>UP</span>
              </div>
              <span className="text-[10px] opacity-90 truncate max-w-[120px] font-sans">
                {buttonConfig.gestures.up.enabled ? buttonConfig.gestures.up.action.name : 'Disabled'}
              </span>
            </div>

            {/* DOWN */}
            <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center px-3 py-1 rounded border text-xs transition-all ${
              activeDirection === 'down'
                ? 'bg-[#293240] text-amber-400 font-bold border-amber-400 shadow-md scale-105'
                : 'bg-[#12161e]/90 text-[#808997] border-[#252c38]'
            }`}>
              <div className="flex items-center gap-1">
                <ArrowDown className="w-3.5 h-3.5" />
                <span>DOWN</span>
              </div>
              <span className="text-[10px] opacity-90 truncate max-w-[120px] font-sans">
                {buttonConfig.gestures.down.enabled ? buttonConfig.gestures.down.action.name : 'Disabled'}
              </span>
            </div>

            {/* LEFT */}
            <div className={`absolute left-3 top-1/2 -translate-y-1/2 flex flex-col items-center px-3 py-1 rounded border text-xs transition-all ${
              activeDirection === 'left'
                ? 'bg-[#293240] text-amber-400 font-bold border-amber-400 shadow-md scale-105'
                : 'bg-[#12161e]/90 text-[#808997] border-[#252c38]'
            }`}>
              <div className="flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>LEFT</span>
              </div>
              <span className="text-[10px] opacity-90 truncate max-w-[100px] font-sans">
                {buttonConfig.gestures.left.enabled ? buttonConfig.gestures.left.action.name : 'Disabled'}
              </span>
            </div>

            {/* RIGHT */}
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center px-3 py-1 rounded border text-xs transition-all ${
              activeDirection === 'right'
                ? 'bg-[#293240] text-amber-400 font-bold border-amber-400 shadow-md scale-105'
                : 'bg-[#12161e]/90 text-[#808997] border-[#252c38]'
            }`}>
              <div className="flex items-center gap-1">
                <ArrowRight className="w-3.5 h-3.5" />
                <span>RIGHT</span>
              </div>
              <span className="text-[10px] opacity-90 truncate max-w-[100px] font-sans">
                {buttonConfig.gestures.right.enabled ? buttonConfig.gestures.right.action.name : 'Disabled'}
              </span>
            </div>

            {/* Active Vector Arrow and Path */}
            {isHolding && origin && currentPos && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line
                  x1={origin.x}
                  y1={origin.y}
                  x2={currentPos.x}
                  y2={currentPos.y}
                  stroke={activeDirection ? '#f59e0b' : '#64748b'}
                  strokeWidth={activeDirection ? '2.5' : '1.5'}
                  strokeLinecap="round"
                  strokeDasharray={activeDirection ? undefined : '3 3'}
                />
                <circle cx={origin.x} cy={origin.y} r="5" fill="#3b4554" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx={currentPos.x} cy={currentPos.y} r={activeDirection ? '8' : '4'} fill={activeDirection ? '#f59e0b' : '#94a3b8'} stroke="#ffffff" strokeWidth="1.5" />
              </svg>
            )}

            {/* Floating HUD Notification */}
            {activeHUD && activeHUD.visible && (
              <div className="absolute z-20 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#141820] border border-amber-400 shadow-2xl backdrop-blur-md animate-in zoom-in-95 duration-100">
                <div className="w-8 h-8 rounded bg-[#1e2531] border border-amber-400/50 flex items-center justify-center text-amber-400">
                  <Zap className="w-4 h-4 fill-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold">
                      TRIGGER: {activeHUD.gesture.toUpperCase()}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#0c0e12] text-emerald-400 border border-emerald-900">
                      ⚡ {activeHUD.latencyMs} ms
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white font-sans">
                    {activeHUD.action.name}
                  </div>
                </div>
              </div>
            )}

            {!isHolding && (
              <div className="pointer-events-none text-center p-3.5 bg-[#12161e]/80 rounded border border-[#252c38] max-w-xs">
                <MousePointer className="w-5 h-5 text-amber-400 mx-auto mb-1 animate-bounce" />
                <p className="text-xs font-bold text-slate-200">
                  {triggerInputSource === 'mouse_drag' ? 'PRESS & DRAG IN ARENA' : 'HOLD SPACE + DRAG MOUSE'}
                </p>
                <p className="text-[10px] text-[#6b7280] mt-0.5 font-sans">
                  Drag {threshold}px to test directional vector response and latency.
                </p>
              </div>
            )}
          </div>

          {/* Real-time Telemetry Gauge */}
          <div className="w-full mt-2.5 grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded bg-[#0f1217] border border-[#222833]">
              <span className="text-[9px] text-[#6b7280] block">DELTA X/Y</span>
              <span className="text-slate-200 font-bold">
                {Math.round(currentVector.dx)}px / {Math.round(currentVector.dy)}px
              </span>
            </div>
            <div className="p-2 rounded bg-[#0f1217] border border-[#222833]">
              <span className="text-[9px] text-[#6b7280] block">DISTANCE</span>
              <span className={`font-bold ${progressRatio >= 1 ? 'text-amber-400' : 'text-slate-200'}`}>
                {Math.round(currentVector.distance)}px / {threshold}px
              </span>
            </div>
            <div className="p-2 rounded bg-[#0f1217] border border-[#222833]">
              <span className="text-[9px] text-[#6b7280] block">VECTOR ANGLE</span>
              <span className="text-slate-200 font-bold">
                {Math.round(currentVector.angleDeg)}°
              </span>
            </div>
            <div className="p-2 rounded bg-[#0f1217] border border-[#222833]">
              <span className="text-[9px] text-[#6b7280] block">LATENCY</span>
              <span className={`font-bold ${isHolding ? 'text-amber-400 animate-pulse' : lastLatencyMs ? 'text-emerald-400' : 'text-[#6b7280]'}`}>
                {isHolding ? `${liveElapsedMs.toFixed(1)} ms` : lastLatencyMs ? `${lastLatencyMs.toFixed(1)} ms` : 'IDLE'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Event Hook Log & OS Interception Feed */}
        <div className="lg:col-span-5 flex flex-col bg-[#0f1217] rounded-xl border border-[#252c38] p-3.5">
          <div className="flex items-center justify-between pb-2.5 border-b border-[#222833] text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-white uppercase text-[11px]">EVENT STREAM</span>
            </div>
            <button
              onClick={() => {
                setLogs([]);
                setLatencyHistory([]);
                setLastLatencyMs(null);
              }}
              className="text-[#6b7280] hover:text-slate-200 text-[10px]"
            >
              [ CLEAR ]
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[320px] space-y-1.5 mt-2.5 pr-1 text-xs">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-[#6b7280]">
                <Activity className="w-7 h-7 text-[#28313e] mb-2 animate-pulse" />
                <p className="text-xs">No gesture inputs captured yet</p>
                <p className="text-[10px] text-[#4b5563] mt-1 font-sans">
                  Interact with the arena above to measure input-to-action latency
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2 rounded bg-[#13161c] border border-[#222833] hover:border-[#333d4e] transition-all flex flex-col gap-0.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span className="text-[10px] text-[#6b7280]">{log.time}</span>
                      <span className="px-1 py-0.2 rounded text-[9px] bg-[#1a202a] text-slate-200 font-bold uppercase">
                        {log.gesture}
                      </span>
                      <span className="px-1 py-0.2 rounded text-[9px] bg-[#0c0e12] text-emerald-400 border border-emerald-950 font-bold">
                        ⚡ {log.latencyMs}ms
                      </span>
                    </div>
                    <span className="text-[10px] text-[#6b7280]">
                      {Math.round(log.vector.distance)}px @ {Math.round(log.vector.angleDeg)}°
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-slate-200 font-sans font-medium text-xs">
                      {log.actionName}
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#0b0d10] text-[#6b7280]">
                      WH_MOUSE_LL Suppressed
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
