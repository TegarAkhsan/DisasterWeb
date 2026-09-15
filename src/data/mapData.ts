import { MapMarker } from '../types/disaster';

export const INDONESIA_MAP_MARKERS: MapMarker[] = [
  {
    id: 'sub_sunda',
    title: 'Zona Megathrust Selat Sunda - Mentawai',
    type: 'subduction',
    location: 'Sepanjang Barat Sumatra hingga Selatan Jawa',
    lat: -6.0,
    lng: 104.5,
    description: 'Pertemuan Lempeng Indo-Australia yang menunjam ke bawah Lempeng Eurasia dengan potensi gempa hingga M 8.7+.',
    riskLevel: 'Ekstrem',
    details: 'Merupakan sumber gempa bumi megathrust dan pembangkit gelombang tsunami purba dan modern di barat Indonesia.'
  },
  {
    id: 'fault_palukoro',
    title: 'Sesar Geser Palu-Koro',
    type: 'fault',
    location: 'Sulawesi Tengah (Teluk Palu)',
    lat: -0.9,
    lng: 119.85,
    description: 'Patahan mendatar aktif berkecapatan geser 30-40 mm/tahun yang memicu gempa M 7.4 dan likuefaksi dahsyat 2018.',
    riskLevel: 'Ekstrem',
    details: 'Salah satu patahan darat tercepat dan paling aktif di kawasan Asia Tenggara.'
  },
  {
    id: 'vol_merapi',
    title: 'Gunung Merapi (2.930 mdpl)',
    type: 'volcano',
    location: 'D.I. Yogyakarta & Jawa Tengah',
    lat: -7.54,
    lng: 110.44,
    description: 'Gunung api teraktif di Indonesia dengan siklus letusan pendek 2-5 tahun dan ancaman awan panas kubah lava.',
    riskLevel: 'Tinggi',
    details: 'Dipantau oleh Balai Penyelidikan dan Pengembangan Teknologi Kebencanaan Geologi (BPPTKG).'
  },
  {
    id: 'vol_sinabung',
    title: 'Gunung Sinabung',
    type: 'volcano',
    location: 'Kabupaten Karo, Sumatera Utara',
    lat: 3.17,
    lng: 98.39,
    description: 'Gunung api tipe strato yang kembali aktif sejak 2010 setelah tertidur selama lebih dari 400 tahun.',
    riskLevel: 'Tinggi',
    details: 'Sering melontarkan kolom abu tinggi dan aliran piroklastik ke arah tenggara.'
  },
  {
    id: 'vol_semeru',
    title: 'Gunung Semeru (Puncak Mahameru 3.676 mdpl)',
    type: 'volcano',
    location: 'Lumajang & Malang, Jawa Timur',
    lat: -8.11,
    lng: 112.92,
    description: 'Puncak tertinggi di pulau Jawa dengan karakter letusan vulkanian dan strombolian berkala serta ancaman lahar dingin di Besuk Kobokan.',
    riskLevel: 'Tinggi',
    details: 'Mengalami erupsi besar pada Desember 2021 yang menerjang pemukiman lereng tenggara.'
  },
  {
    id: 'vol_krakatau',
    title: 'Gunung Anak Krakatau',
    type: 'volcano',
    location: 'Selat Sunda (antara Jawa dan Sumatra)',
    lat: -6.10,
    lng: 105.42,
    description: 'Gunung api pulau di laut yang tumbuh di dalam kaldera sisa letusan dahsyat Krakatau 1883.',
    riskLevel: 'Sangat Tinggi',
    details: 'Runtuhnya sebagian tubuh barat Anak Krakatau pada Desember 2018 memicu tsunami tanpa gempa yang menerjang pesisir Banten dan Lampung.'
  },
  {
    id: 'fault_lembang',
    title: 'Sesar Lembang',
    type: 'fault',
    location: 'Bandung Utara, Jawa Barat',
    lat: -6.82,
    lng: 107.61,
    description: 'Patahan aktif sepanjang 29 km dengan laju geser 3-5 mm/tahun membentang dari Padalarang hingga Gunung Manglayang.',
    riskLevel: 'Tinggi',
    details: 'Berpotensi memicu gempa bumi M 6.5-7.0 di dekat kawasan padat penduduk metropolitan Bandung.'
  },
  {
    id: 'sub_papua',
    title: 'Palung New Guinea & Sesar Tarera-Aiduna',
    type: 'subduction',
    location: 'Utara & Barat Papua',
    lat: -2.5,
    lng: 138.0,
    description: 'Zona benturan tektonik aktif antara Lempeng Pasifik/Lempeng Laut Caroline dan lempeng mikro benua Papua.',
    riskLevel: 'Tinggi',
    details: 'Kerap menghasilkan guncangan seismik dalam dan dangkal di kawasan timur Indonesia.'
  }
];
