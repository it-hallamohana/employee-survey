import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Employee Opinion Survey | TMT Group & Nawakara',
  description: 'Aplikasi Survei Keterlibatan Karyawan dan Evaluasi Lingkungan Kerja Internal',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased flex flex-col">
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
