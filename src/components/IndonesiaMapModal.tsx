import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Flame, 
  Activity, 
  Waves, 
  Info,
  Layers
} from 'lucide-react';
import { INDONESIA_MAP_MARKERS } from '../data/mapData';
import { MapMarker } from '../types/disaster';
import { soundEngine } from '../audio/soundEngine';

interface IndonesiaMapModalProps {
  onClose: () => void;
}

export const IndonesiaMapModal: React.FC<IndonesiaMapModalProps> = ({ onClose }) => {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker>(INDONESIA_MAP_MARKERS[0]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'volcano' | 'subduction' | 'fault'>('ALL');

  const filteredMarkers = activeFilter === 'ALL' 
    ? INDONESIA_MAP_MARKERS 
    : INDONESIA_MAP_MARKERS.filter(m => m.type === activeFilter);

  // SVG coordinate transformation for Indonesia bounds:
  // Lng: 95°E to 141°E (range 46°)
  // Lat: 6°N to 11°S (range 17°)
  const projectCoordinates = (lat: number, lng: number) => {
    const minLng = 94.0;
    const maxLng = 142.0;
    const minLat = -12.0;
    const maxLat = 7.0;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return { x: `${x}%`, y: `${y}%` };
  };

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'volcano': return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      case 'subduction': return <Waves className="w-3.5 h-3.5 text-cyan-400" />;
      case 'fault': return <Activity className="w-3.5 h-3.5 text-amber-400" />;
      default: return <MapPin className="w-3.5 h-3.5 text-white" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-5xl bg-slate-900/95 border border-cyan-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] backdrop-blur-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-950/20 via-slate-900 to-cyan-950/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">CINCIN API PASIFIK</span>
                <span className="text-xs text-slate-400">Ring of Fire & Sesar Aktif Nusantara</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">Peta Rawan Bencana Indonesia</h3>
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

        {/* Filters */}
        <div className="flex items-center overflow-x-auto custom-scrollbar px-6 py-2.5 bg-slate-950/50 border-b border-slate-800 gap-2">
          {[
            { id: 'ALL', label: 'Semua Titik Bahaya' },
            { id: 'volcano', label: 'Gunung Api Aktif', icon: <Flame className="w-3 h-3 text-rose-400" /> },
            { id: 'subduction', label: 'Zona Megathrust', icon: <Waves className="w-3 h-3 text-cyan-400" /> },
            { id: 'fault', label: 'Sesar Geser Darat', icon: <Activity className="w-3 h-3 text-amber-400" /> }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                soundEngine.playClick();
                setActiveFilter(f.id as any);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                activeFilter === f.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {f.icon}
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        {/* Main Interactive Map & Details Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Interactive Indonesia Map Projection Board (2 cols) */}
          <div className="lg:col-span-2 relative bg-slate-950/80 border border-slate-800 rounded-3xl p-6 min-h-[320px] flex flex-col justify-between overflow-hidden shadow-inner">
            
            {/* Tectonic Plates Labels Overlay */}
            <div className="flex justify-between items-center text-[10px] text-cyan-400 font-mono tracking-wider mb-2 z-10">
              <span className="px-2 py-1 rounded bg-slate-900/80 border border-slate-800">LEMPENG EURASIA (Utara)</span>
              <span className="px-2 py-1 rounded bg-slate-900/80 border border-slate-800">LEMPENG PASIFIK (Timur Laut)</span>
            </div>

            {/* Simulated Vector Archipelago Map with Hotspots */}
            <div className="relative w-full h-64 sm:h-72 my-auto">
              
              {/* Stylized Island Outlines representation */}
              <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 800 400" preserveAspectRatio="none">
                {/* Sumatra */}
                <path d="M 60,180 Q 120,240 220,320 L 200,340 Q 100,260 40,200 Z" fill="#06b6d4" />
                {/* Java */}
                <path d="M 230,340 Q 350,345 470,350 L 460,370 Q 340,365 220,360 Z" fill="#06b6d4" />
                {/* Kalimantan */}
                <path d="M 270,180 Q 360,160 420,210 Q 400,290 320,280 Q 250,250 270,180 Z" fill="#06b6d4" />
                {/* Sulawesi */}
                <path d="M 450,210 Q 490,170 510,210 Q 490,260 520,300 L 490,300 Q 470,250 450,210 Z" fill="#06b6d4" />
                {/* Bali & Nusa Tenggara */}
                <path d="M 480,355 L 610,360 L 600,375 L 480,368 Z" fill="#06b6d4" />
                {/* Maluku */}
                <circle cx="560" cy="240" r="14" fill="#06b6d4" />
                <circle cx="590" cy="280" r="18" fill="#06b6d4" />
                {/* Papua */}
                <path d="M 630,220 Q 720,210 770,280 L 760,340 Q 680,310 630,260 Z" fill="#06b6d4" />

                {/* Subduction Trench Curve (Sunda Megathrust Arc) */}
                <path d="M 30,190 Q 160,320 220,360 Q 350,385 620,390" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6,4" />
              </svg>

              {/* Dynamic Plotted Hotspots */}
              {filteredMarkers.map((marker) => {
                const pos = projectCoordinates(marker.lat, marker.lng);
                const isSelected = selectedMarker.id === marker.id;

                let markerBg = 'bg-cyan-500';
                if (marker.type === 'volcano') markerBg = 'bg-rose-500';
                if (marker.type === 'fault') markerBg = 'bg-amber-500';

                return (
                  <div
                    key={marker.id}
                    style={{ left: pos.x, top: pos.y }}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedMarker(marker);
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all z-20 group`}
                  >
                    <div className="relative flex items-center justify-center">
                      <span className={`w-3.5 h-3.5 rounded-full ${markerBg} flex items-center justify-center text-slate-950 font-black shadow-lg group-hover:scale-125 transition-transform ${
                        isSelected ? 'ring-4 ring-white scale-125' : ''
                      }`} />
                      <span className={`absolute w-6 h-6 rounded-full ${markerBg} opacity-40 animate-ping pointer-events-none`} />
                    </div>

                    {/* Mini Tooltip on Hover */}
                    <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-slate-900 border border-slate-700 text-white text-[10px] font-bold rounded shadow-lg whitespace-nowrap pointer-events-none">
                      {marker.title}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Plate Boundary Label */}
            <div className="flex justify-between items-center text-[10px] text-rose-400 font-mono tracking-wider mt-2 z-10">
              <span className="px-2 py-1 rounded bg-slate-900/80 border border-slate-800">LEMPENG INDO-AUSTRALIA (Selatan)</span>
              <span className="text-slate-500 text-[9px]">*Garis merah putus-putus: Zona Megathrust Sunda Arc</span>
            </div>
          </div>

          {/* Details Sidebar for Selected Marker (1 col) */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  selectedMarker.riskLevel === 'Ekstrem' 
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  Tingkat Risiko: {selectedMarker.riskLevel}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedMarker.type.toUpperCase()}
                </span>
              </div>

              <h4 className="text-xl font-black text-white mb-2 leading-tight flex items-center gap-2">
                {getMarkerIcon(selectedMarker.type)}
                {selectedMarker.title}
              </h4>

              <div className="text-xs text-cyan-300 font-medium mb-4 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{selectedMarker.location}</span>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed mb-6">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-bold text-slate-200 block mb-1">Karakteristik Geologi:</span>
                  {selectedMarker.description}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-bold text-cyan-300 block mb-1">Catatan Kebencanaan:</span>
                  {selectedMarker.details}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Sumber data didasarkan pada data geodinamika Pusat Vulkanologi dan Mitigasi Bencana Geologi (PVMBG) & BMKG.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
