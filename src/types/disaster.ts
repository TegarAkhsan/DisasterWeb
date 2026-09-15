export type DisasterId = 
  | 'EARTHQUAKE' 
  | 'TSUNAMI' 
  | 'VOLCANO' 
  | 'FLOOD' 
  | 'LANDSLIDE' 
  | 'TORNADO';

export interface EducationalSection {
  title: string;
  summary: string;
  points: string[];
}

export interface InteractiveHotspot {
  title: string;
  description: string;
  position: [number, number, number];
}

export interface DisasterInfo {
  id: DisasterId;
  name: string;
  indonesianName: string;
  subtitle: string;
  tagline: string;
  category: 'Geologi' | 'Hidrometeorologi';
  color: string;
  accentColor: string;
  ringColor: string;
  bgGradient: string;
  causes: EducationalSection;
  warningSigns: EducationalSection;
  impacts: EducationalSection;
  prevention: EducationalSection;
  emergencyProcedures: EducationalSection;
  evacuation: EducationalSection;
  funFact: string;
  famousEventIndonesia: {
    title: string;
    year: string;
    location: string;
    description: string;
  };
  hotspots: InteractiveHotspot[];
}

export interface SimulationStep {
  id: string;
  instruction: string;
  timeLimit?: number; // seconds
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    feedback: string;
    xp: number;
  }[];
}

export interface SimulationScenario {
  disasterId: DisasterId;
  title: string;
  environmentName: string;
  briefing: string;
  objective: string;
  steps: SimulationStep[];
  hazardLevel: 'Waspada' | 'Siaga' | 'Awas';
}

export interface QuizQuestion {
  id: string;
  disasterId: DisasterId | 'ALL';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'Mudah' | 'Sedang' | 'Tantangan';
}

export interface ChecklistItem {
  id: string;
  name: string;
  category: 'Kebutuhan Pokok' | 'Pertolongan & Medis' | 'Komunikasi & Penerangan' | 'Dokumen & Perlindungan';
  description: string;
  importance: 'Sangat Wajib' | 'Penting' | 'Pelengkap';
  icon: string;
  weightKg: number;
}

export interface MapMarker {
  id: string;
  title: string;
  type: 'volcano' | 'subduction' | 'fault' | 'tsunami_zone';
  location: string;
  lat: number;
  lng: number;
  description: string;
  riskLevel: 'Tinggi' | 'Sangat Tinggi' | 'Ekstrem';
  details: string;
}
