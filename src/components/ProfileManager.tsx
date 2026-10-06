import React, { useState } from 'react';
import { AppProfile, MasterGestureConfig } from '../types/gestures';
import { createProfile } from '../types/presets';
import { 
  Plus, 
  Layers, 
  Globe, 
  Film, 
  Chrome, 
  Code2, 
  PenTool, 
  Copy, 
  Trash2, 
  Check, 
  SlidersHorizontal,
  AppWindow
} from 'lucide-react';

interface ProfileManagerProps {
  config: MasterGestureConfig;
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onUpdateProfiles: (profiles: AppProfile[], activeId: string) => void;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  config,
  activeProfileId,
  onSelectProfile,
  onUpdateProfiles,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newProfileName, setNewProfileName] = useState<string>('');
  const [newProcessName, setNewProcessName] = useState<string>('');

  const activeProfile = config.profiles.find(p => p.id === activeProfileId) || config.profiles[0];

  const handleAddProfile = () => {
    if (!newProfileName.trim()) return;

    const id = `profile_${Date.now()}`;
    const newProf = createProfile(
      id,
      newProfileName.trim(),
      newProcessName.trim() ? [newProcessName.trim()] : ['custom_app.exe'],
      'AppWindow',
      '#06b6d4',
      `Custom gesture mappings for ${newProfileName.trim()}`
    );

    const updated = [...config.profiles, newProf];
    onUpdateProfiles(updated, id);
    setNewProfileName('');
    setNewProcessName('');
    setShowAddModal(false);
  };

  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (config.profiles.length <= 1) return;
    const updated = config.profiles.filter(p => p.id !== id);
    const newActiveId = id === activeProfileId ? updated[0].id : activeProfileId;
    onUpdateProfiles(updated, newActiveId);
  };

  const getProfileIcon = (iconName: string) => {
    switch (iconName) {
      case 'Globe': return <Globe className="w-4 h-4" />;
      case 'Chrome': return <Chrome className="w-4 h-4" />;
      case 'Film': return <Film className="w-4 h-4" />;
      case 'Code2': return <Code2 className="w-4 h-4" />;
      case 'PenTool': return <PenTool className="w-4 h-4" />;
      default: return <AppWindow className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Profile Bar Strip */}
      <div className="flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            APPLICATION-SPECIFIC PROFILES
          </span>
          <span className="text-[10px] text-[#6b7280]">
            (AUTO-SWITCHES BASED ON OS ACTIVE PROCESS)
          </span>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#161a22] hover:bg-[#202632] text-slate-200 border border-[#2b3341] transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-amber-400" />
          <span>[ + NEW PROFILE ]</span>
        </button>
      </div>

      {/* Horizontal Carousel of Profiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 font-mono">
        {config.profiles.map((profile) => {
          const isActive = profile.id === activeProfileId;

          return (
            <button
              key={profile.id}
              onClick={() => onSelectProfile(profile.id)}
              className={`flex items-center justify-between p-2.5 rounded border text-left transition-all group ${
                isActive
                  ? 'bg-[#1c222c] border-[#445063] text-white shadow-sm ring-1 ring-amber-400/40'
                  : 'bg-[#101319] border-[#222833] text-[#808997] hover:bg-[#151921] hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={isActive ? 'text-amber-400' : 'text-[#6b7280]'}>
                  {getProfileIcon(profile.icon)}
                </span>
                <div className="truncate">
                  <div className="text-xs font-bold truncate text-slate-100">{profile.name}</div>
                  <div className="text-[10px] text-[#6b7280] truncate">
                    {profile.processNames[0] || 'Default'}
                  </div>
                </div>
              </div>

              {profile.id !== 'profile_global' && (
                <span
                  onClick={(e) => handleDeleteProfile(profile.id, e)}
                  className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-1 text-[#6b7280] transition-opacity"
                  title="Delete Profile"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Add Profile Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Create Application Profile</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Application Name</label>
                <input
                  type="text"
                  placeholder="e.g. Blender 3D or Spotify"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">
                  Target Executable / Process Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. blender.exe or Spotify.exe"
                  value={newProcessName}
                  onChange={(e) => setNewProcessName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  The daemon hooks window focus change events to automatically switch gesture profiles.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProfile}
                disabled={!newProfileName.trim()}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
              >
                Create Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
