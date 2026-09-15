import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Settings, 
  MapPin, 
  PackageCheck, 
  Award, 
  BookOpen, 
  Layers,
  Sparkles
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAccessibility: () => void;
  userXp: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  soundEnabled,
  onToggleSound,
  onOpenAccessibility,
  userXp
}) => {
  const [volume, setVolume] = useState(0.5);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const level = Math.floor(userXp / 100) + 1;
  const xpCurrentLevel = userXp % 100;

  const handleNav = (view: string) => {
    soundEngine.playClick();
    onNavigate(view);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundEngine.setVolume(val);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 md:px-8 py-3.5 flex items-center justify-between backdrop-blur-xl bg-slate-950/70 border-b border-cyan-950/60 shadow-2xl">
      {/* Brand / Logo */}
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => handleNav('HOME')}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-transform">
          <ShieldAlert className="w-6 h-6 text-cyan-400 group-hover:rotate-6 transition-transform" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black tracking-wider text-white">DisasterVerse</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">3D</span>
          </div>
          <p className="text-[10px] text-slate-400 tracking-wide hidden sm:block">Platform Edukasi Kebencanaan Indonesia</p>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
        <button
          onClick={() => handleNav('HOME')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'HOME' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          Beranda
        </button>

        <button
          onClick={() => handleNav('MENU')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'MENU' || currentView === 'SIMULATION' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Modul 3D
        </button>

        <button
          onClick={() => handleNav('MAP')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'MAP' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <MapPin className="w-3.5 h-3.5 text-amber-400" /> Peta Bencana
        </button>

        <button
          onClick={() => handleNav('CHECKLIST')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'CHECKLIST' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <PackageCheck className="w-3.5 h-3.5 text-emerald-400" /> Tas Siaga
        </button>

        <button
          onClick={() => handleNav('QUIZ')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            currentView === 'QUIZ' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-yellow-400" /> Kuis & Ujian
        </button>
      </nav>

      {/* Right Controls: User XP Badge, Sound & Accessibility */}
      <div className="flex items-center gap-2.5">
        {/* XP & Level Badge */}
        <div 
          onClick={() => handleNav('QUIZ')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 cursor-pointer hover:border-cyan-400 transition-colors"
          title={`XP: ${userXp} | Kumpulkan XP dengan menyelesaikan simulasi dan kuis`}
        >
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
            {level}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-200">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>{userXp} XP</span>
            </div>
            <div className="w-16 h-1 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-cyan-400 rounded-full transition-all duration-500" 
                style={{ width: `${xpCurrentLevel}%` }}
              />
            </div>
          </div>
        </div>

        {/* Sound Toggle with Volume Popover */}
        <div className="relative">
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleSound();
            }}
            onMouseEnter={() => setShowVolumeSlider(true)}
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-all ${
              soundEnabled
                ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-400 hover:bg-cyan-900/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
            title={soundEnabled ? "Nonaktifkan Suara" : "Aktifkan Suara"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Mini Volume Slider on Hover */}
          {showVolumeSlider && soundEnabled && (
            <div 
              onMouseLeave={() => setShowVolumeSlider(false)}
              className="absolute right-0 top-12 p-3 bg-slate-900/95 border border-cyan-500/30 rounded-xl shadow-2xl backdrop-blur-xl flex flex-col gap-1 w-32 animate-in fade-in"
            >
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Volume</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Accessibility Modal Trigger */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenAccessibility();
          }}
          className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition-all backdrop-blur-md"
          title="Pengaturan Aksesibilitas"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Mobile Menu Quick Toggle Button */}
        <button
          onClick={() => handleNav(currentView === 'MENU' ? 'HOME' : 'MENU')}
          className="lg:hidden px-3 py-2 rounded-xl bg-cyan-600/90 text-white font-bold text-xs flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Menu</span>
        </button>
      </div>
    </header>
  );
};
