import React, { useState } from 'react';
import { 
  X, 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Sparkles,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DisasterId } from '../types/disaster';
import { QUIZ_QUESTIONS } from '../data/quizData';
import { soundEngine } from '../audio/soundEngine';

interface QuizModalProps {
  initialDisasterId?: DisasterId | 'ALL';
  onClose: () => void;
  onAddXp: (amount: number) => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  initialDisasterId = 'ALL',
  onClose,
  onAddXp
}) => {
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterId | 'ALL'>(initialDisasterId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  // Filter questions according to selected filter
  const filteredQuestions = QUIZ_QUESTIONS.filter(q => 
    selectedDisaster === 'ALL' ? true : q.disasterId === selectedDisaster
  );

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0];

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    soundEngine.playClick();
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedOption === currentQ.correctIndex;
    if (isCorrect) {
      soundEngine.playCorrect();
      setScore(prev => prev + 1);
      onAddXp(25);
    } else {
      soundEngine.playWrong();
    }
  };

  const handleNext = () => {
    soundEngine.playClick();
    if (currentIndex + 1 < filteredQuestions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizCompleted(true);
      // Trigger festive confetti for good scores
      if (score >= Math.floor(filteredQuestions.length / 2)) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handleRestart = () => {
    soundEngine.playClick();
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizCompleted(false);
  };

  const categories = [
    { id: 'ALL', label: 'Semua Bencana' },
    { id: 'EARTHQUAKE', label: 'Gempa Bumi' },
    { id: 'TSUNAMI', label: 'Tsunami' },
    { id: 'VOLCANO', label: 'Gunung Api' },
    { id: 'FLOOD', label: 'Banjir' },
    { id: 'LANDSLIDE', label: 'Tanah Longsor' },
    { id: 'TORNADO', label: 'Puting Beliung' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900/95 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-cyan-950/30 to-blue-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Uji Pengetahuan Siaga Bencana</h3>
              <p className="text-xs text-slate-400">Jawab kuis dan dapatkan XP serta lencana keahlian</p>
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

        {/* Category Filters */}
        <div className="flex items-center overflow-x-auto custom-scrollbar px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                soundEngine.playClick();
                setSelectedDisaster(cat.id as DisasterId | 'ALL');
                handleRestart();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDisaster === cat.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar">
          {isQuizCompleted ? (
            /* Result Screen */
            <div className="text-center py-6 animate-in fade-in">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                <Trophy className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-black text-white mb-1">Kuis Selesai!</h4>
              <p className="text-sm text-slate-400 mb-6">
                Skor Anda: <span className="text-cyan-400 font-bold text-xl">{score}</span> dari {filteredQuestions.length} Soal Benar
              </p>

              {/* Performance Badge Card */}
              <div className="bg-slate-850 border border-slate-700/80 p-5 rounded-2xl max-w-sm mx-auto mb-8">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span>Predikat Evaluasi</span>
                </div>
                <div className="text-lg font-black text-white">
                  {score === filteredQuestions.length 
                    ? 'Pakar Mitigasi Tangguh (Sempurna!)' 
                    : score >= filteredQuestions.length * 0.7 
                    ? 'Kader Siaga Bencana Handal' 
                    : 'Pelajar Siaga Bencana (Tingkatkan Latihan)'}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Total XP diperoleh: +{score * 25} XP
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2 border border-slate-700"
                >
                  <RotateCcw className="w-4 h-4" /> Coba Lagi
                </button>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onClose();
                  }}
                  className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30"
                >
                  Tutup Kuis
                </button>
              </div>
            </div>
          ) : (
            /* Quiz Question Card */
            <div>
              {/* Question Progress Bar */}
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
                <span className="text-cyan-400 font-mono">SOAL {currentIndex + 1} / {filteredQuestions.length}</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                  {currentQ.difficulty}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-6">
                <div 
                  className="h-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question Title */}
              <h4 className="text-lg sm:text-xl font-bold text-white mb-6 leading-relaxed">
                {currentQ.question}
              </h4>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQ.options.map((opt, i) => {
                  const isSelected = selectedOption === i;
                  let style = 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-200';

                  if (isAnswerSubmitted) {
                    if (i === currentQ.correctIndex) {
                      style = 'border-emerald-500 bg-emerald-950/40 text-emerald-200 font-bold';
                    } else if (isSelected) {
                      style = 'border-rose-500 bg-rose-950/40 text-rose-200';
                    } else {
                      style = 'border-slate-800/40 bg-slate-900/40 text-slate-500 opacity-50';
                    }
                  } else if (isSelected) {
                    style = 'border-cyan-500 bg-cyan-950/40 text-cyan-200';
                  }

                  return (
                    <button
                      key={i}
                      disabled={isAnswerSubmitted}
                      onClick={() => handleSelectOption(i)}
                      className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start gap-3.5 ${style}`}
                    >
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation Banner */}
              {isAnswerSubmitted && (
                <div className={`p-4 rounded-xl border mb-6 animate-in fade-in flex items-start gap-3 ${
                  selectedOption === currentQ.correctIndex
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                }`}>
                  {selectedOption === currentQ.correctIndex ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="text-xs font-bold mb-1">
                      {selectedOption === currentQ.correctIndex ? 'Jawaban Benar! (+25 XP)' : 'Jawaban Kurang Tepat'}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentQ.explanation}
                    </p>
                  </div>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                {!isAnswerSubmitted ? (
                  <button
                    disabled={selectedOption === null}
                    onClick={handleSubmitAnswer}
                    className="px-6 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/30"
                  >
                    Kunci Jawaban
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all"
                  >
                    <span>{currentIndex + 1 < filteredQuestions.length ? 'Soal Berikutnya' : 'Lihat Hasil Kuis'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
