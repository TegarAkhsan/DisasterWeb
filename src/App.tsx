import React, { useState, useEffect, useRef } from 'react';
import { EruptionStage } from './scenes/VolcanoScene';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { 
  Play, 
  BookOpen, 
  MapPin, 
  PackageCheck, 
  Award, 
  Activity, 
  Compass,
  ArrowRight,
  ShieldAlert,
  Flame,
  Waves,
  Wind
} from 'lucide-react';

import { DisasterId } from './types/disaster';
import { DISASTERS_DATA } from './data/disasterData';
import { soundEngine } from './audio/soundEngine';

// 3D Scenes
import { HomeEarthScene } from './scenes/HomeEarthScene';
import { DisasterMenuScene } from './scenes/DisasterMenuScene';
import { EarthquakeScene } from './scenes/EarthquakeScene';
import { TsunamiScene } from './scenes/TsunamiScene';
import { VolcanoScene } from './scenes/VolcanoScene';
import { FloodScene } from './scenes/FloodScene';
import { LandslideScene } from './scenes/LandslideScene';
import { TornadoScene } from './scenes/TornadoScene';

// UI Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DisasterDetailModal } from './components/DisasterDetailModal';
import { SimulationOverlay } from './components/SimulationOverlay';
import { QuizModal } from './components/QuizModal';
import { EmergencyChecklistModal } from './components/EmergencyChecklistModal';
import { IndonesiaMapModal } from './components/IndonesiaMapModal';
import { AccessibilityModal } from './components/AccessibilityModal';

// Camera & Scene View Controller: ensures optimal viewpoints without clipping through walls
const CameraController: React.FC<{ 
  view: string; 
  disaster: DisasterId; 
  reducedMotion: boolean; 
}> = ({ view, disaster, reducedMotion }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (view === 'HOME') {
      camera.position.set(0, 0, 7.2);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    } else if (view === 'MENU') {
      camera.position.set(0, 2.8, 9.2);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    } else if (view === 'SIMULATION') {
      if (disaster === 'EARTHQUAKE') {
        // Place user INSIDE classroom, looking straight at desks and chalkboard
        camera.position.set(0, 1.3, 4.8);
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 1.1, -1.2);
          controlsRef.current.update();
        }
      } else if (disaster === 'TSUNAMI') {
        camera.position.set(0, 2.8, 7.8);
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0.2, 0);
          controlsRef.current.update();
        }
      } else if (disaster === 'VOLCANO') {
        camera.position.set(0, 1.8, 14.0);
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 1.8, 0);
          controlsRef.current.update();
        }
      } else if (disaster === 'FLOOD') {
        camera.position.set(0, 3.2, 7.8);
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0.2, 0);
          controlsRef.current.update();
        }
      } else if (disaster === 'LANDSLIDE') {
        camera.position.set(0, 2.5, 8.5);
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0.4, 0);
          controlsRef.current.update();
        }
      } else if (disaster === 'TORNADO') {
        camera.position.set(0, 2.4, 8.8);
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0.4, 0);
          controlsRef.current.update();
        }
      }
    }
  }, [view, disaster, camera]);

  const isClassroom = view === 'SIMULATION' && disaster === 'EARTHQUAKE';

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={view !== 'HOME'}
      maxDistance={isClassroom ? 6.2 : 20}
      minDistance={isClassroom ? 2.0 : 4.5}
      maxPolarAngle={isClassroom ? Math.PI / 2 + 0.05 : Math.PI / 2 - 0.04}
      minPolarAngle={0.1}
      autoRotate={view === 'HOME' && !reducedMotion}
      autoRotateSpeed={0.4}
    />
  );
};


export const App: React.FC = () => {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<'HOME' | 'MENU' | 'SIMULATION' | 'MAP' | 'CHECKLIST' | 'QUIZ'>('HOME');
  const [activeDisaster, setActiveDisaster] = useState<DisasterId>('EARTHQUAKE');
  const [isSimulating, setIsSimulating] = useState(true);
  const [volcanoStage, setVolcanoStage] = useState<EruptionStage>(0);

  // Modals
  const [selectedDisasterForDetail, setSelectedDisasterForDetail] = useState<DisasterId | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizDisasterFilter, setQuizDisasterFilter] = useState<DisasterId | 'ALL'>('ALL');
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showAccessibilityModal, setShowAccessibilityModal] = useState(false);

  // User Progression & Settings (Persisted in localStorage)
  const [userXp, setUserXp] = useState<number>(() => {
    const saved = localStorage.getItem('dv3d_user_xp');
    return saved ? parseInt(saved, 10) : 50;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('dv3d_sound_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [voiceNarrationEnabled, setVoiceNarrationEnabled] = useState(true);

  useEffect(() => {
    localStorage.setItem('dv3d_user_xp', userXp.toString());
  }, [userXp]);

  useEffect(() => {
    localStorage.setItem('dv3d_sound_enabled', soundEnabled.toString());
    soundEngine.setMuted(!soundEnabled);
  }, [soundEnabled]);

  const addXp = (amount: number) => {
    setUserXp(prev => prev + amount);
  };

  const handleStartSimulation = (id: DisasterId) => {
    setActiveDisaster(id);
    setCurrentView('SIMULATION');
    setSelectedDisasterForDetail(null);
    setIsSimulating(true);
    if (id === 'VOLCANO') setVolcanoStage(0);
  };

  const handleStartQuiz = (id: DisasterId | 'ALL') => {
    setQuizDisasterFilter(id);
    setShowQuizModal(true);
  };

  const disasterList: DisasterId[] = [
    'EARTHQUAKE',
    'TSUNAMI',
    'VOLCANO',
    'FLOOD',
    'LANDSLIDE',
    'TORNADO'
  ];

  const getDisasterIcon = (id: DisasterId) => {
    switch (id) {
      case 'EARTHQUAKE': return <Activity className="w-5 h-5 text-amber-400" />;
      case 'TSUNAMI': return <Waves className="w-5 h-5 text-cyan-400" />;
      case 'VOLCANO': return <Flame className="w-5 h-5 text-rose-400" />;
      case 'FLOOD': return <Compass className="w-5 h-5 text-blue-400" />;
      case 'LANDSLIDE': return <ShieldAlert className="w-5 h-5 text-lime-400" />;
      case 'TORNADO': return <Wind className="w-5 h-5 text-purple-400" />;
    }
  };

  const getCanvasBackground = () => {
    if (currentView === 'SIMULATION') {
      switch (activeDisaster) {
        case 'EARTHQUAKE': return '#bae6fd'; // Bright classroom daylight sky
        case 'TSUNAMI': return '#38bdf8'; // Tropical ocean daylight sky
        case 'FLOOD': return '#94a3b8'; // Overcast rain daytime sky
        case 'LANDSLIDE': return '#38bdf8'; // Mountainous daylight sky
        case 'VOLCANO': return '#0f172a'; // Deep atmospheric volcanic twilight sky
        case 'TORNADO': return '#312e81'; // Stormy thunder sky
      }
    }
    return '#020617';
  };

  return (
    <div className={`min-h-screen flex flex-col bg-[#020617] text-slate-100 relative ${
      fontSize === 'large' ? 'font-size-large' : fontSize === 'xlarge' ? 'font-size-xlarge' : ''
    } ${highContrast ? 'high-contrast' : ''}`}>
      
      {/* Top Futuristic Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'MAP') {
            setShowMapModal(true);
          } else if (view === 'CHECKLIST') {
            setShowChecklistModal(true);
          } else if (view === 'QUIZ') {
            handleStartQuiz('ALL');
          } else {
            setCurrentView(view as any);
          }
        }}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenAccessibility={() => setShowAccessibilityModal(true)}
        userXp={userXp}
      />

      {/* 3D WebGL Canvas Layer */}
      <div className={`w-full ${currentView === 'SIMULATION' ? 'fixed inset-0 z-10' : 'h-[65vh] sm:h-[75vh] relative z-0'}`}>
        <Canvas camera={{ position: [0, 0, currentView === 'HOME' ? 7.2 : 8.5], fov: 45 }}>
          <color attach="background" args={[getCanvasBackground()]} />
          {currentView !== 'SIMULATION' && (
            <Stars 
              radius={80} 
              depth={50} 
              count={2500} 
              factor={4} 
              saturation={0} 
              fade 
              speed={reducedMotion ? 0.2 : 0.8} 
            />
          )}

          {/* Dynamic 3D Scene Rendering according to View */}
          {currentView === 'HOME' && <HomeEarthScene />}
          
          {currentView === 'MENU' && (
            <DisasterMenuScene onSelect={(id) => setSelectedDisasterForDetail(id)} />
          )}

          {currentView === 'SIMULATION' && activeDisaster === 'EARTHQUAKE' && (
            <EarthquakeScene 
              isSimulating={isSimulating && !reducedMotion} 
              onActionClick={(act) => {
                if (act === 'DROP_COVER_HOLD') {
                  soundEngine.playCorrect();
                  addXp(50);
                }
              }}
            />
          )}

          {currentView === 'SIMULATION' && activeDisaster === 'TSUNAMI' && (
            <TsunamiScene 
              isSimulating={isSimulating}
              onActionClick={(act) => {
                if (act === 'EVACUATE_HILL') {
                  soundEngine.playCorrect();
                  addXp(50);
                }
              }}
            />
          )}

          {currentView === 'SIMULATION' && activeDisaster === 'VOLCANO' && (
            <VolcanoScene 
              isSimulating={isSimulating}
              eruptionStage={volcanoStage}
              onActionClick={(act) => {
                if (act === 'EVACUATE_KRB') {
                  soundEngine.playCorrect();
                  addXp(50);
                }
              }}
            />
          )}

          {currentView === 'SIMULATION' && activeDisaster === 'FLOOD' && (
            <FloodScene 
              isSimulating={isSimulating}
              onActionClick={(act) => {
                soundEngine.playCorrect();
                addXp(50);
              }}
            />
          )}

          {currentView === 'SIMULATION' && activeDisaster === 'LANDSLIDE' && (
            <LandslideScene 
              isSimulating={isSimulating}
              onActionClick={(act) => {
                soundEngine.playCorrect();
                addXp(50);
              }}
            />
          )}

          {currentView === 'SIMULATION' && activeDisaster === 'TORNADO' && (
            <TornadoScene 
              isSimulating={isSimulating}
              onActionClick={(act) => {
                soundEngine.playCorrect();
                addXp(50);
              }}
            />
          )}

          {/* Smart Camera Controller with View-Specific Targets & Orbit Bounds */}
          <CameraController 
            view={currentView} 
            disaster={activeDisaster} 
            reducedMotion={reducedMotion} 
          />
        </Canvas>

        {/* Simulation HUD Overlay when inside 3D simulation */}
        {currentView === 'SIMULATION' && (
          <SimulationOverlay
            disasterId={activeDisaster}
            isSimulating={isSimulating}
            onToggleSimulate={() => setIsSimulating(!isSimulating)}
            onExit={() => setCurrentView('MENU')}
            onAddXp={addXp}
            onOpenDetails={() => setSelectedDisasterForDetail(activeDisaster)}
            volcanoStage={activeDisaster === 'VOLCANO' ? volcanoStage : undefined}
            onSetVolcanoStage={activeDisaster === 'VOLCANO' ? setVolcanoStage : undefined}
          />
        )}
      </div>

      {/* Hero UI Layer for HOME View */}
      {currentView === 'HOME' && (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 -mt-16 sm:-mt-24 pointer-events-none">
          <div className="max-w-4xl mx-auto text-center pointer-events-auto">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Platform Edukasi Kebencanaan 3 Dimensi</span>
            </div>

            {/* Main Hero Typography */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6 text-glow-cyan">
              DisasterVerse <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">3D</span>
            </h1>

            <p className="text-base sm:text-xl md:text-2xl font-medium text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              Belajar Bencana Alam melalui Pengalaman 3 Dimensi
            </p>

            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
              Jelajahi simulasi interaktif gempa bumi, tsunami, erupsi gunung api, banjir, longsor, dan puting beliung dalam lingkungan virtual 3D untuk siswa Indonesia.
            </p>

            {/* Main Call To Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setCurrentView('MENU');
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:scale-105 transition-all"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Mulai Eksplorasi 3D</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedDisasterForDetail('EARTHQUAKE');
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm sm:text-base flex items-center justify-center gap-3 border border-slate-700/80 backdrop-blur-md transition-all"
              >
                <BookOpen className="w-5 h-5 text-cyan-400" />
                <span>Pelajari Bencana</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid of 6 Disaster Cards on MENU or below Home */}
      {currentView !== 'SIMULATION' && (
        <section className="relative z-20 max-w-7xl mx-auto px-6 py-12 w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">6 Modul Bencana Alam</h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Pilih modul untuk mempelajari sains di balik bencana dan menguji kesiapan mitigasi Anda</p>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 text-xs text-cyan-400 font-semibold bg-cyan-950/30 px-3.5 py-1.5 rounded-full border border-cyan-500/30">
              <Activity className="w-4 h-4" />
              <span>Simulasi 3D Interaktif</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {disasterList.map((id) => {
              const data = DISASTERS_DATA[id];
              return (
                <div
                  key={id}
                  className="group relative rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:-translate-y-1 backdrop-blur-xl overflow-hidden"
                >
                  {/* Glowing accent border top */}
                  <div 
                    className="absolute top-0 left-0 right-0 h-1 transition-all opacity-80 group-hover:opacity-100" 
                    style={{ backgroundColor: data.color }} 
                  />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${data.color}20`, border: `1px solid ${data.color}50` }}
                      >
                        {getDisasterIcon(id)}
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {data.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                      {data.indonesianName}
                    </h3>
                    <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                      {data.subtitle}
                    </p>

                    <div className="text-xs text-slate-300 bg-slate-850/60 p-3 rounded-xl border border-slate-800 mb-6 italic">
                      "{data.tagline}"
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedDisasterForDetail(id);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Pelajari
                    </button>

                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        handleStartSimulation(id);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-cyan-600/80 hover:bg-cyan-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" /> Simulasi
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Access Feature Banners */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            
            {/* Banner 1: Peta Bencana */}
            <div 
              onClick={() => {
                soundEngine.playClick();
                setShowMapModal(true);
              }}
              className="p-6 rounded-3xl bg-gradient-to-br from-amber-950/30 to-slate-900/60 border border-amber-500/30 hover:border-amber-400/60 cursor-pointer transition-all hover:-translate-y-1 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-1">Peta Ring of Fire Indonesia</h4>
              <p className="text-xs text-slate-400 mb-4">Eksplorasi zona megathrust, sebaran 127 gunung api aktif, dan sesar patahan aktif di seluruh Nusantara.</p>
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">Buka Peta Interaktif <ArrowRight className="w-3.5 h-3.5" /></span>
            </div>

            {/* Banner 2: Tas Siaga Bencana */}
            <div 
              onClick={() => {
                soundEngine.playClick();
                setShowChecklistModal(true);
              }}
              className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/30 to-slate-900/60 border border-emerald-500/30 hover:border-emerald-400/60 cursor-pointer transition-all hover:-translate-y-1 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <PackageCheck className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-1">Tas Siaga Bencana (TSB)</h4>
              <p className="text-xs text-slate-400 mb-4">Cek kesiapan perlengkapan darurat 72 jam keluarga Anda sesuai standar keselamatan BNPB.</p>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">Cek Daftar Kesiapan <ArrowRight className="w-3.5 h-3.5" /></span>
            </div>

            {/* Banner 3: Kuis & Ujian */}
            <div 
              onClick={() => {
                soundEngine.playClick();
                handleStartQuiz('ALL');
              }}
              className="p-6 rounded-3xl bg-gradient-to-br from-cyan-950/30 to-slate-900/60 border border-cyan-500/30 hover:border-cyan-400/60 cursor-pointer transition-all hover:-translate-y-1 shadow-lg"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-white mb-1">Ujian & Kuis Kebencanaan</h4>
              <p className="text-xs text-slate-400 mb-4">Uji pemahaman Anda tentang prosedur evakuasi dan dapatkan XP serta predikat Kader Siaga Bencana.</p>
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">Mulai Kuis Sekarang <ArrowRight className="w-3.5 h-3.5" /></span>
            </div>

          </div>
        </section>
      )}

      {/* Educational Accreditation Footer */}
      {currentView !== 'SIMULATION' && (
        <Footer 
          onSelectDisaster={(id) => setSelectedDisasterForDetail(id)}
          onOpenChecklist={() => setShowChecklistModal(true)}
          onOpenMap={() => setShowMapModal(true)}
        />
      )}

      {/* Modals & Dialogs */}
      {selectedDisasterForDetail && (
        <DisasterDetailModal
          disasterId={selectedDisasterForDetail}
          onClose={() => setSelectedDisasterForDetail(null)}
          onStartSimulation={(id) => handleStartSimulation(id)}
          onStartQuiz={(id) => handleStartQuiz(id)}
        />
      )}

      {showQuizModal && (
        <QuizModal
          initialDisasterId={quizDisasterFilter}
          onClose={() => setShowQuizModal(false)}
          onAddXp={addXp}
        />
      )}

      {showChecklistModal && (
        <EmergencyChecklistModal
          onClose={() => setShowChecklistModal(false)}
        />
      )}

      {showMapModal && (
        <IndonesiaMapModal
          onClose={() => setShowMapModal(false)}
        />
      )}

      {showAccessibilityModal && (
        <AccessibilityModal
          onClose={() => setShowAccessibilityModal(false)}
          fontSize={fontSize}
          onChangeFontSize={setFontSize}
          highContrast={highContrast}
          onToggleHighContrast={() => setHighContrast(!highContrast)}
          reducedMotion={reducedMotion}
          onToggleReducedMotion={() => setReducedMotion(!reducedMotion)}
          voiceNarrationEnabled={voiceNarrationEnabled}
          onToggleVoiceNarration={() => setVoiceNarrationEnabled(!voiceNarrationEnabled)}
        />
      )}

    </div>
  );
};

export default App;
