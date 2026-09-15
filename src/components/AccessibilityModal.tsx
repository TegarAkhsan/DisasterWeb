import React from 'react';
import { 
  X, 
  Eye, 
  Volume2, 
  Type, 
  Sliders, 
  Check 
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface AccessibilityModalProps {
  onClose: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  onChangeFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  voiceNarrationEnabled: boolean;
  onToggleVoiceNarration: () => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  onClose,
  fontSize,
  onChangeFontSize,
  highContrast,
  onToggleHighContrast,
  reducedMotion,
  onToggleReducedMotion,
  voiceNarrationEnabled,
  onToggleVoiceNarration
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900/95 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Pengaturan Aksesibilitas</h3>
              <p className="text-xs text-slate-400">Kenyamanan belajar untuk semua siswa</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-4">
          
          {/* Text Size */}
          <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 mb-2.5">
              <Type className="w-4 h-4 text-cyan-400" />
              <span>Ukuran Teks Tampilan</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'normal', label: 'Normal' },
                { id: 'large', label: 'Besar' },
                { id: 'xlarge', label: 'Ekstra' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    soundEngine.playClick();
                    onChangeFontSize(opt.id as any);
                  }}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                    fontSize === opt.id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Voice Narration */}
          <div 
            onClick={() => {
              soundEngine.playClick();
              onToggleVoiceNarration();
            }}
            className="p-4 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-xs font-bold text-slate-200">Narasi Suara Otomatis</div>
                <div className="text-[11px] text-slate-400">Bacakan materi edukasi dalam Bahasa Indonesia</div>
              </div>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
              voiceNarrationEnabled ? 'bg-cyan-500' : 'bg-slate-700'
            }`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                voiceNarrationEnabled ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </div>
          </div>

          {/* High Contrast Mode */}
          <div 
            onClick={() => {
              soundEngine.playClick();
              onToggleHighContrast();
            }}
            className="p-4 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-slate-200">Mode Kontras Tinggi</div>
                <div className="text-[11px] text-slate-400">Pertajam kontras teks dan batas kartu informasi</div>
              </div>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
              highContrast ? 'bg-cyan-500' : 'bg-slate-700'
            }`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                highContrast ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </div>
          </div>

          {/* Reduced Motion */}
          <div 
            onClick={() => {
              soundEngine.playClick();
              onToggleReducedMotion();
            }}
            className="p-4 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-3">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xs font-bold text-slate-200">Reduksi Animasi & Guncangan</div>
                <div className="text-[11px] text-slate-400">Kurangi efek getaran kamera 3D untuk kenyamanan mata</div>
              </div>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${
              reducedMotion ? 'bg-cyan-500' : 'bg-slate-700'
            }`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                reducedMotion ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </div>
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onClose();
          }}
          className="w-full mt-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/30"
        >
          Simpan Preferensi
        </button>
      </div>
    </div>
  );
};
