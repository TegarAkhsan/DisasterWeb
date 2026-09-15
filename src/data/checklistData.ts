import { ChecklistItem } from '../types/disaster';

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'tsb_water',
    name: 'Air Minum Bersih (Minimal 3 Liter)',
    category: 'Kebutuhan Pokok',
    description: 'Kebutuhan mutlak bertahan hidup untuk 72 jam pertama pascabencana.',
    importance: 'Sangat Wajib',
    icon: 'Droplet',
    weightKg: 3.0
  },
  {
    id: 'tsb_food',
    name: 'Makanan Siap Saji / Kaleng / Biskuit Energi',
    category: 'Kebutuhan Pokok',
    description: 'Makanan berkalori tinggi yang tidak mudah basi dan tidak butuh dimasak (kurma, biskuit gandum, kornet).',
    importance: 'Sangat Wajib',
    icon: 'Apple',
    weightKg: 1.5
  },
  {
    id: 'tsb_p3k',
    name: 'Kotak P3K & Obat-obatan Pribadi',
    category: 'Pertolongan & Medis',
    description: 'Plester luka, kasa steril, antiseptik (betadine), parasetamol, oralit, dan obat resep pribadi.',
    importance: 'Sangat Wajib',
    icon: 'Cross',
    weightKg: 0.6
  },
  {
    id: 'tsb_flashlight',
    name: 'Senter Kepala / Senter LED & Baterai Cadangan',
    category: 'Komunikasi & Penerangan',
    description: 'Penerangan darurat saat jaringan listrik PLN padam total di malam hari.',
    importance: 'Sangat Wajib',
    icon: 'Flashlight',
    weightKg: 0.4
  },
  {
    id: 'tsb_whistle',
    name: 'Peluit Darurat (Rescue Whistle)',
    category: 'Komunikasi & Penerangan',
    description: 'Alat paling efektif memanggil tim penolong SAR saat tertimbun reruntuhan tanpa menguras tenaga bersuara.',
    importance: 'Sangat Wajib',
    icon: 'Volume2',
    weightKg: 0.1
  },
  {
    id: 'tsb_powerbank',
    name: 'Power Bank & Kabel Charger Terisi Penuh',
    category: 'Komunikasi & Penerangan',
    description: 'Menjaga baterai ponsel tetap aktif untuk mengabari keluarga dan memanggil tim penyelamat.',
    importance: 'Penting',
    icon: 'BatteryCharging',
    weightKg: 0.5
  },
  {
    id: 'tsb_documents',
    name: 'Dokumen Penting dalam Kantong Kedap Air',
    category: 'Dokumen & Perlindungan',
    description: 'Salinan KTP, Kartu Keluarga, ijazah, polis asuransi, dan sertifikat dalam plastik ziplock tahan air.',
    importance: 'Sangat Wajib',
    icon: 'FileText',
    weightKg: 0.3
  },
  {
    id: 'tsb_cash',
    name: 'Uang Tunai Pecahan Kecil',
    category: 'Dokumen & Perlindungan',
    description: 'Saat mesin ATM mati dan sinyal internet down, uang tunai adalah alat transaksi satu-satunya.',
    importance: 'Penting',
    icon: 'Coins',
    weightKg: 0.2
  },
  {
    id: 'tsb_clothes',
    name: 'Pakaian Ganti, Selimut Hangat & Jas Hujan',
    category: 'Dokumen & Perlindungan',
    description: 'Melindungi tubuh dari hipotermia saat cuaca dingin dan hujan di tenda pengungsian.',
    importance: 'Penting',
    icon: 'Shirt',
    weightKg: 1.2
  },
  {
    id: 'tsb_mask',
    name: 'Masker N95 / Medis & Kacamata Pelindung',
    category: 'Pertolongan & Medis',
    description: 'Melindungi dari debu reruntuhan bangunan, abu vulkanik tajam, dan bau tak sedap.',
    importance: 'Penting',
    icon: 'Shield',
    weightKg: 0.2
  },
  {
    id: 'tsb_radio',
    name: 'Radio Saku Portabel (FM/AM)',
    category: 'Komunikasi & Penerangan',
    description: 'Mendengarkan instruksi dan pembaruan darurat dari pemerintah saat menara sinyal seluler roboh.',
    importance: 'Pelengkap',
    icon: 'Radio',
    weightKg: 0.3
  },
  {
    id: 'tsb_multitool',
    name: 'Pisau Lipat Serbaguna (Multi-tool)',
    category: 'Dokumen & Perlindungan',
    description: 'Membuka kaleng makanan, memotong tali pengikat, atau memperbaiki peralatan darurat.',
    importance: 'Pelengkap',
    icon: 'Wrench',
    weightKg: 0.3
  }
];
