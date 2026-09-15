import React, { useState } from 'react';
import { 
  X, 
  PackageCheck, 
  Check, 
  AlertCircle, 
  Scale, 
  ShieldAlert, 
  Droplet, 
  Apple, 
  Cross, 
  Flashlight, 
  Volume2, 
  BatteryCharging, 
  FileText, 
  Coins, 
  Shirt, 
  Shield, 
  Radio, 
  Wrench 
} from 'lucide-react';
import { CHECKLIST_ITEMS } from '../data/checklistData';
import { soundEngine } from '../audio/soundEngine';

interface EmergencyChecklistModalProps {
  onClose: () => void;
}

export const EmergencyChecklistModal: React.FC<EmergencyChecklistModalProps> = ({ onClose }) => {
  const [checkedIds, setCheckedIds] = useState<string[]>([
    'tsb_water',
    'tsb_flashlight',
    'tsb_whistle'
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const toggleItem = (id: string) => {
    soundEngine.playClick();
    setCheckedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplet': return <Droplet className="w-4 h-4 text-cyan-400" />;
      case 'Apple': return <Apple className="w-4 h-4 text-emerald-400" />;
      case 'Cross': return <Cross className="w-4 h-4 text-rose-400" />;
      case 'Flashlight': return <Flashlight className="w-4 h-4 text-amber-400" />;
      case 'Volume2': return <Volume2 className="w-4 h-4 text-yellow-400" />;
      case 'BatteryCharging': return <BatteryCharging className="w-4 h-4 text-blue-400" />;
      case 'FileText': return <FileText className="w-4 h-4 text-indigo-400" />;
      case 'Coins': return <Coins className="w-4 h-4 text-amber-300" />;
      case 'Shirt': return <Shirt className="w-4 h-4 text-teal-400" />;
      case 'Shield': return <Shield className="w-4 h-4 text-violet-400" />;
      case 'Radio': return <Radio className="w-4 h-4 text-orange-400" />;
      case 'Wrench': return <Wrench className="w-4 h-4 text-slate-300" />;
      default: return <PackageCheck className="w-4 h-4 text-cyan-400" />;
    }
  };

  const totalItems = CHECKLIST_ITEMS.length;
  const checkedCount = checkedIds.length;
  const readinessPercent = Math.round((checkedCount / totalItems) * 100);

  const totalWeight = CHECKLIST_ITEMS
    .filter(it => checkedIds.includes(it.id))
    .reduce((acc, it) => acc + it.weightKg, 0);

  const categories = ['ALL', 'Kebutuhan Pokok', 'Pertolongan & Medis', 'Komunikasi & Penerangan', 'Dokumen & Perlindungan'];

  const filteredItems = selectedCategory === 'ALL'
    ? CHECKLIST_ITEMS
    : CHECKLIST_ITEMS.filter(it => it.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-3xl bg-slate-900/95 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950/30 via-slate-900 to-cyan-950/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">STANDAR BNPB</span>
                <span className="text-xs text-slate-400">72-Hour Survival Kit</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">Tas Siaga Bencana (TSB)</h3>
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

        {/* Readiness Meter Card */}
        <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          {/* Progress Percent */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
              <span>Kesiapan Tas Siaga</span>
              <span className="text-emerald-400 font-mono text-sm">{readinessPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-500" 
                style={{ width: `${readinessPercent}%` }}
              />
            </div>
          </div>

          {/* Bag Weight Metric */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800">
            <Scale className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Estimasi Berat</div>
              <div className="text-xs font-bold text-white font-mono">{totalWeight.toFixed(1)} kg <span className="text-[10px] text-emerald-400 font-normal">(Ideal &lt;10 kg)</span></div>
            </div>
          </div>

          {/* Status Grade */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Status Kesiapsiagaan</div>
              <div className="text-xs font-bold text-amber-300">
                {readinessPercent >= 80 ? 'Sangat Siaga (Lengkap)' : readinessPercent >= 50 ? 'Cukup Siaga' : 'Belum Lengkap'}
              </div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center overflow-x-auto custom-scrollbar px-6 py-2.5 bg-slate-950/40 border-b border-slate-800 gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundEngine.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat === 'ALL' ? 'Semua Perlengkapan' : cat}
            </button>
          ))}
        </div>

        {/* Items List */}
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-2.5">
          {filteredItems.map((item) => {
            const isChecked = checkedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isChecked
                    ? 'bg-slate-800/80 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isChecked
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                      : 'border-slate-700 bg-slate-800 text-transparent'
                  }`}>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      {getIcon(item.icon)}
                      <span className={`text-xs sm:text-sm font-bold ${isChecked ? 'text-white' : 'text-slate-300'}`}>
                        {item.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.importance === 'Sangat Wajib'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : item.importance === 'Penting'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.importance}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {item.weightKg} kg
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tip Banner & Close Button */}
        <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Simpan Tas Siaga Bencana di dekat pintu utama atau tempat yang mudah dijangkau saat evakuasi.</span>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
          >
            Selesai Pengecekan
          </button>
        </div>
      </div>
    </div>
  );
};
