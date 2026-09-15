import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Activity, 
  Flame, 
  ShieldCheck, 
  HelpCircle, 
  Compass, 
  Play, 
  Volume2, 
  Sparkles,
  History,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { DisasterId } from '../types/disaster';
import { DISASTERS_DATA } from '../data/disasterData';
import { soundEngine } from '../audio/soundEngine';

interface DisasterDetailModalProps {
  disasterId: DisasterId | null;
  onClose: () => void;
  onStartSimulation: (id: DisasterId) => void;
  onStartQuiz: (id: DisasterId) => void;
}

type TabType = 'causes' | 'signs' | 'impacts' | 'prevention' | 'emergency' | 'evacuation';

export const DisasterDetailModal: React.FC<DisasterDetailModalProps> = ({
  disasterId,
  onClose,
  onStartSimulation,
  onStartQuiz
}) => {
  if (!disasterId) return null;
  const data = DISASTERS_DATA[disasterId];
  const [activeTab, setActiveTab] = useState<TabType>('causes');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'causes', label: 'Penyebab', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'signs', label: 'Tanda Peringatan', icon: <Activity className="w-4 h-4" /> },
    { id: 'impacts', label: 'Dampak Bahaya', icon: <Flame className="w-4 h-4" /> },
    { id: 'prevention', label: 'Mitigasi & Solusi', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'emergency', label: 'Prosedur Darurat', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'evacuation', label: 'Jalur Evakuasi', icon: <Compass className="w-4 h-4" /> },
  ];

  const handleSpeech = (text: string) => {
    if (isSpeaking) {
      soundEngine.stopSpeaking();
      setIsSpeaking(false);
    } else {
      soundEngine.speakIndonesian(text);
      setIsSpeaking(true);
    }
  };

  const getCurrentSection = () => {
    switch (activeTab) {
      case 'causes': return data.causes;
      case 'signs': return data.warningSigns;
      case 'impacts': return data.impacts;
      case 'prevention': return data.prevention;
      case 'emergency': return data.emergencyProcedures;
      case 'evacuation': return data.evacuation;
    }
  };

  const currentSection = getCurrentSection();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900/95 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl">
        
        {/* Header Bar */}
        <div 
          className="p-6 sm:p-8 border-b border-slate-800 flex items-start justify-between relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${data.color}15 0%, #090d1f 100%)` }}
        >
          <div className="flex items-center gap-4 z-10">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: `${data.color}25`, border: `1.5px solid ${data.color}60` }}
            >
              <AlertTriangle className="w-8 h-8" style={{ color: data.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {data.category}
                </span>
                <span className="text-xs font-mono text-cyan-400 font-semibold">MODUL EDUKASI 3D</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{data.indonesianName}</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{data.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 z-10">
            {/* Audio Reader Button */}
            <button
              onClick={() => handleSpeech(`${data.indonesianName}. ${currentSection.title}. ${currentSection.summary}. ${currentSection.points.join('. ')}`)}
              className={`p-2.5 rounded-xl border transition-all ${
                isSpeaking 
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 animate-pulse' 
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-cyan-400'
              }`}
              title={isSpeaking ? "Hentikan Suara" : "Dengarkan Narasi Audio (Bahasa Indonesia)"}
            >
              <Volume2 className="w-5 h-5" />
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                soundEngine.stopSpeaking();
                soundEngine.playClick();
                onClose();
              }}
              className="p-2.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-700 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center overflow-x-auto custom-scrollbar px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 gap-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-6">
          
          {/* Main Tab Section Content */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
              {currentSection.title}
            </h3>
            <p className="text-sm text-cyan-200 bg-cyan-950/30 border border-cyan-900/50 p-3.5 rounded-xl mb-5 leading-relaxed">
              {currentSection.summary}
            </p>

            <div className="space-y-3">
              {currentSection.points.map((pt, i) => (
                <div key={i} className="flex items-start gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-800/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-300 leading-relaxed">{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Case Study & Fun Fact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Historical Event */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
                  <History className="w-4 h-4" />
                  <span>Kilas Sejarah Indonesia ({data.famousEventIndonesia.year})</span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">{data.famousEventIndonesia.title}</h4>
                <div className="text-xs text-slate-400 mb-2 font-medium">{data.famousEventIndonesia.location}</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {data.famousEventIndonesia.description}
                </p>
              </div>
            </div>

            {/* Fun Fact */}
            <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-900/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Fakta Sains Unik</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2 italic">
                  "{data.funFact}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              soundEngine.playClick();
              onStartQuiz(disasterId);
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            Uji Pengetahuan (Kuis)
          </button>

          <button
            onClick={() => {
              soundEngine.stopSpeaking();
              soundEngine.playClick();
              onStartSimulation(disasterId);
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            Masuk Mode Simulasi 3D
          </button>
        </div>
      </div>
    </div>
  );
};
