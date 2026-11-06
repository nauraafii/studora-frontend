import type { Agent, Document, Note, Quiz, StudyNotification, StudySession, Task } from "@/lib/types";

export const UPLOAD_LIMIT_MB = 50;
export const SUPPORTED_UPLOAD_TYPES = ["PDF", "DOCX", "PPTX", "TXT"] as const;

export const materials: Document[] = [
  { id: "doc-1", name: "Jaringan Komputer: TCP dan UDP", course: "Jaringan Komputer", format: "TXT", sizeMb: 0, addedAt: "Paket contoh" },
  { id: "doc-2", name: "Sistem Basis Data: Normalisasi", course: "Sistem Basis Data", format: "TXT", sizeMb: 0, addedAt: "Paket contoh" },
  { id: "doc-3", name: "Sistem Basis Data: Diagram ER", course: "Sistem Basis Data", format: "TXT", sizeMb: 0, addedAt: "Paket contoh" },
  { id: "doc-4", name: "Rekayasa Perangkat Lunak: Kebutuhan Sistem", course: "Rekayasa Perangkat Lunak", format: "TXT", sizeMb: 0, addedAt: "Paket contoh" },
  { id: "doc-5", name: "Jaringan Komputer: Pengalamatan", course: "Jaringan Komputer", format: "TXT", sizeMb: 0, addedAt: "Paket contoh" }
];

export const tasks: Task[] = [
  { id: "task-1", title: "Kumpulkan laporan lab Jaringan Komputer", course: "Lab 2 · Unggah ke portal mata kuliah", dueDate: null, dueInDays: 1, status: "open", priority: "high" },
  { id: "task-2", title: "Selesaikan kuis Dasar TCP & UDP", course: "Jaringan Komputer", dueDate: null, dueInDays: 1, status: "open", priority: "medium" },
  { id: "task-3", title: "Baca ringkasan Normalisasi Basis Data", course: "Sistem Basis Data", dueDate: null, dueInDays: 2, status: "open", priority: "medium" },
  { id: "task-4", title: "Revisi subnetting dan pengalamatan", course: "Dari Perencana Belajar · Hari 2", dueDate: null, dueInDays: 2, status: "open", priority: "medium" },
  { id: "task-5", title: "Lembar kerja normalisasi Sistem Basis Data", course: "Lembar Kerja 4 · Kumpulkan sebagai PDF", dueDate: null, dueInDays: 5, status: "open", priority: "low" },
  { id: "task-6", title: "Baca slide Pertemuan 03 Jaringan Komputer", course: "Selesai sebelum alur kerja AI berjalan", dueDate: null, dueInDays: -10, status: "done", priority: "low" }
];

export const agents: Agent[] = [
  { id: "research", name: "Agen Riset", description: "Membaca berkas dan menemukan bagian utama.", enabled: true },
  { id: "analysis", name: "Agen Analisis", description: "Menemukan konsep kunci dan keterkaitannya.", enabled: true },
  { id: "tutor", name: "Agen Asisten Belajar", description: "Menulis ringkasan dan catatan belajar singkat.", enabled: true },
  { id: "quiz", name: "Agen Pembuat Kuis", description: "Menulis soal latihan beserta kunci jawaban.", enabled: true },
  { id: "planner", name: "Agen Perencana", description: "Menyusun jadwal revisi sesuai waktu Anda.", enabled: true },
  { id: "review", name: "Agen Tinjauan Kualitas", description: "Memeriksa hasil terhadap sumber Anda.", enabled: true, required: true }
];

export const quizzes: Quiz[] = [
  {
    id: "quiz-1",
    title: "Dasar TCP & UDP",
    source: "Jaringan Komputer: TCP dan UDP",
    linkedNoteId: "note-osi",
    questions: [{
      id: "tcp-reliability",
      prompt: "Protokol mana yang menyediakan pengiriman data berurutan dan andal?",
      options: ["TCP", "UDP", "IP", "ARP"],
      correctIndex: 0,
      explanation: "TCP mengatur pengiriman data secara andal dan berurutan. UDP tidak menyediakan jaminan yang sama.",
    }, {
      id: "udp-use",
      prompt: "Kapan UDP sering dipilih daripada TCP?",
      options: ["Saat latensi rendah lebih penting dan aplikasi dapat menangani kehilangan paket", "Saat setiap paket wajib dikirim ulang oleh protokol", "Saat koneksi harus memiliki sesi awal", "Saat data harus selalu berurutan"],
      correctIndex: 0,
      explanation: "UDP memiliki overhead lebih kecil dan cocok untuk kebutuhan waktu nyata ketika aplikasi dapat menoleransi atau menangani kehilangan paket.",
    }, {
      id: "osi-transport",
      prompt: "Pada model OSI, lapisan apa yang berkaitan dengan komunikasi end-to-end?",
      options: ["Fisik", "Data link", "Transport", "Presentasi"],
      correctIndex: 2,
      explanation: "Lapisan transport menangani komunikasi end-to-end antara proses pada host yang berbeda.",
    }],
  },
  {
    id: "quiz-2",
    title: "Normalisasi Basis Data",
    source: "Sistem Basis Data: Normalisasi",
    linkedNoteId: "note-normalisasi",
    questions: [{
      id: "normalisasi-tujuan",
      prompt: "Apa tujuan utama normalisasi basis data?",
      options: ["Mengurangi redundansi dan anomali data", "Memperbesar ukuran tabel", "Menghapus seluruh relasi", "Mengganti kunci primer dengan teks"],
      correctIndex: 0,
      explanation: "Normalisasi membantu mengurangi pengulangan data dan anomali saat data ditambah, diubah, atau dihapus.",
    }, {
      id: "normalisasi-key",
      prompt: "Apa fungsi kunci primer pada sebuah tabel?",
      options: ["Mengidentifikasi setiap baris secara unik", "Mengurutkan tabel secara visual", "Menghapus semua relasi", "Menyimpan salinan seluruh data"],
      correctIndex: 0,
      explanation: "Kunci primer memberi identitas unik untuk setiap baris dan mendukung pembentukan relasi yang jelas.",
    }, {
      id: "normalisasi-anomali",
      prompt: "Contoh masalah yang ingin dikurangi oleh normalisasi adalah?",
      options: ["Anomali pembaruan akibat data berulang", "Koneksi jaringan lambat", "Resolusi layar rendah", "Perubahan warna tabel"],
      correctIndex: 0,
      explanation: "Data yang berulang dapat menyebabkan nilai tidak konsisten ketika hanya sebagian salinan diperbarui.",
    }],
  },
  {
    id: "quiz-3",
    title: "Rekayasa Perangkat Lunak: Minggu 05",
    source: "Rekayasa Perangkat Lunak: Kebutuhan Sistem",
    linkedNoteId: "note-rpl",
    questions: [{
      id: "rpl-requirements",
      prompt: "Apa manfaat utama mendokumentasikan kebutuhan perangkat lunak?",
      options: ["Menyamakan pemahaman tentang kebutuhan sistem", "Menghilangkan kebutuhan pengujian", "Menentukan warna antarmuka saja", "Menggantikan komunikasi dengan pengguna"],
      correctIndex: 0,
      explanation: "Dokumentasi kebutuhan membantu tim dan pemangku kepentingan menyepakati perilaku sistem yang perlu dibangun.",
    }, {
      id: "rpl-validation",
      prompt: "Mengapa kebutuhan perlu divalidasi bersama pemangku kepentingan?",
      options: ["Untuk memastikan kebutuhan sesuai masalah dan harapan pengguna", "Agar tahap pengujian dihapus", "Untuk memilih ikon aplikasi", "Agar dokumentasi tidak perlu diperbarui"],
      correctIndex: 0,
      explanation: "Validasi membantu menemukan salah tafsir sebelum kebutuhan digunakan sebagai dasar desain dan pengujian.",
    }, {
      id: "rpl-constraint",
      prompt: "Mana yang merupakan contoh batasan sistem?",
      options: ["Aplikasi harus tetap dapat digunakan pada layar ponsel", "Pengguna ingin melihat ringkasan", "Mahasiswa ingin mengunggah materi", "Admin ingin mencari laporan"],
      correctIndex: 0,
      explanation: "Batasan menjelaskan syarat atau pembatas yang harus dipenuhi sistem, seperti dukungan perangkat.",
    }],
  },
];

export const notes: Note[] = [
  { id: "note-osi", title: "Model OSI dan Lapisan TCP/IP", source: "Jaringan Komputer: TCP dan UDP", kind: "Ringkasan", tone: "blue", body: "Model OSI membagi komunikasi jaringan menjadi tujuh lapisan. Lapisan transport membantu komunikasi end-to-end antar-host. TCP menyediakan pengiriman yang andal dan berurutan, sedangkan UDP memiliki overhead lebih rendah tanpa jaminan pengiriman yang sama.", relatedQuizId: "quiz-1" },
  { id: "note-normalisasi", title: "Ringkasan Normalisasi Basis Data", source: "Sistem Basis Data: Normalisasi", kind: "Ringkasan", tone: "blue", body: "Normalisasi menyusun data ke dalam tabel yang saling berhubungan untuk mengurangi pengulangan dan anomali. Bentuk normal diterapkan bertahap dengan memperhatikan ketergantungan antaratribut dan kunci tabel.", relatedQuizId: "quiz-2" },
  { id: "note-rpl", title: "Catatan Kebutuhan Perangkat Lunak", source: "Rekayasa Perangkat Lunak: Kebutuhan Sistem", kind: "Catatan", tone: "green", body: "Kebutuhan perangkat lunak menjelaskan layanan yang diperlukan pengguna dan batasan sistem. Tim meninjau serta memvalidasi kebutuhan bersama pemangku kepentingan sebelum menjadikannya dasar desain dan pengujian.", relatedQuizId: "quiz-3" },
  { id: "note-er", title: "Dasar Diagram Entitas Relasi", source: "Sistem Basis Data: Diagram ER", kind: "Catatan", tone: "green", body: "Diagram entitas relasi menggambarkan entitas, atribut, dan hubungan dalam domain data. Kardinalitas membantu menjelaskan berapa banyak instans dari satu entitas dapat terhubung dengan entitas lain. Model konseptual ini ditinjau sebelum diubah menjadi tabel.", relatedQuizId: "" },
  { id: "note-jaringan-awal", title: "Pengalamatan dan Paket Jaringan", source: "Jaringan Komputer: Pengalamatan", kind: "Catatan", tone: "green", body: "Alamat IP digunakan untuk mengidentifikasi perangkat pada jaringan. Paket membawa data dan informasi pengarah agar dapat melewati beberapa perangkat menuju tujuan. Pembagian jaringan menjadi subnet membantu pengelolaan alamat dan lalu lintas.", relatedQuizId: "" },
];

export const studySessions: StudySession[] = [
  { id: "session-1", dayOffset: 0, startTime: "09:00", durationMinutes: 60, title: "Tinjau model OSI dan lapisan TCP/IP", detail: "Jaringan Komputer", type: "Revisi", contentId: "note-osi" },
  { id: "session-2", dayOffset: 0, startTime: "11:00", durationMinutes: 45, title: "Latihan Dasar TCP & UDP", detail: "Jaringan Komputer", type: "Kuis", contentId: "quiz-1" },
  { id: "session-3", dayOffset: 0, startTime: "16:00", durationMinutes: 15, title: "Tinjau kembali konsep kunci", detail: "Jaringan Komputer", type: "Revisi", contentId: "note-osi" },
  { id: "session-4", dayOffset: 1, startTime: "09:00", durationMinutes: 60, title: "Tinjau normalisasi basis data", detail: "Sistem Basis Data", type: "Revisi", contentId: "note-normalisasi" },
  { id: "session-5", dayOffset: 1, startTime: "14:00", durationMinutes: 60, title: "Latihan normalisasi basis data", detail: "Sistem Basis Data", type: "Kuis", contentId: "quiz-2" },
  { id: "session-6", dayOffset: 2, startTime: "09:00", durationMinutes: 60, title: "Baca catatan kebutuhan perangkat lunak", detail: "Rekayasa Perangkat Lunak", type: "Revisi", contentId: "note-rpl" },
  { id: "session-7", dayOffset: 2, startTime: "14:00", durationMinutes: 60, title: "Latihan kebutuhan perangkat lunak", detail: "Rekayasa Perangkat Lunak", type: "Kuis", contentId: "quiz-3" },
];

export const DAILY_STUDY_LIMIT_MINUTES = 120;

export const notifications: StudyNotification[] = [
  { id: "n1", title: "Tenggat tugas mendekat", detail: "Kumpulkan laporan lab Jaringan Komputer.", time: "Waktu contoh", kind: "task", unread: true, actionLabel: "Lihat tugas", href: "/tugas-tenggat?task=task-1" },
  { id: "n2", title: "Sesi belajar direncanakan", detail: "Tinjau model OSI dan lapisan TCP/IP.", time: "Waktu contoh", kind: "study", unread: true, actionLabel: "Lihat rencana", href: "/perencana-belajar?day=0" },
  { id: "n3", title: "Materi contoh tersedia", detail: "Pilih materi untuk menyusun draf belajar.", time: "Waktu contoh", kind: "study", unread: false, actionLabel: "Buka pustaka", href: "/pustaka-materi" },
];

export const recentMaterials = materials.slice(0, 2);
