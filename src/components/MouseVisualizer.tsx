import React from 'react';
import { MouseButtonId, HARDWARE_BUTTONS, ButtonGestureConfig } from '../types/gestures';
import { Sliders, Activity } from 'lucide-react';

interface MouseVisualizerProps {
  selectedButtonId: MouseButtonId;
  onSelectButton: (buttonId: MouseButtonId) => void;
  activeButtonsConfig: Record<MouseButtonId, ButtonGestureConfig>;
  activePhysicalButton?: MouseButtonId | null;
}

export const MouseVisualizer: React.FC<MouseVisualizerProps> = ({
  selectedButtonId,
  onSelectButton,
  activeButtonsConfig,
  activePhysicalButton,
}) => {
  const isSelected = (id: MouseButtonId) => selectedButtonId === id;
  const isPhysicallyPressed = (id: MouseButtonId) => activePhysicalButton === id;
  const isGestureMode = (id: MouseButtonId) => activeButtonsConfig[id]?.mode === 'gesture';

  return (
    <div className="relative flex flex-col items-center justify-center p-5 bg-[#0f1217] rounded-xl border border-[#252c38] shadow-2xl font-mono">
      {/* Top Banner / Device Status - Utilitarian Industrial */}
      <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-[#222833] text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-bold text-slate-200 uppercase tracking-widest text-[11px]">
            HARDWARE SCHEMATIC // MX MASTER
          </span>
          <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#161a22] text-[#9ca3af] border border-[#2d3644]">
            RAW HID: 0x046D
          </span>
        </div>
        <div className="text-[#808997] text-[10px] flex items-center gap-1.5">
          <Sliders className="w-3 h-3 text-[#9ca3af]" />
          <span>Click hotspot to map</span>
        </div>
      </div>

      {/* Interactive SVG Schematic of Logitech MX Master (Matte Black / Industrial Grey) */}
      <div className="relative w-full max-w-[360px] h-[400px] flex items-center justify-center select-none py-1">
        <svg
          viewBox="0 0 400 480"
          className="w-full h-full filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
        >
          <defs>
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1c2026" />
              <stop offset="50%" stopColor="#15181e" />
              <stop offset="100%" stopColor="#0e1014" />
            </linearGradient>

            <linearGradient id="thumbWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#222730" />
              <stop offset="70%" stopColor="#171b22" />
              <stop offset="100%" stopColor="#101217" />
            </linearGradient>

            <linearGradient id="metalWheelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2b313b" />
              <stop offset="30%" stopColor="#64748b" />
              <stop offset="50%" stopColor="#94a3b8" />
              <stop offset="70%" stopColor="#64748b" />
              <stop offset="100%" stopColor="#1e232b" />
            </linearGradient>
          </defs>

          {/* Mouse Outer Body Drop Shadow Silhouette */}
          <path
            d="M 120 180 
               C 90 220, 60 270, 65 340 
               C 70 395, 110 435, 180 445 
               C 250 455, 310 420, 325 350 
               C 340 280, 330 190, 310 120 
               C 295 70, 260 30, 205 28 
               C 160 26, 135 65, 130 110 
               Z"
            fill="#050608"
            opacity="0.8"
            transform="translate(4, 8)"
          />

          {/* Sculpted Mouse Ergonomic Outer Shell */}
          <path
            d="M 135 170 
               C 105 210, 75 255, 80 325 
               C 85 385, 120 425, 185 435 
               C 255 445, 310 410, 322 340 
               C 334 270, 322 185, 305 120 
               C 290 68, 255 35, 205 32 
               C 165 30, 145 68, 140 115 
               Z"
            fill="url(#bodyGrad)"
            stroke="#2e3745"
            strokeWidth="2"
          />

          {/* Left Ergonomic Thumb Wing Extension */}
          <path
            d="M 145 190 
               C 115 200, 70 230, 45 280 
               C 25 320, 30 365, 60 395 
               C 85 420, 125 425, 150 420 
               C 125 380, 115 320, 125 270 
               C 130 240, 138 215, 145 190 Z"
            fill="url(#thumbWingGrad)"
            stroke={isSelected('thumb_gesture') ? '#f59e0b' : '#333d4b'}
            strokeWidth={isSelected('thumb_gesture') ? '2.5' : '1.5'}
            className="cursor-pointer transition-all duration-200"
            onClick={() => onSelectButton('thumb_gesture')}
          />

          {/* Texture ribs on Thumb Wing */}
          <g opacity="0.3" stroke="#6b7280" strokeWidth="1.2">
            <line x1="60" y1="310" x2="105" y2="295" />
            <line x1="62" y1="325" x2="108" y2="310" />
            <line x1="66" y1="340" x2="112" y2="325" />
            <line x1="72" y1="355" x2="116" y2="340" />
            <line x1="80" y1="370" x2="122" y2="355" />
          </g>

          {/* Center Seam dividing Left & Right Click */}
          <path d="M 205 32 L 205 175" stroke="#12151b" strokeWidth="2.5" />

          {/* Left Click Plate */}
          <path
            d="M 203 33 
               C 165 31, 145 68, 140 115 
               C 137 135, 140 155, 145 175 
               L 203 175 Z"
            fill={isPhysicallyPressed('left_click') ? '#374151' : isSelected('left_click') ? '#242b36' : '#181b21'}
            stroke={isSelected('left_click') ? '#f59e0b' : '#2a3340'}
            strokeWidth={isSelected('left_click') ? '2' : '1'}
            className="cursor-pointer transition-all duration-200 hover:brightness-125"
            onClick={() => onSelectButton('left_click')}
          />

          {/* Right Click Plate */}
          <path
            d="M 207 33 
               C 255 35, 290 68, 305 120 
               C 310 138, 311 156, 310 175 
               L 207 175 Z"
            fill={isPhysicallyPressed('right_click') ? '#374151' : isSelected('right_click') ? '#242b36' : '#181b21'}
            stroke={isSelected('right_click') ? '#f59e0b' : '#2a3340'}
            strokeWidth={isSelected('right_click') ? '2' : '1'}
            className="cursor-pointer transition-all duration-200 hover:brightness-125"
            onClick={() => onSelectButton('right_click')}
          />

          {/* Scroll Wheel Well Housing */}
          <rect
            x="193"
            y="55"
            width="24"
            height="70"
            rx="12"
            fill="#090b0e"
            stroke="#2b3442"
            strokeWidth="1.5"
          />

          {/* MagSpeed Metal Scroll Wheel (Middle Click) */}
          <g
            className="cursor-pointer transition-all duration-200 hover:brightness-125"
            onClick={() => onSelectButton('middle_click')}
          >
            <rect
              x="196"
              y="60"
              width="18"
              height="58"
              rx="9"
              fill={isPhysicallyPressed('middle_click') ? '#4b5563' : isSelected('middle_click') ? '#374151' : 'url(#metalWheelGrad)'}
              stroke={isSelected('middle_click') ? '#f59e0b' : '#475569'}
              strokeWidth={isSelected('middle_click') ? '2' : '1'}
            />
            {/* Serration Ridges */}
            <line x1="197" y1="68" x2="213" y2="68" stroke="#1e242c" strokeWidth="1.5" />
            <line x1="197" y1="76" x2="213" y2="76" stroke="#1e242c" strokeWidth="1.5" />
            <line x1="197" y1="84" x2="213" y2="84" stroke="#1e242c" strokeWidth="1.5" />
            <line x1="197" y1="92" x2="213" y2="92" stroke="#1e242c" strokeWidth="1.5" />
            <line x1="197" y1="100" x2="213" y2="100" stroke="#1e242c" strokeWidth="1.5" />
            <line x1="197" y1="108" x2="213" y2="108" stroke="#1e242c" strokeWidth="1.5" />
          </g>

          {/* Mode Shift Button */}
          <g
            className="cursor-pointer transition-all duration-200 hover:brightness-125"
            onClick={() => onSelectButton('mode_shift')}
          >
            <rect
              x="197"
              y="138"
              width="16"
              height="20"
              rx="4"
              fill={isPhysicallyPressed('mode_shift') ? '#4b5563' : isSelected('mode_shift') ? '#374151' : '#1e242c'}
              stroke={isSelected('mode_shift') ? '#f59e0b' : '#475569'}
              strokeWidth={isSelected('mode_shift') ? '2' : '1'}
            />
            <circle cx="205" cy="148" r="2.5" fill={isSelected('mode_shift') ? '#f59e0b' : '#9ca3af'} />
          </g>

          {/* Horizontal Thumb Wheel */}
          <rect
            x="115"
            y="218"
            width="14"
            height="32"
            rx="5"
            fill="#232832"
            stroke="#363f4e"
            strokeWidth="1"
            className="opacity-80"
          />
          <line x1="116" y1="226" x2="128" y2="226" stroke="#4b5563" strokeWidth="1" />
          <line x1="116" y1="234" x2="128" y2="234" stroke="#4b5563" strokeWidth="1" />
          <line x1="116" y1="242" x2="128" y2="242" stroke="#4b5563" strokeWidth="1" />

          {/* Forward Button */}
          <g
            className="cursor-pointer transition-all duration-200 hover:brightness-125"
            onClick={() => onSelectButton('forward')}
          >
            <path
              d="M 120 258 L 132 258 L 130 274 L 118 274 Z"
              fill={isSelected('forward') ? '#374151' : '#1d222b'}
              stroke={isSelected('forward') ? '#f59e0b' : '#394354'}
              strokeWidth={isSelected('forward') ? '2' : '1'}
            />
          </g>

          {/* Back Button */}
          <g
            className="cursor-pointer transition-all duration-200 hover:brightness-125"
            onClick={() => onSelectButton('back')}
          >
            <path
              d="M 116 278 L 129 278 L 126 295 L 113 295 Z"
              fill={isSelected('back') ? '#374151' : '#1d222b'}
              stroke={isSelected('back') ? '#f59e0b' : '#394354'}
              strokeWidth={isSelected('back') ? '2' : '1'}
            />
          </g>

          {/* THE ICONIC THUMB GESTURE BUTTON */}
          <g
            className="cursor-pointer transition-all duration-300"
            onClick={() => onSelectButton('thumb_gesture')}
          >
            <circle
              cx="75"
              cy="365"
              r="28"
              fill={isPhysicallyPressed('thumb_gesture') ? '#374151' : isSelected('thumb_gesture') ? '#242a35' : '#161920'}
              stroke={isSelected('thumb_gesture') ? '#f59e0b' : '#3f4b5d'}
              strokeWidth={isSelected('thumb_gesture') ? '2.5' : '1.5'}
              strokeDasharray={isSelected('thumb_gesture') ? undefined : '2 2'}
            />
            <circle
              cx="75"
              cy="365"
              r="12"
              fill={isSelected('thumb_gesture') ? '#f59e0b' : '#2b3341'}
            />
            <path
              d="M 75 358 L 75 372 M 68 365 L 82 365"
              stroke={isSelected('thumb_gesture') ? '#0c0e12' : '#9ca3af'}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        </svg>

        {/* Quick Pill for Thumb Gesture */}
        <div 
          onClick={() => onSelectButton('thumb_gesture')}
          className={`absolute left-0 bottom-2 cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-mono transition-all ${
            isSelected('thumb_gesture')
              ? 'bg-[#1e2531] border-amber-400 text-amber-300 shadow-lg'
              : 'bg-[#141820] border-[#2c3543] text-slate-300 hover:border-slate-500'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="font-bold">THUMB REST BUTTON</span>
          <span className="text-[9px] px-1 py-0.2 rounded bg-[#0b0d10] text-[#9ca3af]">
            5-WAY
          </span>
        </div>
      </div>

      {/* Button Selection Strip below Schematic - Utilitarian Matrix */}
      <div className="w-full mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        {HARDWARE_BUTTONS.slice(0, 5).map((btn) => {
          const selected = isSelected(btn.id);
          const gestureOn = isGestureMode(btn.id);

          return (
            <button
              key={btn.id}
              onClick={() => onSelectButton(btn.id)}
              className={`flex flex-col text-left p-2.5 rounded border transition-all ${
                selected
                  ? 'bg-[#1e2531] border-amber-400/80 text-white shadow-sm'
                  : 'bg-[#13161c] border-[#222833] hover:bg-[#181d25] hover:border-[#2f3846]'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-medium ${selected ? 'text-amber-300 font-bold' : 'text-slate-300'}`}>
                  {btn.label}
                </span>
                {gestureOn ? (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-[#0d0f13] text-amber-400 border border-[#3b3424]">
                    5-WAY
                  </span>
                ) : (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-[#0d0f13] text-[#6b7280]">
                    DIRECT
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#6b7280] truncate mt-0.5 font-sans">
                {btn.subLabel}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => onSelectButton('left_click')}
          className={`flex flex-col text-left p-2.5 rounded border transition-all ${
            isSelected('left_click') || isSelected('right_click')
              ? 'bg-[#1e2531] border-amber-400/80 text-white'
              : 'bg-[#13161c] border-[#222833] hover:bg-[#181d25]'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-medium text-slate-300">Left / Right Click</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-[#0d0f13] text-[#6b7280]">
              RAW
            </span>
          </div>
          <span className="text-[10px] text-[#6b7280] truncate mt-0.5 font-sans">
            Extreme override
          </span>
        </button>
      </div>
    </div>
  );
};
