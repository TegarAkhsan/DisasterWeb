import { QuizQuestion } from '../types/disaster';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Earthquake
  {
    id: 'q_eq_1',
    disasterId: 'EARTHQUAKE',
    question: 'Saat gempa bumi mengguncang hebat saat Anda berada di dalam gedung, tindakan standar yang direkomendasikan adalah...',
    options: [
      'Berlari panik mencari pintu keluar darurat',
      'Drop, Cover, and Hold On (Merunduk, Berlindung di bawah meja kokoh, Bertahan)',
      'Segera masuk ke dalam lift agar cepat turun',
      'Berdiri bersandar di dekat jendela kaca besar'
    ],
    correctIndex: 1,
    explanation: 'Metode Drop, Cover, and Hold On melindungi organ vital (kepala dan leher) dari kejatuhan plafon, lampu, dan perabot.',
    difficulty: 'Mudah'
  },
  {
    id: 'q_eq_2',
    disasterId: 'EARTHQUAKE',
    question: 'Fenomena hilangnya kekuatan tanah berpasir jenuh air akibat getaran gempa bumi sehingga tanah berubah menjadi lumpur cair disebut...',
    options: [
      'Sedimentasi',
      'Likuefaksi (Pencairan Tanah)',
      'Erosi Glasial',
      'Subsiden Tektonik'
    ],
    correctIndex: 1,
    explanation: 'Likuefaksi terjadi ketika tekanan air pori meningkat drastis saat gempa kuat, membuat tanah kehilangan daya dukungnya seperti yang terjadi di Palu 2018.',
    difficulty: 'Sedang'
  },
  {
    id: 'q_eq_3',
    disasterId: 'EARTHQUAKE',
    question: 'Sesar geser aktif darat di pulau Jawa yang melewati wilayah Bandung bagian utara dan dipantau intensif oleh para ahli geologi adalah...',
    options: [
      'Sesar Semangko',
      'Sesar Palu-Koro',
      'Sesar Lembang',
      'Sesar Opak'
    ],
    correctIndex: 2,
    explanation: 'Sesar Lembang adalah patahan aktif sepanjang kurang lebih 29 km yang membentang dari Padalarang hingga Gunung Manglayang.',
    difficulty: 'Tantangan'
  },

  // Tsunami
  {
    id: 'q_ts_1',
    disasterId: 'TSUNAMI',
    question: 'Apa rumus keselamatan pesisir (rumus darurat) jika terjadi gempa bumi kuat di tepi pantai?',
    options: [
      '10-10-10: 10 menit gempa, lari 10 km, naik 10 meter',
      '20-20-20: Gempa 20 detik, waktu evakuasi 20 menit, lari ke ketinggian 20 meter',
      '30-30-30: Gempa 30 detik, tunggu 30 menit, naik 30 meter',
      '5-5-5: Gempa 5 detik, tunggu 5 menit, kumpul 5 orang'
    ],
    correctIndex: 1,
    explanation: 'Rumus 20-20-20 mengingatkan: jika gempa terasa lebih dari 20 detik, Anda punya waktu ~20 menit sebelum gelombang tiba untuk lari ke ketinggian minimal 20 meter.',
    difficulty: 'Sedang'
  },
  {
    id: 'q_ts_2',
    disasterId: 'TSUNAMI',
    question: 'Mengapa hutan bakau (mangrove) sangat penting dalam mitigasi bencana tsunami di wilayah pesisir Indonesia?',
    options: [
      'Membuat pemandangan pantai lebih indah untuk pariwisata',
      'Akar rimpang mangrove yang rapat mampu mereduksi hingga 50-60% energi dan tinggi gelombang tsunami',
      'Menghalangi perahu nelayan agar tidak terbawa ke tengah laut',
      'Menyerap air laut hingga habis sebelum sampai ke daratan'
    ],
    correctIndex: 1,
    explanation: 'Sabuk hijau mangrove bertindak sebagai pemecah gelombang alami yang menyerap dan memecah momentum energi hidrolik tsunami.',
    difficulty: 'Mudah'
  },
  {
    id: 'q_ts_3',
    disasterId: 'TSUNAMI',
    question: 'Jika Anda melihat air laut di bibir pantai tiba-tiba surut drastis hingga dasar laut terlihat, tindakan yang benar adalah...',
    options: [
      'Turun ke pantai memungut ikan segar yang terdampar',
      'Mengambil kamera untuk merekam fenomena langka tersebut dari dekat',
      'Segera lari secepatnya ke tempat tinggi atau bukit tanpa menunggu suara sirene',
      'Berdiam diri di pinggir pantai menunggu air laut kembali normal'
    ],
    correctIndex: 2,
    explanation: 'Surutnya air laut secara drastis adalah tanda hisapan hidrolik sebelum gelombang tsunami raksasa tiba. Segera evakuasi ke tempat tinggi!',
    difficulty: 'Mudah'
  },

  // Volcano
  {
    id: 'q_vol_1',
    disasterId: 'VOLCANO',
    question: 'Material awan gas dan debu vulkanik panas bersuhu ratusan derajat Celcius yang meluncur cepat di lereng gunung api dikenal di Merapi dengan istilah...',
    options: [
      'Lahar Dingin',
      'Wedhus Gembel (Awan Panas Guguran)',
      'Batu Apung',
      'Geiser Pijar'
    ],
    correctIndex: 1,
    explanation: 'Awan panas guguran atau wedhus gembel memiliki suhu antara 300°C hingga 700°C dan dapat meluncur menuruni lereng hingga 200 km/jam.',
    difficulty: 'Mudah'
  },
  {
    id: 'q_vol_2',
    disasterId: 'VOLCANO',
    question: 'Mengapa saat terjadi hujan abu vulkanik kita sangat disarankan memakai masker khusus (seperti N95) dan kacamata?',
    options: [
      'Karena abu vulkanik mengandung parfum belerang yang harum',
      'Partikel abu vulkanik terdiri dari pecahan kristal silika mikroskopis yang tajam dan merusak alveolus paru-paru serta kornea mata',
      'Agar pakaian yang kita kenakan tidak kotor',
      'Untuk melindungi diri dari terik sinar matahari'
    ],
    correctIndex: 1,
    explanation: 'Abu vulkanik bukanlah abu pembakaran biasa melainkan serpihan batuan dan kaca silika yang tajam yang dapat menyebabkan penyakit ISPA dan abrasi mata.',
    difficulty: 'Sedang'
  },
  {
    id: 'q_vol_3',
    disasterId: 'VOLCANO',
    question: 'Tingkatan status aktivitas gunung api di Indonesia oleh PVMBG secara berurutan dari yang paling rendah hingga paling tinggi adalah...',
    options: [
      'Normal, Waspada, Siaga, Awas',
      'Aman, Hati-hati, Bahaya, Kritis',
      'Waspada, Normal, Awas, Siaga',
      'Hijau, Kuning, Oranye, Merah'
    ],
    correctIndex: 0,
    explanation: 'Status resmi PVMBG: Level I (Normal), Level II (Waspada), Level III (Siaga), dan Level IV (Awas).',
    difficulty: 'Mudah'
  },

  // Flood
  {
    id: 'q_fl_1',
    disasterId: 'FLOOD',
    question: 'Tindakan pertama dan paling utama yang harus dilakukan saat air banjir mulai menggenangi rumah adalah...',
    options: [
      'Menghidupkan pompa air listrik',
      'Mematikan sakelar listrik utama (MCB) rumah untuk mencegah sengatan arus listrik',
      'Membuka semua pintu dan jendela selebar-lebarnya',
      'Mencuci perabotan yang kotor'
    ],
    correctIndex: 1,
    explanation: 'Sengatan arus listrik (electrocution) melalui air genangan banjir adalah salah satu penyebab kematian terbanyak dalam bencana banjir permukiman.',
    difficulty: 'Mudah'
  },
  {
    id: 'q_fl_2',
    disasterId: 'FLOOD',
    question: 'Penyakit mematikan yang ditularkan melalui air kencing tikus yang bercampur dengan genangan air banjir dan masuk lewat luka terbuka adalah...',
    options: [
      'Leptospirosis',
      'Malaria',
      'Tuberkulosis',
      'Rabies'
    ],
    correctIndex: 0,
    explanation: 'Leptospirosis disebabkan oleh bakteri Leptospira yang menyebar lewat urine hewan pengerat dan dapat merusak ginjal bila tidak segera diobati.',
    difficulty: 'Sedang'
  },

  // Landslide
  {
    id: 'q_ls_1',
    disasterId: 'LANDSLIDE',
    question: 'Jenis tanaman berakar serabut kuat dan dalam (hingga 3-5 meter) yang sangat efektif mencegah erosi dan tanah longsor di lereng bukit adalah...',
    options: [
      'Pohon Pisang',
      'Rumput Vetiver (Akar Wangi)',
      'Tanaman Padi',
      'Kaktus Gurun'
    ],
    correctIndex: 1,
    explanation: 'Akar rumput Vetiver menembus lapisan tanah dalam seperti paku bumi yang mengikat partikel lereng dan terbukti direkomendasikan BNPB.',
    difficulty: 'Sedang'
  },
  {
    id: 'q_ls_2',
    disasterId: 'LANDSLIDE',
    question: 'Jika tanah longsor meluncur deras ke arah Anda dari lereng atas, arah penyelamatan diri terbaik adalah...',
    options: [
      'Berlari lurus menuruni lereng searah jatuhnya tanah',
      'Berlari menyamping (tegak lurus) keluar dari jalur luncuran massa tanah',
      'Bersembunyi di bawah atap pondok kayu di tepi lereng',
      'Diam di tempat sambil berteriak'
    ],
    correctIndex: 1,
    explanation: 'Lari menyamping menjauhkan Anda dari koridor utama runtuhan batu dan tanah yang berkecepatan tinggi.',
    difficulty: 'Mudah'
  },

  // Tornado
  {
    id: 'q_to_1',
    disasterId: 'TORNADO',
    question: 'Awan badai berbentuk menjulang tinggi mirip bunga kol berwarna gelap pekat yang sering memicu angin puting beliung dan hujan es adalah...',
    options: [
      'Awan Cirrus',
      'Awan Cumulonimbus (CB)',
      'Awan Stratus',
      'Awan Altocumulus'
    ],
    correctIndex: 1,
    explanation: 'Awan Cumulonimbus adalah awan badai konvektif raksasa dengan arus udara vertikal kuat yang dapat menghasilkan puting beliung, petir, dan angin kencang.',
    difficulty: 'Mudah'
  },
  {
    id: 'q_to_2',
    disasterId: 'TORNADO',
    question: 'Tempat teraman di dalam rumah bertingkat saat diterjang angin puting beliung adalah...',
    options: [
      'Balkon lantai atas dekat jendela kaca',
      'Ruangan paling dalam di lantai dasar tanpa jendela (kamar mandi / lorong tengah)',
      'Di garasi mobil dengan pintu terbuka',
      'Tepat di bawah genteng atap rumah'
    ],
    correctIndex: 1,
    explanation: 'Ruangan tengah di lantai dasar terlindung oleh dinding-dinding bagian luar dari terjangan angin kencang dan pecahan proyektil atap seng.',
    difficulty: 'Sedang'
  }
];
