import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenText, LockKeyhole } from "lucide-react";

export default function LoginPage() {
  return <main className="login-shell">
    <section className="card login-card">
      <Link href="/" className="brand"><span className="brand-mark"><BookOpenText size={19} strokeWidth={2} /></span><span className="brand-lockup"><strong>Studora</strong><small>AI Study Partner</small></span></Link>
      <span className="login-eyebrow">Akses akun</span>
      <h1>Belajar sekarang, akun menyusul.</h1>
      <p className="muted login-description">Akun dengan nama pengguna, kata sandi, dan email pribadi sedang disiapkan. Saat ini data belajar tersimpan di browser pada perangkat ini.</p>
      <div className="notice notice-blue"><LockKeyhole size={17} aria-hidden="true" />Formulir masuk belum tersedia karena layanan autentikasi belum terhubung.</div>
      <Link className="button button-primary full-width" href="/">Lanjutkan ke ruang belajar lokal<ArrowRight size={16} aria-hidden="true" /></Link>
    </section>
    <p className="login-footnote">Hindari menyimpan data penting hanya di browser ini sampai sinkronisasi akun tersedia.</p>
  </main>;
}

export const metadata: Metadata = { title: "Akses akun" };
