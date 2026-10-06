/**
 * MasterGesture - Data Models & Types
 * Logitech MX Master Gesture Engine Specification
 */

export type MouseButtonId = 
  | 'thumb_gesture'  // Hidden thumb rest button (the primary gesture anchor)
  | 'forward'        // Upper side button
  | 'back'           // Lower side button
  | 'middle_click'   // Main scroll wheel press
  | 'mode_shift'     // Button behind scroll wheel
  | 'left_click'     // Left main button
  | 'right_click'    // Right main button
  | 'thumb_wheel_up' // Horizontal thumb wheel up
  | 'thumb_wheel_down'; // Horizontal thumb wheel down

export type GestureDirection = 'click' | 'up' | 'down' | 'left' | 'right';

export type ActionCategory = 
  | 'os_navigation'
  | 'window_mgmt'
  | 'media'
  | 'browser'
  | 'keyboard_shortcut'
  | 'macro'
  | 'system_command'
  | 'mouse_action'
  | 'none';

export interface KeyCombo {
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean; // Win key on Windows / Cmd key on macOS
  key: string;
  code?: string;
  displayName: string;
}

export interface MacroStep {
  id: string;
  type: 'key_down' | 'key_up' | 'delay' | 'mouse_click' | 'mouse_scroll';
  key?: string;
  delayMs?: number;
  mouseButton?: 'left' | 'right' | 'middle';
  scrollAmount?: number;
}

export interface ActionDefinition {
  id: string;
  category: ActionCategory;
  name: string;
  description: string;
  iconName: string;
  // Payload variants:
  keyCombo?: KeyCombo;
  macroSteps?: MacroStep[];
  command?: string;
  mouseActionType?: 'left_click' | 'right_click' | 'middle_click' | 'scroll_up' | 'scroll_down' | 'forward' | 'back';
  systemActionType?: 
    | 'task_view' 
    | 'mission_control' 
    | 'show_desktop' 
    | 'desktop_left' 
    | 'desktop_right' 
    | 'app_switcher' 
    | 'lock_workstation' 
    | 'media_play_pause' 
    | 'media_next' 
    | 'media_prev' 
    | 'volume_up' 
    | 'volume_down' 
    | 'volume_mute';
}

export interface GestureMapping {
  enabled: boolean;
  action: ActionDefinition;
}

export interface ButtonGestureConfig {
  buttonId: MouseButtonId;
  enabled: boolean;
  mode: 'gesture' | 'standard'; // 'gesture' triggers 5-way engine; 'standard' passes raw or maps single action
  standardAction?: ActionDefinition;
  thresholdPx: number; // Distance in pixels to trigger drag (default: 35)
  angularDeadzoneDeg: number; // Deadzone margin (e.g. 15 degrees)
  hapticFeedback: boolean;
  showHUD: boolean;
  gestures: {
    click: GestureMapping;
    up: GestureMapping;
    down: GestureMapping;
    left: GestureMapping;
    right: GestureMapping;
  };
}

export interface AppProfile {
  id: string;
  name: string;
  processNames: string[]; // e.g. ["chrome.exe", "google-chrome", "Google Chrome"]
  icon: string;
  color: string;
  description: string;
  buttons: Record<MouseButtonId, ButtonGestureConfig>;
}

export interface GlobalEngineSettings {
  pollingRateHz: number;
  globalThresholdPx: number;
  hudEnabled: boolean;
  hudDurationMs: number;
  hudTheme: 'dark' | 'neon' | 'minimal';
  audioFeedbackEnabled: boolean;
  suppressNativeHardwareEvent: boolean;
  targetPlatform: 'windows' | 'macos' | 'linux';
  // Portable & Non-Admin Auto-Start Settings
  startWithWindows: boolean;
  portableMode: boolean; // Keep config.json alongside .exe (zero registry footprint)
  startMinimizedToTray: boolean;
  aggressiveRamTrimming: boolean; // Calls EmptyWorkingSet / SetProcessWorkingSetSize for < 5MB RAM
  closeToTray: boolean;
}

export interface ConnectedMouseDevice {
  id: string;
  name: string;
  hardwareModel: string; // e.g. "Logitech MX Master 3S"
  vendorId?: string; // e.g. "0x046D"
  productId?: string; // e.g. "0xB023"
  connectionType: 'bluetooth' | 'logi_bolt' | 'unifying' | 'usb';
  activeProfileId: string;
  profiles: AppProfile[];
}

export interface MasterGestureConfig {
  version: string;
  engineSettings: GlobalEngineSettings;
  activeDeviceId: string;
  devices: Record<string, ConnectedMouseDevice>;
  // Fallback for single-device compatibility
  activeProfileId: string;
  profiles: AppProfile[];
}

export interface HardwareButtonInfo {
  id: MouseButtonId;
  label: string;
  subLabel: string;
  hardwareDetail: string;
  defaultGestureRole: string;
  isGestureRecommended: boolean;
}

export const HARDWARE_BUTTONS: HardwareButtonInfo[] = [
  {
    id: 'thumb_gesture',
    label: 'Thumb Rest Button',
    subLabel: 'Hidden tactile switch under thumb wing',
    hardwareDetail: 'HID Usage: Logitech Vendor Page or XBUTTON2 on Windows',
    defaultGestureRole: 'Primary Gesture Anchor (Mission Control / Desktops)',
    isGestureRecommended: true,
  },
  {
    id: 'mode_shift',
    label: 'Mode Shift Button',
    subLabel: 'Top button positioned behind SmartShift wheel',
    hardwareDetail: 'Standard HID Button 6 / Ratchet-FreeWheel Toggle',
    defaultGestureRole: 'Secondary Gesture Anchor or App Switcher',
    isGestureRecommended: true,
  },
  {
    id: 'middle_click',
    label: 'Scroll Wheel Click',
    subLabel: 'MagSpeed electromagnetic wheel press',
    hardwareDetail: 'Standard HID Button 3 / MOUSEEVENTF_MIDDLEDOWN',
    defaultGestureRole: 'Tab Operations / Pan / Quick Gestures',
    isGestureRecommended: true,
  },
  {
    id: 'forward',
    label: 'Forward Button',
    subLabel: 'Upper side thumb button',
    hardwareDetail: 'Standard HID Button 5 / XBUTTON2',
    defaultGestureRole: 'Browser Forward or Window Snapping',
    isGestureRecommended: true,
  },
  {
    id: 'back',
    label: 'Back Button',
    subLabel: 'Lower side thumb button',
    hardwareDetail: 'Standard HID Button 4 / XBUTTON1',
    defaultGestureRole: 'Browser Back or Media Controls',
    isGestureRecommended: true,
  },
  {
    id: 'left_click',
    label: 'Left Click',
    subLabel: 'Primary left mechanical switch',
    hardwareDetail: 'HID Button 1 / MOUSEEVENTF_LEFTDOWN',
    defaultGestureRole: 'Standard pointer click (Advanced customization available)',
    isGestureRecommended: false,
  },
  {
    id: 'right_click',
    label: 'Right Click',
    subLabel: 'Secondary right mechanical switch',
    hardwareDetail: 'HID Button 2 / MOUSEEVENTF_RIGHTDOWN',
    defaultGestureRole: 'Context menu (Advanced customization available)',
    isGestureRecommended: false,
  },
];
