import React, { useState } from 'react';
import { MasterGestureConfig, ConnectedMouseDevice } from '../types/gestures';
import { 
  Copy, 
  Check, 
  Save, 
  Plus, 
  Trash2, 
  FileJson, 
  HardDrive, 
  Sliders, 
  RefreshCw,
  AlertCircle,
  Terminal,
  MousePointer2
} from 'lucide-react';

interface MultiMouseConfigEditorProps {
  config: MasterGestureConfig;
  onUpdateConfig: (newConfig: MasterGestureConfig) => void;
}

export const MultiMouseConfigEditor: React.FC<MultiMouseConfigEditorProps> = ({
  config,
  onUpdateConfig,
}) => {
  const devices = config.devices || {};
  const deviceKeys = Object.keys(devices);
  const activeDeviceId = config.activeDeviceId || deviceKeys[0] || 'device_mx_master_3s_desk';
  
  const [selectedDevId, setSelectedDevId] = useState<string>(activeDeviceId);
  const currentDevice = devices[selectedDevId] || devices[deviceKeys[0]] || null;

  // JSON editor text state
  const [jsonText, setJsonText] = useState<string>(() => {
    return currentDevice ? JSON.stringify(currentDevice, null, 2) : '';
  });
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync editor when selected device changes
  const handleSelectDevice = (devId: string) => {
    setSelectedDevId(devId);
    if (devices[devId]) {
      setJsonText(JSON.stringify(devices[devId], null, 2));
      setJsonError(null);
    }
  };

  const handleCopyCurrentDeviceJson = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.id || !parsed.name) {
        throw new Error('Device JSON must contain at least "id" and "name" fields.');
      }

      const updatedDevices = {
        ...devices,
        [selectedDevId]: parsed,
      };

      onUpdateConfig({
        ...config,
        activeDeviceId: selectedDevId,
        devices: updatedDevices,
      });

      setJsonError(null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON syntax');
    }
  };

  const handleAddNewDevice = () => {
    const newId = `mouse_device_${Date.now()}`;
    const newDev: ConnectedMouseDevice = {
      id: newId,
      name: `New Mouse Device #${deviceKeys.length + 1}`,
      hardwareModel: 'Logitech MX Master 3S',
      vendorId: '0x046D',
      productId: '0xB023',
      connectionType: 'logi_bolt',
      activeProfileId: 'profile_global',
      profiles: config.profiles,
    };

    const updatedDevices = {
      ...devices,
      [newId]: newDev,
    };

    onUpdateConfig({
      ...config,
      activeDeviceId: newId,
      devices: updatedDevices,
    });

    setSelectedDevId(newId);
    setJsonText(JSON.stringify(newDev, null, 2));
  };

  const handleDeleteDevice = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deviceKeys.length <= 1) return;

    const updatedDevices = { ...devices };
    delete updatedDevices[idToDelete];

    const nextId = Object.keys(updatedDevices)[0];
    onUpdateConfig({
      ...config,
      activeDeviceId: nextId,
      devices: updatedDevices,
    });

    setSelectedDevId(nextId);
    setJsonText(JSON.stringify(updatedDevices[nextId], null, 2));
  };

  return (
    <div className="flex flex-col gap-5 p-6 bg-[#0f1217] rounded-xl border border-[#252c38] shadow-2xl text-slate-200 font-mono">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#252c38]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-wide uppercase">
              MULTI-MOUSE CONFIGURATION &amp; JSON COPY-PASTE HUB
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] bg-[#1a1f29] text-[#9ca3af] border border-[#2d3644]">
              {deviceKeys.length} DEVICES REGISTERED
            </span>
          </div>
          <p className="text-xs text-[#808997] mt-1 font-sans">
            Independent gesture configurations per connected mouse. Paste JSON blocks directly to duplicate or migrate configs.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleCopyCurrentDeviceJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1c222c] hover:bg-[#262e3b] text-slate-200 border border-[#303947] transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#9ca3af]" />}
            <span>{copied ? 'COPIED JSON' : 'COPY DEVICE JSON'}</span>
          </button>

          <button
            onClick={handleApplyJson}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#293240] hover:bg-[#333d4e] text-white font-bold border border-[#445063] transition-all shadow-sm"
          >
            {saveSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5 text-white" />}
            <span>{saveSuccess ? 'APPLIED!' : 'APPLY / SAVE'}</span>
          </button>
        </div>
      </div>

      {/* Connected Mice Devices Strip */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-[#808997]">
          <span>SELECT CONNECTED MOUSE DEVICE:</span>
          <button
            onClick={handleAddNewDevice}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <Plus className="w-3 h-3 text-[#9ca3af]" />
            <span>[ + REGISTER NEW MOUSE ]</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {deviceKeys.map((devKey) => {
            const dev = devices[devKey];
            const isSelected = devKey === selectedDevId;

            return (
              <div
                key={devKey}
                onClick={() => handleSelectDevice(devKey)}
                className={`flex items-center justify-between p-3 rounded border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#1b212b] border-[#4b5563] text-white shadow-md'
                    : 'bg-[#12161d] border-[#222833] text-[#808997] hover:bg-[#161b24] hover:text-slate-300'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-[#4b5563]'}`} />
                    <span className="text-xs font-bold truncate text-slate-100">{dev.name}</span>
                  </div>
                  <div className="text-[10px] text-[#6b7280] truncate mt-0.5">
                    {dev.hardwareModel} • VID/PID: {dev.vendorId}:{dev.productId}
                  </div>
                </div>

                {deviceKeys.length > 1 && (
                  <button
                    onClick={(e) => handleDeleteDevice(devKey, e)}
                    className="text-[#4b5563] hover:text-rose-400 p-1"
                    title="Remove Device"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* JSON Editor Box */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#808997] flex items-center gap-2">
            <FileJson className="w-3.5 h-3.5 text-[#9ca3af]" />
            <span>DEVICE PAYLOAD EDITOR (JSON):</span>
          </span>
          <span className="text-[10px] text-[#6b7280]">
            Paste complete mouse configuration below and click &ldquo;APPLY / SAVE&rdquo;
          </span>
        </div>

        {jsonError && (
          <div className="flex items-center gap-2 p-2.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{jsonError}</span>
          </div>
        )}

        <div className="relative rounded border border-[#2b3340] bg-[#0b0d11] overflow-hidden">
          <textarea
            value={jsonText}
            onChange={(e) => {
              setJsonText(e.target.value);
              setJsonError(null);
            }}
            rows={15}
            spellCheck={false}
            className="w-full p-4 bg-transparent text-xs text-slate-200 font-mono focus:outline-none resize-y leading-relaxed selection:bg-[#333d4e]"
            placeholder="Paste your JSON configuration for this mouse here..."
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#6b7280] pt-1">
          <span>Target File: config.json // Section: devices[&quot;{selectedDevId}&quot;]</span>
          <span>Fast Load: &lt; 2ms parse time</span>
        </div>
      </div>
    </div>
  );
};
