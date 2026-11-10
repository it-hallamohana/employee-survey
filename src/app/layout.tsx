import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Employee Opinion Survey | Halla Mohana - Human Capital Division',
  description: 'Aplikasi Survei Keterlibatan Karyawan dan Evaluasi Lingkungan Kerja Internal PT Halla Mohana',
  icons: {
    icon: '/logo-halla-mohana.png',
    shortcut: '/logo-halla-mohana.png',
    apple: '/logo-halla-mohana.png',
  },
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
