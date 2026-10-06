/**
 * MasterGesture - Predefined Actions and App Profiles
 */

import { ActionDefinition, AppProfile, MasterGestureConfig, MouseButtonId, ButtonGestureConfig } from './gestures';

export const PRESET_ACTIONS: Record<string, ActionDefinition> = {
  // Navigation & OS
  TASK_VIEW: {
    id: 'act_task_view',
    category: 'os_navigation',
    name: 'Task View / Mission Control',
    description: 'Show overview of all open windows',
    iconName: 'LayoutGrid',
    keyCombo: { meta: true, key: 'Tab', displayName: 'Win + Tab' },
    systemActionType: 'task_view',
  },
  SHOW_DESKTOP: {
    id: 'act_show_desktop',
    category: 'os_navigation',
    name: 'Show Desktop',
    description: 'Minimize or hide all windows',
    iconName: 'Monitor',
    keyCombo: { meta: true, key: 'd', displayName: 'Win + D' },
    systemActionType: 'show_desktop',
  },
  DESKTOP_LEFT: {
    id: 'act_desktop_left',
    category: 'os_navigation',
    name: 'Previous Virtual Desktop',
    description: 'Switch to workspace on the left',
    iconName: 'ChevronLeft',
    keyCombo: { ctrl: true, meta: true, key: 'ArrowLeft', displayName: 'Ctrl + Win + Left' },
    systemActionType: 'desktop_left',
  },
  DESKTOP_RIGHT: {
    id: 'act_desktop_right',
    category: 'os_navigation',
    name: 'Next Virtual Desktop',
    description: 'Switch to workspace on the right',
    iconName: 'ChevronRight',
    keyCombo: { ctrl: true, meta: true, key: 'ArrowRight', displayName: 'Ctrl + Win + Right' },
    systemActionType: 'desktop_right',
  },
  APP_SWITCHER: {
    id: 'act_app_switcher',
    category: 'os_navigation',
    name: 'App Switcher (Alt + Tab)',
    description: 'Toggle between open running applications',
    iconName: 'Layers',
    keyCombo: { alt: true, key: 'Tab', displayName: 'Alt + Tab' },
    systemActionType: 'app_switcher',
  },
  LOCK_PC: {
    id: 'act_lock_pc',
    category: 'os_navigation',
    name: 'Lock Screen',
    description: 'Instantly lock the operating system',
    iconName: 'Lock',
    keyCombo: { meta: true, key: 'l', displayName: 'Win + L' },
    systemActionType: 'lock_workstation',
  },

  // Window Management
  SNAP_LEFT: {
    id: 'act_snap_left',
    category: 'window_mgmt',
    name: 'Snap Window Left',
    description: 'Tile window to left half of screen',
    iconName: 'SplitSquareVertical',
    keyCombo: { meta: true, key: 'ArrowLeft', displayName: 'Win + Left' },
  },
  SNAP_RIGHT: {
    id: 'act_snap_right',
    category: 'window_mgmt',
    name: 'Snap Window Right',
    description: 'Tile window to right half of screen',
    iconName: 'SplitSquareVertical',
    keyCombo: { meta: true, key: 'ArrowRight', displayName: 'Win + Right' },
  },
  MAXIMIZE_WINDOW: {
    id: 'act_maximize',
    category: 'window_mgmt',
    name: 'Maximize Window',
    description: 'Expand active window to full screen',
    iconName: 'Maximize2',
    keyCombo: { meta: true, key: 'ArrowUp', displayName: 'Win + Up' },
  },
  MINIMIZE_WINDOW: {
    id: 'act_minimize',
    category: 'window_mgmt',
    name: 'Minimize Window',
    description: 'Send active window to taskbar/dock',
    iconName: 'Minimize2',
    keyCombo: { meta: true, key: 'ArrowDown', displayName: 'Win + Down' },
  },

  // Media Controls
  MEDIA_PLAY_PAUSE: {
    id: 'act_media_play_pause',
    category: 'media',
    name: 'Play / Pause',
    description: 'Toggle current media playback',
    iconName: 'Play',
    systemActionType: 'media_play_pause',
  },
  MEDIA_NEXT: {
    id: 'act_media_next',
    category: 'media',
    name: 'Next Track',
    description: 'Skip to next music or video track',
    iconName: 'SkipForward',
    systemActionType: 'media_next',
  },
  MEDIA_PREV: {
    id: 'act_media_prev',
    category: 'media',
    name: 'Previous Track',
    description: 'Return to previous track',
    iconName: 'SkipBack',
    systemActionType: 'media_prev',
  },
  VOLUME_UP: {
    id: 'act_volume_up',
    category: 'media',
    name: 'Volume Up',
    description: 'Increase master audio output level',
    iconName: 'Volume2',
    systemActionType: 'volume_up',
  },
  VOLUME_DOWN: {
    id: 'act_volume_down',
    category: 'media',
    name: 'Volume Down',
    description: 'Decrease master audio output level',
    iconName: 'Volume1',
    systemActionType: 'volume_down',
  },
  VOLUME_MUTE: {
    id: 'act_volume_mute',
    category: 'media',
    name: 'Mute / Unmute',
    description: 'Silence master audio output',
    iconName: 'VolumeX',
    systemActionType: 'volume_mute',
  },

  // Browser & Productivity
  NEW_TAB: {
    id: 'act_new_tab',
    category: 'browser',
    name: 'New Tab',
    description: 'Open a blank browser tab',
    iconName: 'PlusCircle',
    keyCombo: { ctrl: true, key: 't', displayName: 'Ctrl + T' },
  },
  CLOSE_TAB: {
    id: 'act_close_tab',
    category: 'browser',
    name: 'Close Tab',
    description: 'Close active browser tab or document',
    iconName: 'XCircle',
    keyCombo: { ctrl: true, key: 'w', displayName: 'Ctrl + W' },
  },
  REOPEN_CLOSED_TAB: {
    id: 'act_reopen_tab',
    category: 'browser',
    name: 'Reopen Closed Tab',
    description: 'Restore last closed tab',
    iconName: 'RotateCcw',
    keyCombo: { ctrl: true, shift: true, key: 't', displayName: 'Ctrl + Shift + T' },
  },
  ZOOM_IN: {
    id: 'act_zoom_in',
    category: 'browser',
    name: 'Zoom In',
    description: 'Enlarge content view',
    iconName: 'ZoomIn',
    keyCombo: { ctrl: true, key: '=', displayName: 'Ctrl + Plus' },
  },
  ZOOM_OUT: {
    id: 'act_zoom_out',
    category: 'browser',
    name: 'Zoom Out',
    description: 'Reduce content view',
    iconName: 'ZoomOut',
    keyCombo: { ctrl: true, key: '-', displayName: 'Ctrl + Minus' },
  },

  // Creative & Developer
  UNDO: {
    id: 'act_undo',
    category: 'keyboard_shortcut',
    name: 'Undo',
    description: 'Revert last action',
    iconName: 'Undo2',
    keyCombo: { ctrl: true, key: 'z', displayName: 'Ctrl + Z' },
  },
  REDO: {
    id: 'act_redo',
    category: 'keyboard_shortcut',
    name: 'Redo',
    description: 'Re-apply previously undone action',
    iconName: 'Redo2',
    keyCombo: { ctrl: true, key: 'y', displayName: 'Ctrl + Y' },
  },
  PREMIERE_SPLIT_RAZOR: {
    id: 'act_razor_cut',
    category: 'keyboard_shortcut',
    name: 'Razor Blade Cut at Playhead',
    description: 'Split all clips at current timeline position',
    iconName: 'Scissors',
    keyCombo: { ctrl: true, key: 'k', displayName: 'Ctrl + K' },
  },
  PREMIERE_RIPPLE_DELETE: {
    id: 'act_ripple_del',
    category: 'keyboard_shortcut',
    name: 'Ripple Delete',
    description: 'Delete gap or clip and collapse timeline',
    iconName: 'Trash2',
    keyCombo: { shift: true, key: 'Delete', displayName: 'Shift + Del' },
  },
  VSCODE_COMMAND_PALETTE: {
    id: 'act_vscode_cmd',
    category: 'keyboard_shortcut',
    name: 'VS Code Command Palette',
    description: 'Open quick search and commands in VS Code',
    iconName: 'Terminal',
    keyCombo: { ctrl: true, shift: true, key: 'p', displayName: 'Ctrl + Shift + P' },
  },
  FIGMA_ZOOM_FIT: {
    id: 'act_figma_zoom_fit',
    category: 'keyboard_shortcut',
    name: 'Figma Zoom to Fit',
    description: 'Frame entire canvas in viewport',
    iconName: 'Scan',
    keyCombo: { shift: true, key: '1', displayName: 'Shift + 1' },
  },
  NONE: {
    id: 'act_none',
    category: 'none',
    name: 'Do Nothing',
    description: 'Ignore gesture trigger',
    iconName: 'Ban',
  }
};

export const createDefaultButtonConfig = (buttonId: MouseButtonId): ButtonGestureConfig => {
  if (buttonId === 'thumb_gesture') {
    return {
      buttonId,
      enabled: true,
      mode: 'gesture',
      thresholdPx: 35,
      angularDeadzoneDeg: 12,
      hapticFeedback: true,
      showHUD: true,
      gestures: {
        click: { enabled: true, action: PRESET_ACTIONS.TASK_VIEW },
        up: { enabled: true, action: PRESET_ACTIONS.MAXIMIZE_WINDOW },
        down: { enabled: true, action: PRESET_ACTIONS.SHOW_DESKTOP },
        left: { enabled: true, action: PRESET_ACTIONS.DESKTOP_LEFT },
        right: { enabled: true, action: PRESET_ACTIONS.DESKTOP_RIGHT },
      }
    };
  }

  if (buttonId === 'mode_shift') {
    return {
      buttonId,
      enabled: true,
      mode: 'gesture',
      thresholdPx: 35,
      angularDeadzoneDeg: 15,
      hapticFeedback: true,
      showHUD: true,
      gestures: {
        click: { enabled: true, action: PRESET_ACTIONS.APP_SWITCHER },
        up: { enabled: true, action: PRESET_ACTIONS.VOLUME_UP },
        down: { enabled: true, action: PRESET_ACTIONS.VOLUME_DOWN },
        left: { enabled: true, action: PRESET_ACTIONS.MEDIA_PREV },
        right: { enabled: true, action: PRESET_ACTIONS.MEDIA_NEXT },
      }
    };
  }

  if (buttonId === 'middle_click') {
    return {
      buttonId,
      enabled: true,
      mode: 'standard',
      thresholdPx: 40,
      angularDeadzoneDeg: 15,
      hapticFeedback: false,
      showHUD: false,
      standardAction: {
        id: 'act_mid_click',
        category: 'mouse_action',
        name: 'Middle Click',
        description: 'Standard middle click / autoscroll',
        iconName: 'Mouse',
        mouseActionType: 'middle_click',
      },
      gestures: {
        click: { enabled: true, action: PRESET_ACTIONS.CLOSE_TAB },
        up: { enabled: false, action: PRESET_ACTIONS.ZOOM_IN },
        down: { enabled: false, action: PRESET_ACTIONS.ZOOM_OUT },
        left: { enabled: false, action: PRESET_ACTIONS.REOPEN_CLOSED_TAB },
        right: { enabled: false, action: PRESET_ACTIONS.NEW_TAB },
      }
    };
  }

  if (buttonId === 'forward') {
    return {
      buttonId,
      enabled: true,
      mode: 'standard',
      thresholdPx: 35,
      angularDeadzoneDeg: 15,
      hapticFeedback: true,
      showHUD: true,
      standardAction: {
        id: 'act_fwd',
        category: 'mouse_action',
        name: 'Forward',
        description: 'Navigate forward in history',
        iconName: 'ArrowRight',
        mouseActionType: 'forward',
      },
      gestures: {
        click: { enabled: true, action: PRESET_ACTIONS.REDO },
        up: { enabled: true, action: PRESET_ACTIONS.SNAP_RIGHT },
        down: { enabled: true, action: PRESET_ACTIONS.MINIMIZE_WINDOW },
        left: { enabled: true, action: PRESET_ACTIONS.DESKTOP_LEFT },
        right: { enabled: true, action: PRESET_ACTIONS.DESKTOP_RIGHT },
      }
    };
  }

  if (buttonId === 'back') {
    return {
      buttonId,
      enabled: true,
      mode: 'standard',
      thresholdPx: 35,
      angularDeadzoneDeg: 15,
      hapticFeedback: true,
      showHUD: true,
      standardAction: {
        id: 'act_back',
        category: 'mouse_action',
        name: 'Back',
        description: 'Navigate back in history',
        iconName: 'ArrowLeft',
        mouseActionType: 'back',
      },
      gestures: {
        click: { enabled: true, action: PRESET_ACTIONS.UNDO },
        up: { enabled: true, action: PRESET_ACTIONS.SNAP_LEFT },
        down: { enabled: true, action: PRESET_ACTIONS.SHOW_DESKTOP },
        left: { enabled: true, action: PRESET_ACTIONS.DESKTOP_LEFT },
        right: { enabled: true, action: PRESET_ACTIONS.DESKTOP_RIGHT },
      }
    };
  }

  // Left & Right click default to standard mouse actions
  return {
    buttonId,
    enabled: false,
    mode: 'standard',
    thresholdPx: 50,
    angularDeadzoneDeg: 15,
    hapticFeedback: false,
    showHUD: false,
    standardAction: {
      id: `act_${buttonId}`,
      category: 'mouse_action',
      name: buttonId === 'left_click' ? 'Primary Left Click' : 'Secondary Right Click',
      description: 'Standard OS mouse click',
      iconName: 'Mouse',
      mouseActionType: buttonId === 'left_click' ? 'left_click' : 'right_click',
    },
    gestures: {
      click: { enabled: false, action: PRESET_ACTIONS.NONE },
      up: { enabled: false, action: PRESET_ACTIONS.NONE },
      down: { enabled: false, action: PRESET_ACTIONS.NONE },
      left: { enabled: false, action: PRESET_ACTIONS.NONE },
      right: { enabled: false, action: PRESET_ACTIONS.NONE },
    }
  };
};

export const createProfile = (id: string, name: string, processNames: string[], icon: string, color: string, description: string): AppProfile => {
  const buttons: Record<MouseButtonId, ButtonGestureConfig> = {
    thumb_gesture: createDefaultButtonConfig('thumb_gesture'),
    mode_shift: createDefaultButtonConfig('mode_shift'),
    middle_click: createDefaultButtonConfig('middle_click'),
    forward: createDefaultButtonConfig('forward'),
    back: createDefaultButtonConfig('back'),
    left_click: createDefaultButtonConfig('left_click'),
    right_click: createDefaultButtonConfig('right_click'),
    thumb_wheel_up: createDefaultButtonConfig('thumb_wheel_up' as any),
    thumb_wheel_down: createDefaultButtonConfig('thumb_wheel_down' as any),
  };

  return { id, name, processNames, icon, color, description, buttons };
};

export const INITIAL_CONFIG: MasterGestureConfig = {
  version: '1.0.0',
  engineSettings: {
    pollingRateHz: 1000,
    globalThresholdPx: 35,
    hudEnabled: true,
    hudDurationMs: 900,
    hudTheme: 'neon',
    audioFeedbackEnabled: true,
    suppressNativeHardwareEvent: true,
    targetPlatform: 'windows',
    startWithWindows: true,
    portableMode: true,
    startMinimizedToTray: true,
    aggressiveRamTrimming: true,
    closeToTray: true,
  },
  activeDeviceId: 'device_mx_master_3s_desk',
  activeProfileId: 'profile_global',
  devices: {
    'device_mx_master_3s_desk': {
      id: 'device_mx_master_3s_desk',
      name: 'MX Master 3S (Office Desk)',
      hardwareModel: 'Logitech MX Master 3S',
      vendorId: '0x046D',
      productId: '0xB023',
      connectionType: 'logi_bolt',
      activeProfileId: 'profile_global',
      profiles: [
        createProfile('profile_global', 'Global (Default OS)', ['*'], 'Globe', '#9ca3af', 'Primary desktop configuration for MX Master 3S'),
        createProfile('profile_chrome', 'Google Chrome', ['chrome.exe', 'google-chrome'], 'Chrome', '#9ca3af', 'Web navigation & tab switching'),
        createProfile('profile_premiere', 'Premiere Pro', ['Adobe Premiere Pro.exe'], 'Film', '#9ca3af', 'Timeline editing & razor cut'),
      ]
    },
    'device_mx_master_2s_travel': {
      id: 'device_mx_master_2s_travel',
      name: 'MX Master 2S (Travel Laptop)',
      hardwareModel: 'Logitech MX Master 2S',
      vendorId: '0x046D',
      productId: '0xB019',
      connectionType: 'bluetooth',
      activeProfileId: 'profile_global',
      profiles: [
        createProfile('profile_global', 'Global (Laptop Mode)', ['*'], 'Globe', '#9ca3af', 'Laptop gesture profile for MX Master 2S'),
        createProfile('profile_vscode', 'VS Code', ['Code.exe', 'code'], 'Code2', '#9ca3af', 'Code formatting and terminal navigation'),
      ]
    }
  },
  profiles: [
    {
      ...createProfile('profile_global', 'Global (Default OS)', ['*'], 'Globe', '#38bdf8', 'Applies everywhere unless a dedicated app profile is active.'),
    },
    {
      ...createProfile('profile_chrome', 'Google Chrome', ['chrome.exe', 'google-chrome', 'Google Chrome'], 'Chrome', '#f59e0b', 'Optimized for web browsing, tab switching, and navigation.'),
      buttons: {
        ...createProfile('profile_chrome', '', [], '', '', '').buttons,
        thumb_gesture: {
          ...createDefaultButtonConfig('thumb_gesture'),
          gestures: {
            click: { enabled: true, action: PRESET_ACTIONS.NEW_TAB },
            up: { enabled: true, action: PRESET_ACTIONS.REOPEN_CLOSED_TAB },
            down: { enabled: true, action: PRESET_ACTIONS.CLOSE_TAB },
            left: { enabled: true, action: { id: 'chrome_prev_tab', category: 'browser', name: 'Previous Tab', description: 'Ctrl + Shift + Tab', iconName: 'ChevronLeft', keyCombo: { ctrl: true, shift: true, key: 'Tab', displayName: 'Ctrl + Shift + Tab' } } },
            right: { enabled: true, action: { id: 'chrome_next_tab', category: 'browser', name: 'Next Tab', description: 'Ctrl + Tab', iconName: 'ChevronRight', keyCombo: { ctrl: true, key: 'Tab', displayName: 'Ctrl + Tab' } } },
          }
        }
      }
    },
    {
      ...createProfile('profile_premiere', 'Adobe Premiere Pro', ['Adobe Premiere Pro.exe', 'Premiere Pro'], 'Film', '#8b5cf6', 'Video timeline editing, razor split, ripple delete, playhead scrubbing.'),
      buttons: {
        ...createProfile('profile_premiere', '', [], '', '', '').buttons,
        thumb_gesture: {
          ...createDefaultButtonConfig('thumb_gesture'),
          gestures: {
            click: { enabled: true, action: PRESET_ACTIONS.PREMIERE_SPLIT_RAZOR },
            up: { enabled: true, action: PRESET_ACTIONS.PREMIERE_RIPPLE_DELETE },
            down: { enabled: true, action: PRESET_ACTIONS.UNDO },
            left: { enabled: true, action: { id: 'prem_prev_cut', category: 'keyboard_shortcut', name: 'Previous Edit Point', description: 'Go to previous cut', iconName: 'SkipBack', keyCombo: { key: 'ArrowUp', displayName: 'Up Arrow' } } },
            right: { enabled: true, action: { id: 'prem_next_cut', category: 'keyboard_shortcut', name: 'Next Edit Point', description: 'Go to next cut', iconName: 'SkipForward', keyCombo: { key: 'ArrowDown', displayName: 'Down Arrow' } } },
          }
        }
      }
    },
    {
      ...createProfile('profile_vscode', 'Visual Studio Code', ['Code.exe', 'code', 'Visual Studio Code'], 'Code2', '#3b82f6', 'Code navigation, command palette, terminal toggling, multi-cursor.'),
      buttons: {
        ...createProfile('profile_vscode', '', [], '', '', '').buttons,
        thumb_gesture: {
          ...createDefaultButtonConfig('thumb_gesture'),
          gestures: {
            click: { enabled: true, action: PRESET_ACTIONS.VSCODE_COMMAND_PALETTE },
            up: { enabled: true, action: { id: 'vsc_toggle_term', category: 'keyboard_shortcut', name: 'Toggle Terminal', description: 'Ctrl + `', iconName: 'Terminal', keyCombo: { ctrl: true, key: '`', displayName: 'Ctrl + `' } } },
            down: { enabled: true, action: { id: 'vsc_format_doc', category: 'keyboard_shortcut', name: 'Format Document', description: 'Shift + Alt + F', iconName: 'FileCheck', keyCombo: { shift: true, alt: true, key: 'f', displayName: 'Shift + Alt + F' } } },
            left: { enabled: true, action: { id: 'vsc_back_nav', category: 'keyboard_shortcut', name: 'Go Back in Code', description: 'Alt + Left', iconName: 'ChevronLeft', keyCombo: { alt: true, key: 'ArrowLeft', displayName: 'Alt + Left' } } },
            right: { enabled: true, action: { id: 'vsc_fwd_nav', category: 'keyboard_shortcut', name: 'Go Forward in Code', description: 'Alt + Right', iconName: 'ChevronRight', keyCombo: { alt: true, key: 'ArrowRight', displayName: 'Alt + Right' } } },
          }
        }
      }
    },
    {
      ...createProfile('profile_figma', 'Figma', ['Figma.exe', 'Figma'], 'PenTool', '#ec4899', 'Design workflow, frame zoom, component detachment, grouping.'),
      buttons: {
        ...createProfile('profile_figma', '', [], '', '', '').buttons,
        thumb_gesture: {
          ...createDefaultButtonConfig('thumb_gesture'),
          gestures: {
            click: { enabled: true, action: PRESET_ACTIONS.FIGMA_ZOOM_FIT },
            up: { enabled: true, action: { id: 'figma_zoom_sel', category: 'keyboard_shortcut', name: 'Zoom to Selection', description: 'Shift + 2', iconName: 'Focus', keyCombo: { shift: true, key: '2', displayName: 'Shift + 2' } } },
            down: { enabled: true, action: { id: 'figma_group', category: 'keyboard_shortcut', name: 'Group Selection', description: 'Ctrl + G', iconName: 'Boxes', keyCombo: { ctrl: true, key: 'g', displayName: 'Ctrl + G' } } },
            left: { enabled: true, action: PRESET_ACTIONS.UNDO },
            right: { enabled: true, action: PRESET_ACTIONS.REDO },
          }
        }
      }
    }
  ]
};
