import React from 'react';
import { PhoneCall, Shield, HeartHandshake, AlertCircle } from 'lucide-react';
import { DisasterId } from '../types/disaster';
import { DISASTERS_DATA } from '../data/disasterData';
import { soundEngine } from '../audio/soundEngine';

interface FooterProps {
  onSelectDisaster: (id: DisasterId) => void;
  onOpenChecklist: () => void;
  onOpenMap: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectDisaster,
  onOpenChecklist,
  onOpenMap
}) => {
  const emergencyNumbers = [
    { label: 'BNPB (Bencana Alam)', number: '117', desc: 'Badan Nasional Penanggulangan Bencana' },
    { label: 'BASARNAS (SAR)', number: '115', desc: 'Penyelamatan & Pencarian Korban' },
    { label: 'BMKG (Pusat Gempa)', number: '196', desc: 'Info Peringatan Dini Cuaca & Gempa' },
    { label: 'Ambulans / Gawat Darurat', number: '119', desc: 'Layanan Medis Darurat' },
    { label: 'Pemadam Kebakaran', number: '113', desc: 'Evakuasi Kebakaran & Hewan Buas' },
    { label: 'Kepolisian RI', number: '110', desc: 'Keamanan & Ketertiban Masyarakat' }
  ];

  const disasterIds: DisasterId[] = ['EARTHQUAKE', 'TSUNAMI', 'VOLCANO', 'FLOOD', 'LANDSLIDE', 'TORNADO'];

  return (
    <footer className="w-full bg-slate-950/95 border-t border-slate-800 text-slate-400 py-10 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        {/* Col 1: About Platform */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
              <Shield className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-lg font-bold text-white tracking-wider">DisasterVerse <span className="text-cyan-400 font-light">3D</span></span>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            Platform edukasi kebencanaan interaktif 3 dimensi berbasis web pertama untuk siswa dan generasi muda Indonesia. Membangun budaya sadar bencana yang tangguh, siap, dan selamat.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-semibold">
            <HeartHandshake className="w-4 h-4" />
            <span>Dedikasi untuk Indonesia Tangguh Bencana</span>
          </div>
        </div>

        {/* Col 2: Disaster Quick Navigation */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200 mb-3 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-cyan-400" /> Modul Bencana
          </h4>
          <ul className="grid grid-cols-2 gap-2 text-xs">
            {disasterIds.map((id) => (
              <li key={id}>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onSelectDisaster(id);
                  }}
                  className="hover:text-cyan-300 transition-colors flex items-center gap-1.5 text-left"
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: DISASTERS_DATA[id].color }} />
                  {DISASTERS_DATA[id].indonesianName}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <button 
              onClick={() => { soundEngine.playClick(); onOpenMap(); }}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Peta Megathrust
            </button>
            <button 
              onClick={() => { soundEngine.playClick(); onOpenChecklist(); }}
              className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Tas Siaga (TSB)
            </button>
          </div>
        </div>

        {/* Col 3 & 4: Emergency Contacts in Indonesia */}
        <div className="lg:col-span-2">
          <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2">
            <PhoneCall className="w-3.5 h-3.5 text-amber-400" /> Nomor Darurat Siaga Bencana (Bebas Pulsa)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {emergencyNumbers.map((em, idx) => (
              <div 
                key={idx} 
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex items-center justify-between"
              >
                <div>
                  <div className="text-[11px] font-semibold text-slate-200">{em.label}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{em.desc}</div>
                </div>
                <span className="px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs">
                  {em.number}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
        <div>© 2026 DisasterVerse 3D - Edukasi Kebencanaan Berbasis Web 3D.</div>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-300 cursor-pointer">Panduan Keselamatan BNPB</span>
          <span>•</span>
          <span className="hover:text-slate-300 cursor-pointer">Katalog Gempa BMKG</span>
          <span>•</span>
          <span className="hover:text-slate-300 cursor-pointer">Ring of Fire Center</span>
        </div>
      </div>
    </footer>
  );
};
