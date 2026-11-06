import Link from "next/link";
import { PageHeading } from "@/components/shared/PageHeading";
import { Card } from "@/components/ui/card";
import { UPLOAD_LIMIT_MB } from "@/lib/mock-data";

const faqs = [
  ["Bagaimana cara menambahkan materi?", `Buka Pustaka Materi, isi mata kuliah jika perlu, lalu pilih berkas PDF, DOCX, PPTX, atau TXT hingga ${UPLOAD_LIMIT_MB} MB. Berkas disimpan di browser ini dan tidak dikirim ke server.`],
  ["Di mana berkas dapat dibuka?", "PDF dan TXT dapat dibuka dari Pustaka. DOCX dan PPTX dapat diunduh kembali untuk dibuka dengan aplikasi yang mendukungnya."],
  ["Apakah AI sudah membuat ringkasan dan kuis?", "Belum. Ruang Kerja menyimpan konfigurasi draf. Catatan pribadi ditulis sendiri, sedangkan kuis pada paket contoh disusun sebelumnya."],
  ["Bagaimana menyusun rencana belajar?", "Buka Perencana Belajar, tambahkan sesi, pilih tanggal dan durasi, lalu tautkan ke catatan atau kuis jika ada. Sesi dapat diubah dan ditandai selesai."],
  ["Apakah data tersinkron antarperangkat?", "Belum. Data dan berkas hanya tersimpan di browser pada perangkat ini. Menghapus data situs dapat menghapus pekerjaan Anda."],
];

export function HelpScreen() {
  return <main className="page-content">
    <PageHeading title="Bantuan & Dukungan" description="Panduan singkat memakai ruang belajar lokal Studora." />
    <div className="content-aside-grid"><Card><h2 className="card-title">Pertanyaan yang sering diajukan</h2><div className="faq-list">{faqs.map(([question, answer]) => <details className="faq-item" key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div></Card>
      <aside className="stack"><Card><h2 className="card-title">Mulai belajar</h2><p className="muted">Tambahkan materi, tulis catatan, lalu atur sesi belajar Anda.</p><Link className="text-link" href="/pustaka-materi">Buka Pustaka Materi</Link></Card><div className="notice notice-blue">Layanan dukungan langsung belum tersedia. Formulir pesan akan hadir setelah layanan backend terhubung.</div></aside>
    </div>
  </main>;
}
