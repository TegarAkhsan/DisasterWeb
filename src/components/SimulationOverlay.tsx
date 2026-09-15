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
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { DisasterId } from '../types/disaster';
import { SIMULATION_SCENARIOS, DISASTERS_DATA } from '../data/disasterData';
import { soundEngine } from '../audio/soundEngine';

interface SimulationOverlayProps {
  disasterId: DisasterId;
  isSimulating: boolean;
  onToggleSimulate: () => void;
  onExit: () => void;
  onAddXp: (amount: number) => void;
  onOpenDetails: () => void;
}

export const SimulationOverlay: React.FC<SimulationOverlayProps> = ({
  disasterId,
  isSimulating,
  onToggleSimulate,
  onExit,
  onAddXp,
  onOpenDetails
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
            <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: data.color }} />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              STATUS: <span style={{ color: data.color }}>{scenario.hazardLevel}</span>
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

      {/* Bottom Floating Card Dock - Placed at bottom-right so it NEVER blocks the 3D center */}
      <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100%-2rem)] sm:w-auto sm:max-w-md md:max-w-lg z-30 pointer-events-auto">
        
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
