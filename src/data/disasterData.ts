import { DisasterId, DisasterInfo, SimulationScenario } from '../types/disaster';

export const DISASTERS_DATA: Record<DisasterId, DisasterInfo> = {
  EARTHQUAKE: {
    id: 'EARTHQUAKE',
    name: 'Earthquake',
    indonesianName: 'Gempa Bumi',
    subtitle: 'Getaran Kerak Bumi Akibat Pelepasan Energi Seismik',
    tagline: 'Drop, Cover, and Hold On! Langkah cepat menyelamatkan nyawa.',
    category: 'Geologi',
    color: '#f59e0b',
    accentColor: '#fbbf24',
    ringColor: '#d97706',
    bgGradient: 'from-amber-950/40 via-slate-900/60 to-slate-950/90',
    causes: {
      title: 'Penyebab Terjadinya Gempa Bumi',
      summary: 'Indonesia terletak di pertemuan 3 lempeng tektonik utama dunia: Indo-Australia, Eurasia, dan Pasifik.',
      points: [
        'Pergeseran Lempeng Tektonik: Subduksi lempeng menumpuk tegangan hingga batuan patah dan melepaskan energi getaran seismik.',
        'Aktivitas Sesar Aktif Darat: Pergerakan patahan kerak bumi lokal seperti Sesar Semangko di Sumatra, Sesar Lembang di Jawa Barat, dan Sesar Palu-Koro di Sulawesi.',
        'Aktivitas Vulkanik: Pergerakan magma bertekanan tinggi di bawah gunung api aktif memicu gempa vulkanik berkala.',
        'Runtuhan Gua Bawah Tanah atau Aktivitas Peledakan Tambang (Gempa Runtuhan).'
      ]
    },
    warningSigns: {
      title: 'Tanda & Gejala Datangnya Gempa',
      summary: 'Gempa bumi tektonik terjadi sangat cepat tanpa jeda panjang, namun ada indikator yang dapat diamati.',
      points: [
        'Suara gemuruh mendalam dari perut bumi sesaat sebelum guncangan hebat terasa.',
        'Lampu gantung, kipas angin, atau benda gantung mulai berayun secara tiba-tiba.',
        'Perilaku gelisah atau panik pada hewan peliharaan (kucing, anjing, burung) sesaat sebelum gempa karena kepekaan terhadap gelombang P (primer).',
        'Gempa pendahuluan (foreshock) berskala kecil sebelum guncangan utama (mainshock).'
      ]
    },
    impacts: {
      title: 'Dampak Kerusakan Gempa Bumi',
      summary: 'Kerugian fisik dan non-fisik akibat keruntuhan infrastruktur dan goncangan tanah.',
      points: [
        'Kerusakan Struktural: Gedung bertingkat, sekolah, dan rumah yang tidak tahan gempa runtuh menimpa penghuni.',
        'Likuefaksi (Pencairan Tanah): Tanah berpasir jenuh air kehilangan kekuatannya dan berubah seperti lumpur cair (seperti di Petobo, Palu 2018).',
        'Pemicu Bencana Sekunder: Kebakaran akibat korsleting listrik / kebocoran pipa gas, tanah longsor di perbukitan, serta tsunami bila episentrum di laut dangkal.'
      ]
    },
    prevention: {
      title: 'Mitigasi & Pencegahan',
      summary: 'Langkah persiapan sebelum bencana terjadi untuk meminimalisir risiko korban jiwa.',
      points: [
        'Membangun rumah dengan standar tahan gempa (struktur beton bertulang dan atap ringan).',
        'Mengikat lemari buku dan perabot berat ke dinding agar tidak roboh saat guncangan.',
        'Menyiapkan Tas Siaga Bencana (TSB) di dekat pintu keluar rumah.',
        'Rutin mengadakan simulasi evakuasi mandiri bersama keluarga dan sekolah.'
      ]
    },
    emergencyProcedures: {
      title: 'Prosedur Darurat (Saat Gempa Terjadi)',
      summary: 'Tiga langkah emas bertahan hidup di dalam ruangan: DROP, COVER, HOLD ON!',
      points: [
        'DROP (Merunduk): Segera jatuhkan tubuh ke lantai sebelum guncangan menjatuhkan Anda.',
        'COVER (Berlindung): Masuk ke bawah meja yang kokoh dan lindungi kepala serta leher dengan tangan.',
        'HOLD ON (Bertahan): Pegang erat kaki meja hingga guncangan benar-benar berhenti.',
        'JANGAN gunakan lift! Gunakan tangga darurat setelah guncangan berhenti.',
        'Jika berada di luar ruangan, jauhi gedung tinggi, papan reklame, dan tiang listrik.'
      ]
    },
    evacuation: {
      title: 'Jalur & Prosedur Evakuasi',
      summary: 'Langkah aman keluar gedung menuju titik kumpul aman (Assembly Point).',
      points: [
        'Tunggu hingga guncangan gempa selesai sebelum bergerak keluar.',
        'Keluar dengan tertib tanpa saling dorong, lindungi kepala dengan tas atau helm.',
        'Berkumpul di lapangan terbuka yang bebas dari bahaya runtuhan atap dan kaca.',
        'Matikan sekring listrik utama dan keran kompor gas jika situasi memungkinkan.'
      ]
    },
    funFact: 'Indonesia mencatat rata-rata lebih dari 5.000 hingga 10.000 gempa bumi setiap tahunnya karena letak geografisnya di Cincin Api Pasifik (Ring of Fire).',
    famousEventIndonesia: {
      title: 'Gempa Palu & Donggala',
      year: '2018',
      location: 'Sulawesi Tengah',
      description: 'Gempa M 7.4 yang disertai fenomena likuefaksi masif di Petobo dan Balaroa serta tsunami di Teluk Palu.'
    },
    hotspots: [
      { title: 'Zona Meja Pelindung', description: 'Area aman terbaik untuk berlindung (Drop, Cover, Hold on).', position: [0, -0.8, -1] },
      { title: 'Jendela Kaca', description: 'Bahaya pecahan kaca tajam! Segera jauhi jendela saat gempa.', position: [3, 1, -4] },
      { title: 'Pintu Darurat', description: 'Jalur evakuasi setelah guncangan mereda.', position: [-3.8, 0, -2] }
    ]
  },

  TSUNAMI: {
    id: 'TSUNAMI',
    name: 'Tsunami',
    indonesianName: 'Tsunami',
    subtitle: 'Gelombang Raksasa Berkecepatan Jet Akibat Deformasi Bawah Laut',
    tagline: 'Air laut surut mendadak? Jangan tonton! Lari secepatnya ke tempat tinggi!',
    category: 'Geologi',
    color: '#06b6d4',
    accentColor: '#38bdf8',
    ringColor: '#0284c7',
    bgGradient: 'from-cyan-950/40 via-slate-900/60 to-slate-950/90',
    causes: {
      title: 'Penyebab Terjadinya Tsunami',
      summary: 'Perpindahan volume air laut secara tiba-tiba dalam skala masif.',
      points: [
        'Gempa Megathrust Bawah Laut: Gempa dengan episentrum di laut berkedalaman dangkal (<60 km) dengan mekanisme sesar naik/turun (thrust fault) berskala di atas M 7.0.',
        'Longsor Bawah Laut: Runtuhnya lereng benua di dasar laut yang memicu gelombang impulsif tinggi (seperti Tsunami Selat Sunda 2018).',
        'Letusan Kaldera Gunung Api Bawah Laut: Runtuhnya dinding gunung api ke dalam laut (seperti letusan purba Krakatau 1883).',
        'Tumbukan meteor di lautan (sangat langka).'
      ]
    },
    warningSigns: {
      title: 'Tanda Alami Tsunami (PENTING)',
      summary: 'Peringatan alamiah sering kali lebih cepat daripada sirene elektronik BMKG.',
      points: [
        'Guncangan gempa bumi kuat yang membuat sulit berdiri, berlangsung lebih dari 20 detik.',
        'Surutnya air laut secara drastis dalam beberapa menit hingga ikan-ikan terdampar di pasir pantai.',
        'Suara dentuman atau gemuruh kencang menyerupai suara mesin jet tempur dari arah lepas pantai.',
        'Aroma belerang atau bau lumpur laut yang sangat menyengat tertiup ke daratan.'
      ]
    },
    impacts: {
      title: 'Dampak Bencana Tsunami',
      summary: 'Daya hantam gelombang air laut yang dapat menghancurkan seluruh garis pantai hingga berkilo-kilo ke pedalaman.',
      points: [
        'Penghancuran total infrastruktur pesisir (pelabuhan, rumah, jembatan, perahu nelayan).',
        'Arus balik gelombang yang menyeret korban dan puing-puing kembali ke tengah samudera luas.',
        'Pencemaran air tanah pesisir oleh air asin laut (salinisasi tanah pertanian).',
        'Potensi wabah penyakit akibat sanitasi yang rusak dan genangan air kotor.'
      ]
    },
    prevention: {
      title: 'Mitigasi & Pencegahan Tsunami',
      summary: 'Kombinasi sabuk hijau alami dan teknologi peringatan dini.',
      points: [
        'Penanaman Hutan Mangrove (Bakau): Akar bakau yang lebat terbukti mereduksi hingga 60% energi hantaman gelombang tsunami.',
        'Pemasangan Tsunami Early Warning System (InaTEWS) dengan sensor buoy dan kabel serat optik bawah laut.',
        'Pembangunan Tanggul Laut (Sea Wall) dan shelter buatan evakuasi vertikal di daerah pesisir padat penduduk.',
        'Pemasangan papan petunjuk jalur evakuasi menuju bukit/tempat berketinggian minimal 20 meter.'
      ]
    },
    emergencyProcedures: {
      title: 'Prosedur Darurat Tsunami: Rumus 20-20-20',
      summary: 'Ingat rumus keselamatan pesisir jika terjadi gempa di pantai!',
      points: [
        'Jika gempa berlangsung 20 detik...',
        'Anda memiliki waktu sekitar 20 menit sebelum gelombang tiba...',
        'Segera lari dan selamatkan diri ke ketinggian minimal 20 meter!',
        'JANGAN gunakan kendaraan bermobil (rawan terjebak macet total di jalan pantai). Lari atau gunakan sepeda motor kecil.',
        'JANGAN sekali-kali turun ke pantai untuk memungut ikan yang terdampar!'
      ]
    },
    evacuation: {
      title: 'Jalur Evakuasi Tsunami',
      summary: 'Rute menuju Tempat Evakuasi Sementara (TES) atau bukit tinggi.',
      points: [
        'Ikuti rambu jalur evakuasi tsunami bercat biru-putih resmi BNPB.',
        'Bila tidak ada bukit, cari gedung bertingkat permanen (minimal lantai 3 atau 4) yang terverifikasi kokoh.',
        'Tetap di tempat aman hingga peringatan resmi BMKG dicabut, karena gelombang tsunami kedua atau ketiga bisa jauh lebih besar dari yang pertama.'
      ]
    },
    funFact: 'Gelombang tsunami di laut dalam bisa bergerak secepat pesawat jet komersial (800 km/jam), namun tingginya di tengah laut hanya sekitar 1 meter sebelum meninggi saat mendekati perairan dangkal.',
    famousEventIndonesia: {
      title: 'Tsunami Samudera Hindia (Aceh)',
      year: '2004',
      location: 'Aceh & Pesisir Samudra Hindia',
      description: 'Gempa Megathrust M 9.1-9.3 memicu tsunami dahsyat hingga setinggi 30 meter, menjadi salah satu bencana terbesar dalam sejarah modern.'
    },
    hotspots: [
      { title: 'Garis Pantai & Taraf Air Laut', description: 'Area surut air mendadak sebelum gelombang raksasa tiba.', position: [0, -1, 3] },
      { title: 'Zona Aman Bukit Evakuasi', description: 'Ketinggian > 20 meter di atas permukaan laut sebagai titik kumpul aman.', position: [4, 2.5, -3] },
      { title: 'Menara Sirine BMKG', description: 'Menara sistem peringatan dini tsunami dengan bunyi raungan darurat.', position: [-3, 1, 0] }
    ]
  },

  VOLCANO: {
    id: 'VOLCANO',
    name: 'Volcanic Eruption',
    indonesianName: 'Gunung Api Meletus',
    subtitle: 'Pelepasan Magma, Gas Bertekanan, dan Material Piroklastik',
    tagline: 'Waspada Awan Panas dan Lahar Dingin! Taati batas Kawasan Rawan Bencana (KRB).',
    category: 'Geologi',
    color: '#ef4444',
    accentColor: '#f87171',
    ringColor: '#b91c1c',
    bgGradient: 'from-red-950/40 via-slate-900/60 to-slate-950/90',
    causes: {
      title: 'Penyebab Erupsi Gunung Api',
      summary: 'Dinamika magma dan tekanan gas di dalam dapur magma bumi.',
      points: [
        'Tekanan Gas Magma: Gas terlarut dalam magma (uap air, CO2, SO2) mengembang saat naik mendekati permukaan dan mendesak batuan penyumbat kawah.',
        'Pergerakan Lempeng Menghasilkan Pelelehan Batuan: Lempeng samudra menunjam ke bawah lempeng benua dan meleleh membentuk magma baru.',
        'Runtuhnya Kubah Lava: Kubah lava yang terbentuk di puncak runtuh akibat gravitasi, melepaskan awan panas guguran (pyroclastic flow).'
      ]
    },
    warningSigns: {
      title: 'Tanda & Tingkatan Status Gunung Api (PVMBG)',
      summary: 'Pusat Vulkanologi dan Mitigasi Bencana Geologi membagi status menjadi 4 level.',
      points: [
        'Level I (Normal): Aktivitas visual dan seismik dalam batas normal.',
        'Level II (Waspada): Peningkatan aktivitas seismik dan tremor vulkanik, suhu kawah meningkat.',
        'Level III (Siaga): Peningkatan drastis erupsi visual, asap kawah membubung tinggi, hewan liar turun gunung.',
        'Level IV (Awas): Letusan utama segera terjadi atau sedang berlangsung. Evakuasi total radius KRB III wajib dilakukan.'
      ]
    },
    impacts: {
      title: 'Bahaya Primer & Sekunder Erupsi',
      summary: 'Ancaman langsung material panas dan ancaman susulan saat musim hujan.',
      points: [
        'Awan Panas (Wedhus Gembel): Campuran gas pijar, abu, dan batu bersuhu 300°C - 700°C meluncur dengan kecepatan hingga 200 km/jam.',
        'Hujan Abu Vulkanik & Pasir: Menyebabkan gangguan pernapasan akut (ISPA), merusak mesin pesawat terbang, dan merobohkan atap rumah yang berat.',
        'Lahar Dingin: Aliran lumpur dan batu vulkanik yang terbawa air hujan deras menyapu daerah bantaran sungai di kaki gunung.'
      ]
    },
    prevention: {
      title: 'Mitigasi Bencana Vulkanik',
      summary: 'Pemantauan seismometer 24 jam dan penataan ruang kawasan.',
      points: [
        'Mematuhi peta Kawasan Rawan Bencana (KRB I, II, dan III) yang diterbitkan PVMBG.',
        'Pembangunan sabo dam (bendung penahan lahar) di sepanjang alur sungai lereng gunung.',
        'Selalu menyiapkan masker N95 / kacamata pelindung (goggles) dan persediaan air tertutup rapat di rumah.',
        'Menyediakan kendaraan evakuasi siaga di desa-desa lingkar gunung.'
      ]
    },
    emergencyProcedures: {
      title: 'Prosedur Darurat Saat Erupsi',
      summary: 'Tindakan penyelamatan diri bagi warga di sekitar zona bahaya.',
      points: [
        'Gunakan masker atau kain basah untuk menutup hidung dan mulut dari serbuan abu vulkanik.',
        'Kenakan pakaian tertutup, baju lengan panjang, celana panjang, dan topi.',
        'Jauhi lembah sungai dan lereng curam untuk menghindari terjangan awan panas dan lahar.',
        'Masuk ke dalam ruangan dan tutup seluruh pintu serta ventilasi jendela.',
        'Segera ikuti instruksi petugas BPBD untuk mengungsi ke posko pengungsian di luar radius aman.'
      ]
    },
    evacuation: {
      title: 'Jalur Evakuasi & Pengungsian',
      summary: 'Proses evakuasi terkoordinasi menuju Tempat Penampungan Sementara (TPS).',
      points: [
        'Segera tinggalkan tempat tinggal jika status sudah dinaikkan ke level SIAGA atau AWAS.',
        'Ikuti rute evakuasi yang menjauhi arah tiupan angin pembawa abu vulkanik.',
        'Bawa Tas Siaga Bencana yang berisi surat berharga dan obat-obatan pribadi.',
        'Pastikan lansia, anak-anak, dan ibu hamil dievakuasi dengan prioritas pertama.'
      ]
    },
    funFact: 'Indonesia memiliki lebih dari 127 gunung api aktif, terbanyak di dunia! Gunung Tambora (1815) menghasilkan letusan terbesar dalam sejarah tercatat yang memicu "Tahun Tanpa Musim Panas" di benua Eropa.',
    famousEventIndonesia: {
      title: 'Erupsi Gunung Merapi',
      year: '2010',
      location: 'D.I. Yogyakarta & Jawa Tengah',
      description: 'Erupsi eksplosif dahsyat yang melontarkan awan panas hingga radius 15 km, memicu evakuasi ratusan ribu warga lereng Merapi.'
    },
    hotspots: [
      { title: 'Kawah & Dapur Magma', description: 'Pusat tekanan gas tinggi dan pelepasan material pijar vulkanik.', position: [0, 2.2, 0] },
      { title: 'Aliran Awan Panas', description: 'Zona luncuran gas bersuhu 500°C yang sangat mematikan.', position: [1.5, 0.5, 1.2] },
      { title: 'Kawasan Rawan Bencana (KRB III)', description: 'Radius terlarang dalam jarak 5 hingga 10 kilometer dari puncak.', position: [0, -1.8, 3] }
    ]
  },

  FLOOD: {
    id: 'FLOOD',
    name: 'Flood',
    indonesianName: 'Banjir & Banjir Bandang',
    subtitle: 'Luapan Air Yang Merendam Daratan Akibat Curah Hujan Ekstrem',
    tagline: 'Amankan instalasi listrik, jangan biarkan sampah menyumbat aliran air!',
    category: 'Hidrometeorologi',
    color: '#3b82f6',
    accentColor: '#60a5fa',
    ringColor: '#1d4ed8',
    bgGradient: 'from-blue-950/40 via-slate-900/60 to-slate-950/90',
    causes: {
      title: 'Penyebab Terjadinya Banjir',
      summary: 'Kombinasi faktor alam curah hujan tinggi dan degradasi lingkungan perkotaan/hulu.',
      points: [
        'Curah Hujan Ekstrem & Fenomena La Niña: Volume air hujan melebihi kapasitas infiltrasi tanah dan saluran drainase.',
        'Penyempitan & Pendangkalan Sungai: Tumpukan sampah domestik dan sedimentasi lumpur menumpuk di badan sungai.',
        'Alih Fungsi Lahan Resapan: Hutan di kawasan hulu ditebang untuk perkebunan / vila, serta tutupan aspal dan beton di perkotaan.',
        'Penurunan Muka Tanah (Land Subsidence): Eksploitasi air tanah berlebihan di pesisir memicu banjir rob air laut.'
      ]
    },
    warningSigns: {
      title: 'Tanda-Tanda Datangnya Banjir',
      summary: 'Indikasi kenaikan debit air di daerah hulu dan saluran lingkungan.',
      points: [
        'Hujan deras terus-menerus selama beberapa jam berturut-turut tanpa jeda.',
        'Air saluran got/drainase meluap dan tidak kunjung menyusut ke tanah.',
        'Air sungai berubah warna menjadi cokelat keruh pekat bercampur ranting pohon dan lumpur (tanda banjir bandang hulu).',
        'Pemberitahuan peringatan status pintu air (Siaga 3, 2, 1) dari dinas sumber daya air.'
      ]
    },
    impacts: {
      title: 'Dampak Bencana Banjir',
      summary: 'Kerusakan properti, lumpuhnya mobilitas kota, dan ancaman penyakit pascabanjir.',
      points: [
        'Tersengat Arus Listrik: Bahaya paling mematikan saat air merendam stop kontak rumah yang belum dimatikan.',
        'Kerusakan Rumah & Kendaraan Bermotor: Rusaknya perabotan elektronik, arsip, dan mesin mobil/motor.',
        'Wabah Penyakit Pascabanjir: Leptospirosis (kencing tikus), kolera, diare, demam berdarah, dan penyakit kulit kotor.'
      ]
    },
    prevention: {
      title: 'Mitigasi & Pengendalian Banjir',
      summary: 'Langkah struktural dan non-struktural menjaga kelestarian siklus air.',
      points: [
        'Menjaga kebersihan saluran air: Tidak membuang sampah ke got dan sungai!',
        'Membuat Lubang Biopori dan Sumur Resapan di halaman rumah untuk mempercepat penyerapan air hujan.',
        'Menanam pohon berakar kuat untuk menjaga kelestarian daerah tangkapan air (catchment area).',
        'Normalisasi dan restorasi bantaran sungai serta pembuatan waduk retensi pengendali banjir.'
      ]
    },
    emergencyProcedures: {
      title: 'Prosedur Darurat Saat Terjadi Banjir',
      summary: 'Prioritas keselamatan nomor satu saat air mulai memasuki rumah.',
      points: [
        'LANGKAH UTAMA: Segera matikan Miniature Circuit Breaker (MCB) sekring listrik utama rumah!',
        'Pindahkan barang elektronik, dokumen ijazah/sertifikat, dan obat-obatan ke lantai 2 atau tempat tertinggi.',
        'Tutup keran saluran gas elpiji.',
        'Hindari berjalan melintasi arus banjir yang deras (arus air sedalam 15 cm sudah mampu menjatuhkan orang dewasa).',
        'Jauhi tiang listrik, gardu trafo PLN, atau kabel yang terendam genangan air.'
      ]
    },
    evacuation: {
      title: 'Evakuasi & Tempat Pengungsian Banjir',
      summary: 'Bergerak ke lokasi aman sebelum jalanan terputus total oleh genangan tinggi.',
      points: [
        'Gunakan sepatu bot karet atau pelindung kaki untuk menghindari benda tajam tersembunyi di bawah air keruh.',
        'Bawa Tas Siaga Bencana berisi pakaian ganti kedap air dan senter tahan air.',
        'Segera hubungi tim SAR / BPBD (Call Center 112 / 115) bila ada anggota keluarga yang terjebak di atap rumah.'
      ]
    },
    funFact: 'Aliran air banjir setinggi hanya 30 sentimeter (setinggi lutut) memiliki daya dorong yang cukup kuat untuk menghanyutkan sebagian besar mobil keluarga!',
    famousEventIndonesia: {
      title: 'Banjir Jabodetabek Awal Tahun',
      year: '2020',
      location: 'DKI Jakarta, Jawa Barat, Banten',
      description: 'Curah hujan ekstrem tertinggi dalam 150 tahun (377 mm/hari) memicu banjir masif di ratusan titik permukiman Jabodetabek.'
    },
    hotspots: [
      { title: 'Panel Sekring Listrik (MCB)', description: 'Tindakan pertama: Putus arus listrik saat air mulai menggenang!', position: [-2, 0.5, -2] },
      { title: 'Saluran Drainase Tersumbat', description: 'Sampah yang menumpuk menghalangi laju aliran air dan mempercepat banjir.', position: [2, -1.8, 1] },
      { title: 'Lantai Dua / Posko Ketinggian', description: 'Zona evakuasi vertikal darurat sebelum bantuan perahu karet tiba.', position: [-1, 2, -2] }
    ]
  },

  LANDSLIDE: {
    id: 'LANDSLIDE',
    name: 'Landslide',
    indonesianName: 'Tanah Longsor',
    subtitle: 'Gerakan Massa Tanah dan Batuan Menuruni Lereng Curam',
    tagline: 'Waspada retakan tanah saat hujan lebat berhari-hari!',
    category: 'Geologi',
    color: '#84cc16',
    accentColor: '#a3e635',
    ringColor: '#65a30d',
    bgGradient: 'from-lime-950/40 via-slate-900/60 to-slate-950/90',
    causes: {
      title: 'Penyebab Terjadinya Tanah Longsor',
      summary: 'Hilangnya daya ikat tanah pada bidang gelincir lereng perbukitan.',
      points: [
        'Hujan Lebat Berdurasi Panjang: Air hujan meresap ke dalam pori-pori tanah, menambah beban massa tanah dan melicinkan bidang gelincir kedap air di bawahnya.',
        'Penebangan Pohon Pengikat Lereng (Deforestasi): Hilangnya perakaran pohon dalam yang berfungsi sebagai paku bumi alami penahan tanah.',
        'Pemotongan Kaki Lereng Secara Sembarangan: Pembuatan jalan atau perumahan tanpa memperhitungkan dinding penahan tanah (retaining wall).',
        'Beban Tambahan di Atas Lereng: Pembangunan kolam ikan atau bangunan bertingkat berat tepat di bibir tebing curam.'
      ]
    },
    warningSigns: {
      title: 'Tanda Peringatan Dini Longsor',
      summary: 'Gejala struktural dan alamiah di sekitar lereng bukit.',
      points: [
        'Munculnya retakan baru (horse-shoe cracks) pada tanah, lantai rumah, atau aspal jalan di lereng.',
        'Tiang listrik, tiang telepon, atau pepohonan di lereng mulai miring ke arah bawah bukit.',
        'Pintu dan jendela rumah di sekitar lereng tiba-tiba seret atau macet karena kusen bangunan bergeser.',
        'Mata air baru mendadak muncul atau sebaliknya mata air lama tiba-tiba keruh berlumpur.',
        'Terdengar suara gemertak patahan akar atau gemuruh runtuhan batu kecil.'
      ]
    },
    impacts: {
      title: 'Dampak Bencana Tanah Longsor',
      summary: 'Material longsor yang menimbun pemukiman dalam hitungan detik.',
      points: [
        'Penimbunan rumah warga, sekolah, dan fasilitas umum di bawah lereng tebing.',
        'Terputusnya jalan raya antarkota dan jalur pipa air bersih atau jaringan listrik.',
        'Membendung aliran sungai secara tiba-tiba yang berpotensi memicu banjir bandang kiriman saat bendung alami tersebut jebol.'
      ]
    },
    prevention: {
      title: 'Mitigasi & Pencegahan Longsor',
      summary: 'Rekayasa vegetatif dan teknik geoteknik lereng.',
      points: [
        'Menanam Tanaman Akar Wangi (Vetiver Grass): Akarnya dapat menembus 3-5 meter ke dalam tanah mengikat lapisan lereng layaknya paku bumi.',
        'Membuat Terasering / Sengkedan berundak untuk mengurangi sudut kemiringan lereng.',
        'Memasang Bronjong Kawat Berisi Batu (Gabion) dan dinding penahan beton bertulang di kaki tebing.',
        'Membuat saluran drainase permukaan lereng agar air hujan langsung mengalir cepat tanpa meresap jenuh ke bidang gelincir.'
      ]
    },
    emergencyProcedures: {
      title: 'Prosedur Darurat Longsor',
      summary: 'Keputusan evakuasi cepat saat tanah mulai bergerak.',
      points: [
        'Segera tinggalkan rumah dan kawasan lereng jika mendengar suara gemuruh atau melihat retakan tanah melebar!',
        'JANGAN berlindung di bawah tebing atau di dalam lembah jalur luncuran material longsor.',
        'Lari menyamping (tegak lurus) terhadap arah luncuran tanah longsor, bukan searah dengan arah longsoran.',
        'Tolong anggota keluarga rentan (anak-anak dan lansia) dan bawa Tas Siaga Bencana jika sempat.'
      ]
    },
    evacuation: {
      title: 'Evakuasi & Tempat Berkumpul Aman',
      summary: 'Menuju dataran stabil yang bebas dari ancaman luncuran sekunder.',
      points: [
        'Berkumpul di lapangan datar yang berada di luar zona bahaya luncuran tanah.',
        'Jangan mendekati lokasi longsoran lama sebelum dinyatakan stabil oleh tim ahli geologi, karena rawan terjadi longsor susulan saat hujan kembali turun.',
        'Laporkan adanya korban tertimbun kepada petugas SAR gabungan.'
      ]
    },
    funFact: 'Rumput Vetiver (Akar Wangi) memiliki kekuatan tarik akar hingga seperenam kekuatan baja lunak dan mampu menahan erosi tanah lereng hingga 90%!',
    famousEventIndonesia: {
      title: 'Longsor Cisolok & Banjarnegara',
      year: '2014 & 2019',
      location: 'Jawa Tengah & Jawa Barat',
      description: 'Longsor tebing curam setelah hujan lebat berhari-hari menimbun puluhan rumah penduduk di lereng perbukitan.'
    },
    hotspots: [
      { title: 'Retakan Tanah (Fissure)', description: 'Tanda kritis: Retakan yang melebar menandakan tanah siap meluncur ke bawah.', position: [0, 1.2, -1] },
      { title: 'Terasering & Bronjong Kawat', description: 'Struktur rekayasa lereng untuk memperlambat erosi dan memperkuat tebing.', position: [-2, -1, 1] },
      { title: 'Arah Evakuasi Menyamping', description: 'Selalu lari tegak lurus ke samping dari jalur runtuhan tanah!', position: [3, 0, 0] }
    ]
  },

  TORNADO: {
    id: 'TORNADO',
    name: 'Tornado / Puting Beliung',
    indonesianName: 'Angin Puting Beliung',
    subtitle: 'Pusaran Angin Kencang Berkecepatan Tinggi dari Awan Cumulonimbus',
    tagline: 'Masuk ke dalam bangunan kokoh, hindari jendela dan pohon rindang!',
    category: 'Hidrometeorologi',
    color: '#8b5cf6',
    accentColor: '#a78bfa',
    ringColor: '#6d28d9',
    bgGradient: 'from-purple-950/40 via-slate-900/60 to-slate-950/90',
    causes: {
      title: 'Penyebab Angin Puting Beliung',
      summary: 'Dinamika atmosfer pada masa pancaroba (peralihan musim).',
      points: [
        'Pertumbuhan Awan Cumulonimbus (CB): Pemanasan matahari yang kuat di siang hari memicu arus udara naik (updraft) yang sangat kuat dan membentuk awan badai gelap menjulang tinggi.',
        'Perbedaan Suhu dan Kelembapan Ekstrem: Pertemuan massa udara panas lembap dengan udara dingin di lapisan atas memicu ketidakstabilan atmosfer.',
        'Rotasi Vorteks Udara: Arus udara turun (downdraft) dan arus naik berputar membentuk pusaran corong angin (funnel cloud) yang menyentuh tanah berdurasi 5-10 menit.'
      ]
    },
    warningSigns: {
      title: 'Tanda Datangnya Puting Beliung',
      summary: 'Perubahan cuaca mendadak dari panas gerah menjadi badai dingin.',
      points: [
        'Udara terasa sangat panas, gerah, dan pengap sejak pagi hingga siang hari.',
        'Sekitar pukul 13.00 - 17.00, muncul awan putih berlapis yang cepat berubah menjadi awan hitam gelap pekat berbentuk bunga kol (Cumulonimbus).',
        'Angin tiba-tiba berhembus sangat kencang dan dingin disertai ranting pohon bergoyang hebat ke segala arah.',
        'Terlihat corong angin gelap berputar turun dari dasar awan badai menuju tanah.',
        'Terdengar suara desingan atau dengungan keras menyerupai deru helikopter terbang rendah.'
      ]
    },
    impacts: {
      title: 'Dampak Angin Puting Beliung',
      summary: 'Daya hisap dan terpaan angin berkecepatan lebih dari 60-100 km/jam.',
      points: [
        'Atap rumah berbahan seng, asbes, dan genteng terlepas dan beterbangan menjadi proyektil tajam.',
        'Pohon-pohon besar tumbang melintang di jalan raya menimpa kendaraan bermotor.',
        'Papan reklame (billboard) raksasa dan tiang listrik roboh menimbulkan bahaya kebakaran listrik.',
        'Kerusakan tanaman pertanian dan lumbung pangan terbuka.'
      ]
    },
    prevention: {
      title: 'Mitigasi Bencana Puting Beliung',
      summary: 'Persiapan lingkungan rumah sebelum masa pancaroba tiba.',
      points: [
        'Memangkas dahan dan ranting pohon rindang di sekitar rumah yang sudah lapuk atau terlalu lebat.',
        'Memperkuat ikatan dan paku atap rumah berbahan seng atau asbes ke rangka atap bangunan.',
        'Membangun struktur rumah berdinding bata kokoh dengan ikatan balok cor semen yang baik.',
        'Membiasakan memantau radar cuaca dan peringatan dini cuaca ekstrem dari aplikasi BMKG.'
      ]
    },
    emergencyProcedures: {
      title: 'Prosedur Darurat Saat Puting Beliung Melanda',
      summary: 'Tindakan perlindungan diri saat melihat pusaran angin mendekat.',
      points: [
        'JIKA DI DALAM RUMAH: Segera cari ruangan paling tengah tanpa jendela (seperti lorong dalam, kamar mandi, atau bawah tangga).',
        'Jauhi jendela kaca! Terpaan angin atau puing terbang dapat memecahkan kaca menjadi serpihan mematikan.',
        'Tengkurap di lantai dan lindungi kepala serta leher dengan bantal, kasur busa, atau kedua lengan tangan.',
        'JIKA DI LUAR RUANGAN: JANGAN berlindung di bawah pohon rindang, jembatan penyeberangan, atau papan reklame!',
        'Cari parit, selokan kering, atau cekungan tanah terdekat, berbaringlah telungkup dan lindungi kepala Anda.'
      ]
    },
    evacuation: {
      title: 'Evakuasi & Tindakan Pascabadai',
      summary: 'Waspada bahaya listrik dan reruntuhan setelah angin mereda.',
      points: [
        'Puting beliung biasanya berlangsung singkat (5-10 menit). Tetap berada di ruangan aman sampai suara gemuruh angin benar-benar reda.',
        'Hati-hati terhadap kabel listrik yang putus bergelantungan di tanah atau genangan air.',
        'Bantu tetangga yang tertimpa reruntuhan atap dan gunakan sarung tangan kerja tebal saat membersihkan puing.'
      ]
    },
    funFact: 'Pada Februari 2024, pusaran angin berkekuatan dahsyat berkecepatan lebih dari 120 km/jam menerjang kawasan Rancaekek, Bandung, yang oleh para peneliti BRIN dikategorikan sebagai tornado darat langka di iklim tropis!',
    famousEventIndonesia: {
      title: 'Tornado Rancaekek & Jatinangor',
      year: '2024',
      location: 'Bandung - Sumedang, Jawa Barat',
      description: 'Pusaran angin raksasa menerbangkan atap pabrik, merobohkan papan baliho, dan merusak ratusan rumah dengan jalur kerusakan sepanjang berkilo-kilo.'
    },
    hotspots: [
      { title: 'Pusaran Corong Badai (Vortex)', description: 'Pusat rotasi angin berkecepatan 100 km/jam yang memiliki daya hisap luar biasa.', position: [0, 2.5, 0] },
      { title: 'Zona Aman Ruangan Tengah', description: 'Ruangan tanpa jendela (kamar mandi/bawah tangga) adalah tempat teraman di dalam rumah.', position: [-2, 0, -2] },
      { title: 'Bahaya Pohon Rindang & Reklame', description: 'Jauhi objek tinggi yang rawan tumbang terhempas angin badai.', position: [2.5, 0, 1] }
    ]
  }
};

// Gamified Simulation Scenarios for Interactive Learning
export const SIMULATION_SCENARIOS: Record<DisasterId, SimulationScenario> = {
  EARTHQUAKE: {
    disasterId: 'EARTHQUAKE',
    title: 'Simulasi Gempa Bumi: Ruang Kelas Berguncang',
    environmentName: 'Ruang Kelas Lantai 2 Sekolah',
    briefing: 'Pukul 10:15 WIB, saat kegiatan belajar berlangsung, tiba-tiba terdengar suara gemuruh dan lantai kelas berguncang hebat (M 6.8). Lampu berkedip dan buku-buku berjatuhan dari rak!',
    objective: 'Ambil keputusan yang tepat untuk melindungi diri dari reruntuhan plafon dan kaca!',
    hazardLevel: 'Siaga',
    steps: [
      {
        id: 'eq_step_1',
        instruction: 'Guncangan gempa semakin kencang! Apa tindakan pertama yang HARUS Anda lakukan sekarang?',
        timeLimit: 12,
        options: [
          {
            id: 'opt_run',
            label: 'Segera berdiri dan lari panik keluar pintu kelas menuju tangga',
            isCorrect: false,
            feedback: 'Salah! Berlari saat guncangan kencang membuat Anda mudah terjatuh dan berisiko tertimpa pecahan plafon atau kaca koridor.',
            xp: 0
          },
          {
            id: 'opt_drop_cover',
            label: 'Lakukan DROP, COVER, HOLD ON: Merunduk dan masuk ke bawah meja kelas yang kokoh sambil memegang kakinya',
            isCorrect: true,
            feedback: 'Tepat sekali! Meja melindungi kepala dan organ vital Anda dari bahaya benda jatuh dan reruntuhan plafon.',
            xp: 50
          },
          {
            id: 'opt_stand_window',
            label: 'Berdiri di dekat jendela kaca untuk melihat apa yang terjadi di luar',
            isCorrect: false,
            feedback: 'Sangat Berbahaya! Getaran gempa dapat memecahkan kaca jendela dan melontarkan serpihan tajam ke arah Anda.',
            xp: 0
          }
        ]
      },
      {
        id: 'eq_step_2',
        instruction: 'Guncangan utama telah berhenti, namun tercium bau gas dan kabel korsleting. Apa tindakan evakuasi selanjutnya?',
        timeLimit: 15,
        options: [
          {
            id: 'opt_lift',
            label: 'Cepat gunakan lift sekolah agar sampai ke lantai dasar dalam hitungan detik',
            isCorrect: false,
            feedback: 'Bahaya Maut! Gempa susulan atau korsleting dapat memutus aliran listrik seketika dan menjebak Anda di dalam kotak lift.',
            xp: 0
          },
          {
            id: 'opt_stairs_orderly',
            label: 'Keluar lewat tangga darurat secara tertib, lindungi kepala dengan tas, menuju titik kumpul di lapangan',
            isCorrect: true,
            feedback: 'Luar Biasa! Menggunakan tangga darurat dan melindungi kepala adalah protokol evakuasi internasional yang benar.',
            xp: 50
          },
          {
            id: 'opt_stay_inside',
            label: 'Tetap berada di bawah meja dan menunggu sampai pelajaran berakhir',
            isCorrect: false,
            feedback: 'Kurang tepat. Setelah guncangan mereda, gedung sekolah harus segera dikosongkan untuk menghindari gempa susulan.',
            xp: 0
          }
        ]
      }
    ]
  },

  TSUNAMI: {
    disasterId: 'TSUNAMI',
    title: 'Simulasi Tsunami: Pesisir Pantai Surut Mendadak',
    environmentName: 'Desa Pesisir & Garis Pantai',
    briefing: 'Setelah gempa kuat 15 menit yang lalu, tiba-tiba air laut di pantai surut sejauh 500 meter. Ikan-ikan terkapar di atas pasir karang dan terdengar suara gemuruh dari cakrawala samudera!',
    objective: 'Selamatkan warga desa dan tentukan arah evakuasi sebelum gelombang pertama tiba!',
    hazardLevel: 'Awas',
    steps: [
      {
        id: 'ts_step_1',
        instruction: 'Melihat air laut surut drastis dan ikan bertebaran, apa yang harus Anda lakukan?',
        timeLimit: 10,
        options: [
          {
            id: 'opt_fish',
            label: 'Segera lari ke pasir pantai membawa ember untuk mengambil ikan segar',
            isCorrect: false,
            feedback: 'Fatal! Ini adalah kesalahan yang merenggut banyak korban jiwa pada Tsunami Aceh 2004. Air surut adalah tanda gelombang raksasa akan datang!',
            xp: 0
          },
          {
            id: 'opt_shout_run',
            label: 'Bunyikan peluit peringatan dan lari secepatnya menjauhi pantai menuju bukit setinggi >20 meter',
            isCorrect: true,
            feedback: 'Pilihan Sempurna! Air surut mendadak adalah alarm alam pasti bahwa tsunami dahsyat sedang melaju kencang menuju daratan.',
            xp: 50
          },
          {
            id: 'opt_car_pack',
            label: 'Pulang ke rumah dulu untuk mengepak TV dan kulkas ke dalam mobil',
            isCorrect: false,
            feedback: 'Sangat Berisiko! Harta benda bisa dicari kembali, tetapi nyawa Anda tidak. Menunda evakuasi pesisir berarti ancaman kematian.',
            xp: 0
          }
        ]
      },
      {
        id: 'ts_step_2',
        instruction: 'Anda telah mencapai puncak bukit aman. Gelombang pertama setinggi 8 meter baru saja menghantam pesisir dan surut kembali. Apa yang harus Anda lakukan?',
        timeLimit: 12,
        options: [
          {
            id: 'opt_return_beach',
            label: 'Langsung turun kembali ke pantai karena air sudah terlihat surut kembali',
            isCorrect: false,
            feedback: 'Bahaya Ekstrem! Gelombang tsunami biasanya datang beruntun dalam 3 hingga 5 gelombang, dan gelombang berikutnya sering kali jauh lebih besar!',
            xp: 0
          },
          {
            id: 'opt_stay_high',
            label: 'Tetap bertahan di puncak bukit aman sampai ada pengumuman resmi BMKG bahwa ancaman tsunami berakhir',
            isCorrect: true,
            feedback: 'Pintar! Jangan pernah turun ke pantai sebelum status ancaman tsunami resmi dicabut oleh BMKG/BPBD.',
            xp: 50
          }
        ]
      }
    ]
  },

  VOLCANO: {
    disasterId: 'VOLCANO',
    title: 'Simulasi Erupsi: Status AWAS Gunung Api',
    environmentName: 'Pemukiman Kaki Gunung Merapi',
    briefing: 'PVMBG menaikkan status gunung menjadi LEVEL IV (AWAS). Kolom abu setinggi 3.000 meter membubung ke angkasa dan kubah lava pijar mulai runtuh memicu luncuran awan panas!',
    objective: 'Lakukan evakuasi dari Kawasan Rawan Bencana (KRB III) dengan perlindungan pernapasan yang tepat!',
    hazardLevel: 'Awas',
    steps: [
      {
        id: 'vol_step_1',
        instruction: 'Abu vulkanik tebal mulai turun seperti hujan lebat dan berbau belerang menyengat. Bagaimana Anda melindungi diri?',
        timeLimit: 12,
        options: [
          {
            id: 'opt_mask_goggles',
            label: 'Kenakan masker N95/kain basah, kacamata pelindung (goggles), dan baju berlengan panjang',
            isCorrect: true,
            feedback: 'Tepat Sekali! Abu vulkanik tersusun dari serpihan kaca silika tajam mikro yang berbahaya bagi paru-paru dan kornea mata.',
            xp: 50
          },
          {
            id: 'opt_no_protection',
            label: 'Keluar rumah menghirup udara bebas sambil mengambil foto selfie letusan gunung',
            isCorrect: false,
            feedback: 'Bahaya Serius! Menghirup abu vulkanik dapat menyebabkan kerusakan paru-paru permanen dan iritasi saluran pernapasan parah.',
            xp: 0
          }
        ]
      },
      {
        id: 'vol_step_2',
        instruction: 'Sirene evakuasi berbunyi. Ada dua jalur jalan: Jalur A melintasi jembatan sungai aliran lahar, Jalur B melintasi jalan punggung bukit menjauhi sungai. Pilih rute mana?',
        timeLimit: 15,
        options: [
          {
            id: 'opt_route_river',
            label: 'Pilih Jalur A karena lebih dekat walaupun berada di lembah sungai aliran lahar',
            isCorrect: false,
            feedback: 'Sangat Berbahaya! Lembah sungai adalah jalur utama luncuran awan panas dan banjir lahar dingin yang berkecepatan ratusan km/jam.',
            xp: 0
          },
          {
            id: 'opt_route_ridge',
            label: 'Pilih Jalur B melewati jalan punggung perbukitan yang menjauhi alur lembah sungai lahar',
            isCorrect: true,
            feedback: 'Keputusan Cerdas! Menjauhi lembah sungai adalah prinsip dasar keselamatan evakuasi bencana vulkanik.',
            xp: 50
          }
        ]
      }
    ]
  },

  FLOOD: {
    disasterId: 'FLOOD',
    title: 'Simulasi Banjir: Air Sungai Meluap Masuk Rumah',
    environmentName: 'Pemukiman Padat Kota',
    briefing: 'Hujan badai selama 8 jam nonstop membuat sungai meluap. Air cokelat setinggi 40 cm mulai merembes masuk melalui celah pintu rumah!',
    objective: 'Amankan bahaya kelistrikan dan lakukan evakuasi vertikal dengan aman!',
    hazardLevel: 'Siaga',
    steps: [
      {
        id: 'fl_step_1',
        instruction: 'Air mulai menggenangi lantai ruang tamu mendekati stop kontak dinding. Apa tindakan darurat PERTAMA Anda?',
        timeLimit: 12,
        options: [
          {
            id: 'opt_turn_off_mcb',
            label: 'Segera matikan sakelar meteran listrik utama (MCB) rumah dengan tangan kering',
            isCorrect: true,
            feedback: 'Sangat Tepat! Air adalah konduktor listrik yang baik. Mematikan MCB mencegah risiko tewas tersengat listrik (electrocution).',
            xp: 50
          },
          {
            id: 'opt_turn_on_tv',
            label: 'Nyalakan televisi untuk menonton siaran berita banjir',
            isCorrect: false,
            feedback: 'Sangat Berbahaya! Mengoperasikan alat elektronik saat air mulai merendam stop kontak berisiko tinggi sengatan listrik mematikan.',
            xp: 0
          }
        ]
      },
      {
        id: 'fl_step_2',
        instruction: 'Air terus naik hingga setinggi 1,5 meter di luar rumah dan arusnya cukup deras. Bagaimana Anda menyelamatkan diri?',
        timeLimit: 15,
        options: [
          {
            id: 'opt_swim_current',
            label: 'Berenang menyeberangi arus banjir jalanan yang deras tanpa pelampung',
            isCorrect: false,
            feedback: 'Bahaya Besar! Arus banjir membawa seng, paku, kayu tajam dan dapat menyedot Anda ke dalam gorong-gorong yang terbuka.',
            xp: 0
          },
          {
            id: 'opt_vertical_evac',
            label: 'Evakuasi vertikal ke lantai 2 / atap rumah sambil membawa peluit dan senter untuk memberi sinyal ke perahu karet tim SAR',
            isCorrect: true,
            feedback: 'Taktik Sempurna! Evakuasi vertikal adalah cara teraman menunggu perahu evakuasi BNPB/Basarnas tiba.',
            xp: 50
          }
        ]
      }
    ]
  },

  LANDSLIDE: {
    disasterId: 'LANDSLIDE',
    title: 'Simulasi Longsor: Rekahan Tanah di Belakang Rumah',
    environmentName: 'Lereng Bukit Pemukiman',
    briefing: 'Setelah 3 hari hujan lebat, tebing di belakang rumah tampak mengeluarkan air keruh dan terlihat retakan tanah berbentuk tapal kuda selebar 10 cm!',
    objective: 'Kenali tanda kegagalan lereng dan lakukan evakuasi dini ke zona stabil!',
    hazardLevel: 'Siaga',
    steps: [
      {
        id: 'ls_step_1',
        instruction: 'Melihat rekahan tanah melebar dan tiang listrik di tebing mulai condong miring, apa yang harus Anda lakukan?',
        timeLimit: 12,
        options: [
          {
            id: 'opt_inspect_close',
            label: 'Mendekat ke bibir tebing untuk melihat seberapa dalam retakannya',
            isCorrect: false,
            feedback: 'Jangan Lakukan Ini! Berdiri di atas rekahan tanah dapat memicu runtuhnya tebing seketika dengan Anda terbawa ke bawah.',
            xp: 0
          },
          {
            id: 'opt_evacuate_early',
            label: 'Peringatkan seluruh anggota keluarga dan segera evakuasi meninggalkan lereng menuju dataran aman',
            isCorrect: true,
            feedback: 'Tepat Sekali! Retakan tanah dan tiang miring adalah tanda pasti lereng telah kehilangan stabilitas dan siap runtuh kapan saja.',
            xp: 50
          }
        ]
      },
      {
        id: 'ls_step_2',
        instruction: 'Terdengar suara gemuruh keras dan material tanah longsor mulai meluncur deras menuruni lereng! Ke arah mana Anda harus berlari?',
        timeLimit: 10,
        options: [
          {
            id: 'opt_run_downstream',
            label: 'Berlari lurus ke bawah searah dengan arah jatuhnya longsoran tanah',
            isCorrect: false,
            feedback: 'Salah Fatal! Kecepatan luncuran tanah longsor jauh lebih cepat daripada lari manusia (bisa melebihi 50 km/jam).',
            xp: 0
          },
          {
            id: 'opt_run_perpendicular',
            label: 'Berlari menyamping (tegak lurus) keluar dari jalur lintasan luncuran longsor',
            isCorrect: true,
            feedback: 'Penyelamatan Hebat! Berlari menyamping menjauhi alur luncuran adalah satu-satunya cara menghindari tertimbun material longsor.',
            xp: 50
          }
        ]
      }
    ]
  },

  TORNADO: {
    disasterId: 'TORNADO',
    title: 'Simulasi Puting Beliung: Pusaran Angin Mendekat',
    environmentName: 'Pemukiman Terbuka & Jalanan',
    briefing: 'Langit mendadak gelap gulita oleh awan Cumulonimbus. Corong angin raksasa berputar kencang dari langit mendekati rumah Anda, menerbangkan atap-atap seng!',
    objective: 'Cari tempat perlindungan paling kokoh dan hindari serpihan pecahan proyektil!',
    hazardLevel: 'Awas',
    steps: [
      {
        id: 'to_step_1',
        instruction: 'Anda sedang berada di dalam rumah dan melihat pusaran angin puting beliung semakin dekat. Ruangan mana yang paling aman?',
        timeLimit: 10,
        options: [
          {
            id: 'opt_balcony_window',
            label: 'Balkon lantai atas dekat jendela kaca besar untuk merekam video badai',
            isCorrect: false,
            feedback: 'Sangat Berbahaya! Jendela kaca akan hancur lebur oleh tekanan angin dan serpihannya menjadi proyektil tajam mematikan.',
            xp: 0
          },
          {
            id: 'opt_inner_room',
            label: 'Ruangan paling dalam di lantai dasar tanpa jendela (seperti kamar mandi atau kolong tangga beton)',
            isCorrect: true,
            feedback: 'Sempurna! Ruangan tengah berdinding tebal tanpa jendela memberikan perlindungan terbaik dari terpaan angin dan puing beterbangan.',
            xp: 50
          }
        ]
      },
      {
        id: 'to_step_2',
        instruction: 'Saat berada di ruangan aman tanpa jendela, bagaimana posisi tubuh yang paling direkomendasikan?',
        timeLimit: 12,
        options: [
          {
            id: 'opt_crouch_protect',
            label: 'Tiarap di lantai, merunduk dan lindungi kepala serta leher dengan bantal, kasur busa, atau lengan tangan',
            isCorrect: true,
            feedback: 'Luar Biasa! Menunduk dan melindungi kepala mencegah cedera parah akibat benturan puing atap yang runtuh.',
            xp: 50
          },
          {
            id: 'opt_open_doors',
            label: 'Berdiri di pintu utama sambil menahan gagang pintu agar tidak terbuka ditiup angin',
            isCorrect: false,
            feedback: 'Bahaya! Tekanan angin puting beliung ribuan kilogram per meter persegi dapat melempar pintu beserta tubuh Anda.',
            xp: 0
          }
        ]
      }
    ]
  }
};
