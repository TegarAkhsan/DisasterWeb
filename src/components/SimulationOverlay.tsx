import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ArrowRight, 
  Radio, 
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Minimize2,
  Maximize2,
  Mountain,
  Flame,
  AlertTriangle,
  CloudLightning,
  Zap,
  Wind
} from 'lucide-react';
import { DisasterId } from '../types/disaster';
import { SIMULATION_SCENARIOS, DISASTERS_DATA } from '../data/disasterData';
import { soundEngine } from '../audio/soundEngine';
import type { EruptionStage } from '../scenes/VolcanoScene';

// ── Volcano Eruption Stages Data ──────────────────────────────────────
const ERUPTION_STAGES = [
  {
    id: 'NORMAL',
    title: 'Gunung Normal',
    subtitle: 'Fase Dormant',
    pvmbgLevel: 'Level I — Normal',
    pvmbgColor: '#22c55e',
    icon: Mountain,
    description: 'Gunung api dalam keadaan tenang. Aktivitas vulkanik sangat rendah. Danau kawah stabil dan tidak ada emisi gas berbahaya yang signifikan. Masyarakat dapat beraktivitas normal di sekitar gunung.',
    visualHint: 'Perhatikan gunung yang tenang — tidak ada asap, lava redup, suasana damai.'
  },
  {
    id: 'UNREST',
    title: 'Keresahan Vulkanik',
    subtitle: 'Volcanic Unrest',
    pvmbgLevel: 'Level II — Waspada',
    pvmbgColor: '#eab308',
    icon: AlertTriangle,
    description: 'Magma mulai bergerak naik dari dapur magma. Terjadi gempa-gempa vulkanik dangkal (tremor). Suhu danau kawah meningkat dan muncul asap solfatara tipis. PVMBG menaikkan status ke Level II Waspada.',
    visualHint: 'Lihat getaran halus pada gunung dan asap tipis mulai keluar dari kawah.'
  },
  {
    id: 'PHREATIC',
    title: 'Erupsi Freatik',
    subtitle: 'Phreatic Eruption',
    pvmbgLevel: 'Level II — Waspada',
    pvmbgColor: '#eab308',
    icon: CloudLightning,
    description: 'Air tanah bertemu magma panas dan berubah menjadi uap bertekanan tinggi. Ledakan uap menyemburkan material dari kawah tanpa magma baru mencapai permukaan. Kolom abu tipis mulai terlihat.',
    visualHint: 'Perhatikan semburan abu dari kawah dan zona KRB mulai terlihat.'
  },
  {
    id: 'MAGMATIC_RISE',
    title: 'Kubah Lava Tumbuh',
    subtitle: 'Lava Dome Growth',
    pvmbgLevel: 'Level III — Siaga',
    pvmbgColor: '#f97316',
    icon: Flame,
    description: 'Magma kental (andesit-dasit) mencapai permukaan dan membentuk kubah lava di kawah. Kubah ini sangat tidak stabil — bisa runtuh kapan saja menghasilkan awan panas guguran. Status dinaikkan ke Level III Siaga.',
    visualHint: 'Kubah lava merah menyala terbentuk di kawah. Asap semakin pekat. Zona KRB aktif!'
  },
  {
    id: 'ERUPTION',
    title: 'Erupsi Eksplosif',
    subtitle: 'Klimaks — Plinian Eruption',
    pvmbgLevel: 'Level IV — Awas',
    pvmbgColor: '#ef4444',
    icon: Zap,
    description: 'LETUSAN BESAR! Kolom erupsi menjulang ke troposfer, awan jamur terbentuk, bom vulkanik terlontar, awan panas (wedhus gembel) menerjang lereng, petir vulkanik menyambar di dalam awan abu. EVAKUASI TOTAL!',
    visualHint: 'Semua elemen erupsi aktif — kolom abu, awan panas, lava, petir vulkanik!'
  },
  {
    id: 'POST_ERUPTION',
    title: 'Pasca Erupsi',
    subtitle: 'Post-Eruption Phase',
    pvmbgLevel: 'Level III — Siaga',
    pvmbgColor: '#f97316',
    icon: Wind,
    description: 'Aktivitas vulkanik mulai mereda namun ancaman belum berakhir. Hujan abu menutupi wilayah sekitar, lahar dingin mengancam saat hujan. Tim BPBD melaksanakan evakuasi dan operasi penyelamatan korban.',
    visualHint: 'Abu jatuh dari langit, asap mereda, suasana suram. Posko evakuasi aktif penuh.'
  },
];

interface SimulationOverlayProps {
  disasterId: DisasterId;
  isSimulating: boolean;
  onToggleSimulate: () => void;
  onExit: () => void;
  onAddXp: (amount: number) => void;
  onOpenDetails: () => void;
  volcanoStage?: EruptionStage;
  onSetVolcanoStage?: (stage: EruptionStage) => void;
}

export const SimulationOverlay: React.FC<SimulationOverlayProps> = ({
  disasterId,
  isSimulating,
  onToggleSimulate,
  onExit,
  onAddXp,
  onOpenDetails,
  volcanoStage,
  onSetVolcanoStage
}) => {
  const scenario = SIMULATION_SCENARIOS[disasterId];
  const data = DISASTERS_DATA[disasterId];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showBriefing, setShowBriefing] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  // Play atmospheric procedural sound when entering simulation
  useEffect(() => {
    if (isSimulating) {
      if (disasterId === 'EARTHQUAKE') {
        soundEngine.playEarthquakeRumble(5);
      } else if (disasterId === 'TSUNAMI') {
        soundEngine.playTsunamiSurge();
      } else if (disasterId === 'VOLCANO') {
        soundEngine.playVolcanoExplosion();
      } else if (disasterId === 'TORNADO') {
        soundEngine.playTornadoWind(5);
      }
    }
  }, [disasterId, isSimulating]);

  const currentStep = scenario.steps[currentStepIndex];

  const handleSelectOption = (option: { id: string; isCorrect: boolean; feedback: string; xp: number }) => {
    if (selectedOptionId) return; // already picked

    setSelectedOptionId(option.id);
    if (option.isCorrect) {
      soundEngine.playCorrect();
      onAddXp(option.xp);
    } else {
      soundEngine.playWrong();
    }
  };

  const handleNextStep = () => {
    soundEngine.playClick();
    if (currentStepIndex + 1 < scenario.steps.length) {
      setCurrentStepIndex(prev => prev + 1);
      setSelectedOptionId(null);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    soundEngine.playClick();
    setCurrentStepIndex(0);
    setSelectedOptionId(null);
    setIsCompleted(false);
    setShowBriefing(true);
    setIsMinimized(false);
  };

  const selectedOption = currentStep?.options.find(o => o.id === selectedOptionId);

  // Volcano Stage Navigation Handlers
  const isVolcano = disasterId === 'VOLCANO' && volcanoStage !== undefined && onSetVolcanoStage;
  const currentVolcanoStageData = isVolcano ? ERUPTION_STAGES[volcanoStage!] : null;

  const handleVolcanoPrev = () => {
    if (!isVolcano || volcanoStage === undefined || volcanoStage <= 0) return;
    soundEngine.playClick();
    onSetVolcanoStage!((volcanoStage - 1) as EruptionStage);
  };

  const handleVolcanoNext = () => {
    if (!isVolcano || volcanoStage === undefined || volcanoStage >= 5) return;
    soundEngine.playClick();
    onSetVolcanoStage!((volcanoStage + 1) as EruptionStage);
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 z-20 overflow-hidden">
      
      {/* Top Bar HUD */}
      <div className="flex items-center justify-between gap-4 pointer-events-auto w-full">
        <button
          onClick={() => {
            soundEngine.playClick();
            onExit();
          }}
          className="px-3.5 py-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 backdrop-blur-md flex items-center gap-2 text-xs font-bold transition-all shadow-lg"
        >
          <ChevronLeft className="w-4 h-4" /> Menu Bencana
        </button>

        {/* Hazard Level Badge */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-slate-900/85 border border-slate-700/80 backdrop-blur-md shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: isVolcano && currentVolcanoStageData ? currentVolcanoStageData.pvmbgColor : data.color }} />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              STATUS: <span style={{ color: isVolcano && currentVolcanoStageData ? currentVolcanoStageData.pvmbgColor : data.color }}>
                {isVolcano && currentVolcanoStageData ? currentVolcanoStageData.pvmbgLevel : scenario.hazardLevel}
              </span>
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-bold text-white hidden sm:inline">{scenario.environmentName}</span>
        </div>

        {/* Simulation Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Toggle 3D View / Minimize Panel */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setIsMinimized(!isMinimized);
            }}
            className={`px-3 py-2 rounded-xl border backdrop-blur-md text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg ${
              isMinimized
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse'
                : 'bg-slate-900/85 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
            title={isMinimized ? "Tampilkan Panel Misi" : "Sembunyikan Panel (Lihat 3D Penuh)"}
          >
            {isMinimized ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">{isMinimized ? "Buka Misi" : "Lihat 3D"}</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenDetails();
            }}
            className="p-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-cyan-400 border border-slate-700 backdrop-blur-md transition-colors shadow-lg"
            title="Buka Materi Edukasi Lengkap"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleSimulate();
            }}
            className={`px-3.5 py-2 rounded-xl border backdrop-blur-md text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${
              isSimulating 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isSimulating ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">{isSimulating ? 'Guncangan Aktif' : 'Mulai Guncangan'}</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VOLCANO ERUPTION STAGE NAVIGATOR — Bottom Left Panel              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isVolcano && currentVolcanoStageData && (
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 w-[calc(100%-2rem)] sm:w-auto sm:max-w-[420px] z-30 pointer-events-auto">
          <div className="bg-slate-900/92 border border-slate-700/80 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden">
            
            {/* Stage Header with PVMBG Badge */}
            <div className="px-5 pt-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  {/* Stage Icon */}
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                    style={{ 
                      backgroundColor: `${currentVolcanoStageData.pvmbgColor}18`, 
                      border: `1.5px solid ${currentVolcanoStageData.pvmbgColor}60`,
                      boxShadow: `0 0 18px ${currentVolcanoStageData.pvmbgColor}25`
                    }}
                  >
                    {React.createElement(currentVolcanoStageData.icon, { 
                      className: 'w-5 h-5',
                      style: { color: currentVolcanoStageData.pvmbgColor }
                    })}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Tahap {volcanoStage! + 1} dari 6
                    </div>
                    <h4 className="text-sm font-black text-white leading-tight">
                      {currentVolcanoStageData.title}
                    </h4>
                  </div>
                </div>

                {/* PVMBG Status Badge */}
                <div 
                  className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider border whitespace-nowrap"
                  style={{ 
                    backgroundColor: `${currentVolcanoStageData.pvmbgColor}15`,
                    borderColor: `${currentVolcanoStageData.pvmbgColor}50`,
                    color: currentVolcanoStageData.pvmbgColor,
                    boxShadow: `0 0 12px ${currentVolcanoStageData.pvmbgColor}20`
                  }}
                >
                  {currentVolcanoStageData.pvmbgLevel}
                </div>
              </div>

              {/* Stage Subtitle */}
              <div className="text-[11px] font-semibold text-slate-400 italic mb-2.5">
                {currentVolcanoStageData.subtitle}
              </div>

              {/* Description */}
              <p className="text-[11.5px] text-slate-300 leading-relaxed bg-slate-800/50 p-3 rounded-xl border border-slate-700/60 mb-3">
                {currentVolcanoStageData.description}
              </p>

              {/* Visual Hint */}
              <div className="flex items-start gap-2 text-[10.5px] text-cyan-400/80 mb-1">
                <Eye className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="leading-snug italic">{currentVolcanoStageData.visualHint}</span>
              </div>
            </div>

            {/* ── Progress Dots & Navigation Buttons ── */}
            <div className="px-5 pb-4 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between gap-3">
                
                {/* Previous Button */}
                <button
                  disabled={volcanoStage === 0}
                  onClick={handleVolcanoPrev}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    volcanoStage === 0
                      ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed border border-slate-800/40'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-slate-600 active:scale-95'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>

                {/* Progress Dots */}
                <div className="flex items-center gap-1.5">
                  {ERUPTION_STAGES.map((stage, idx) => {
                    const isActive = idx === volcanoStage;
                    const isPast = idx < volcanoStage!;
                    return (
                      <button
                        key={stage.id}
                        onClick={() => {
                          soundEngine.playClick();
                          onSetVolcanoStage!(idx as EruptionStage);
                        }}
                        className={`transition-all duration-300 rounded-full ${
                          isActive
                            ? 'w-7 h-2.5 shadow-lg'
                            : isPast
                            ? 'w-2.5 h-2.5 opacity-60 hover:opacity-100'
                            : 'w-2.5 h-2.5 opacity-30 hover:opacity-60'
                        }`}
                        style={{ 
                          backgroundColor: isActive 
                            ? stage.pvmbgColor 
                            : isPast 
                            ? stage.pvmbgColor 
                            : '#475569',
                          boxShadow: isActive ? `0 0 10px ${stage.pvmbgColor}60` : 'none'
                        }}
                        title={`${stage.title} (Tahap ${idx + 1})`}
                      />
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  disabled={volcanoStage === 5}
                  onClick={handleVolcanoNext}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    volcanoStage === 5
                      ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed border border-slate-800/40'
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-600/20 active:scale-95'
                  }`}
                >
                  <span className="hidden sm:inline">Selanjutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Card Dock — Mission Questions Panel (right side) */}
      <div className={`absolute bottom-4 right-4 sm:bottom-6 sm:right-6 ${isVolcano ? 'w-[calc(50%-1.5rem)] sm:w-auto sm:max-w-sm' : 'w-[calc(100%-2rem)] sm:w-auto sm:max-w-md md:max-w-lg'} z-30 pointer-events-auto`}>
        
        {/* Minimized Pill Bar */}
        {isMinimized ? (
          <div 
            onClick={() => {
              soundEngine.playClick();
              setIsMinimized(false);
            }}
            className="bg-slate-900/90 hover:bg-slate-850 border border-cyan-500/50 hover:border-cyan-400 rounded-2xl p-3 sm:px-4 sm:py-3 shadow-2xl backdrop-blur-xl cursor-pointer flex items-center justify-between gap-3 text-white transition-all hover:scale-102 group animate-in fade-in"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <div>
                <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Misi Berlangsung</div>
                <div className="text-xs font-bold text-slate-200 group-hover:text-white truncate max-w-[220px] sm:max-w-xs">
                  {scenario.title}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 bg-cyan-500/20 px-2.5 py-1.5 rounded-xl border border-cyan-500/40">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Buka Pertanyaan</span>
            </div>
          </div>
        ) : showBriefing ? (
          /* Initial Briefing Dialog - Compact & Non-Intrusive */
          <div className="bg-slate-900/90 border border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 max-h-[75vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <AlertOctagon className="w-4 h-4" />
                <span>Skenario Tanggap Darurat</span>
              </div>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsMinimized(true);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Minimalkan panel untuk melihat 3D penuh"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white mb-2 leading-snug">{scenario.title}</h3>
            
            <p className="text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700/80 mb-3 leading-relaxed">
              {scenario.briefing}
            </p>
            
            <div className="text-[11px] font-semibold text-amber-300 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Misi: {scenario.objective}</span>
            </div>

            {/* Volcano-specific hint */}
            {isVolcano && (
              <div className="text-[11px] text-cyan-300/80 bg-cyan-950/30 p-2.5 rounded-xl border border-cyan-500/20 mb-4 flex items-start gap-2">
                <Mountain className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Gunakan panel <strong>Tahap Erupsi</strong> di kiri bawah untuk melihat proses gunung meletus secara bertahap.</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsMinimized(true);
                }}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Lihat Lingkungan 3D</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowBriefing(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-black text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Mulai Pertanyaan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : isCompleted ? (
          /* Completion Card */
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white mb-1">Simulasi Selesai!</h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Respon tanggap darurat Anda untuk bencana {data.indonesianName} telah dievaluasi dengan baik.
            </p>
            <div className="flex gap-2.5 justify-center">
              <button
                onClick={handleRestart}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Ulangi
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onExit();
                }}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30"
              >
                Pilih Modul Lain
              </button>
            </div>
          </div>
        ) : (
          /* Step Question & Action Options */
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl max-h-[75vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center justify-between mb-2 text-xs font-semibold text-slate-400">
              <span className="text-cyan-400 font-mono text-[11px]">LANGKAH {currentStepIndex + 1} DARI {scenario.steps.length}</span>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsMinimized(true);
                }}
                className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                title="Minimalkan pertanyaan untuk melihat objek 3D"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Sembunyikan</span>
              </button>
            </div>

            <h4 className="text-sm sm:text-base font-bold text-white mb-3 leading-snug">
              {currentStep.instruction}
            </h4>

            {/* Option Buttons */}
            <div className="space-y-2 mb-3">
              {currentStep.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                const showValidation = selectedOptionId !== null;

                let btnStyle = 'border-slate-800 bg-slate-850/80 hover:bg-slate-800 text-slate-200';
                if (showValidation) {
                  if (option.isCorrect) {
                    btnStyle = 'border-emerald-500/80 bg-emerald-950/40 text-emerald-200';
                  } else if (isSelected) {
                    btnStyle = 'border-rose-500/80 bg-rose-950/40 text-rose-200';
                  } else {
                    btnStyle = 'border-slate-800/40 bg-slate-900/40 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={option.id}
                    disabled={selectedOptionId !== null}
                    onClick={() => handleSelectOption(option)}
                    className={`w-full p-2.5 sm:p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-start gap-2.5 ${btnStyle}`}
                  >
                    <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                      {isSelected ? (option.isCorrect ? '✓' : '✕') : '•'}
                    </span>
                    <span className="leading-snug">{option.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback Banner upon answering */}
            {selectedOption && (
              <div className={`p-3 rounded-xl border mb-3 animate-in fade-in flex items-start gap-2.5 ${
                selectedOption.isCorrect 
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' 
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              }`}>
                {selectedOption.isCorrect ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-[11px] font-bold mb-0.5">
                    {selectedOption.isCorrect ? 'Keputusan Tepat! (+50 XP)' : 'Peringatan Bahaya!'}
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300">
                    {selectedOption.feedback}
                  </p>
                </div>
              </div>
            )}

            {/* Next / Continue Button */}
            {selectedOptionId && (
              <button
                onClick={handleNextStep}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-colors"
              >
                <span>{currentStepIndex + 1 < scenario.steps.length ? 'Lanjut Langkah Berikutnya' : 'Selesaikan Simulasi'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Center Navigation Helper */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none hidden sm:block">
        <span className="text-[10px] text-slate-400 bg-slate-950/75 px-3 py-1 rounded-full border border-slate-800/80 backdrop-blur-md">
          Klik & seret mouse untuk memutar kamera 3D • Scroll untuk zoom
        </span>
      </div>
    </div>
  );
};
