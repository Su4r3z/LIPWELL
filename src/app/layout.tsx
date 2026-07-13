import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import './globals.css';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'LipWell — Sua jornada contra o Lipedema',
  description: 'Acompanhe sintomas, alimentação e bem-estar com inteligência artificial personalizada para o lipedema. Diário de saúde humanizado e relatórios semanais com IA.',
  keywords: ['lipedema', 'diário de saúde', 'coach de saúde', 'anti-inflamatório', 'bem-estar feminino'],
  authors: [{ name: 'LipWell' }],
  creator: 'LipWell',
  applicationName: 'LipWell',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/icon-192.png',
  },
  openGraph: {
    title: 'LipWell — Sua jornada contra o Lipedema',
    description: 'Diário de saúde inteligente para mulheres com lipedema. Relatórios semanais com IA, acompanhamento nutricional e insights personalizados.',
    url: 'https://lipwell.app',
    siteName: 'LipWell',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: '/icon-512.png', width: 512, height: 512, alt: 'LipWell' }],
  },
  twitter: {
    card: 'summary',
    title: 'LipWell — Sua jornada contra o Lipedema',
    description: 'Diário de saúde inteligente para mulheres com lipedema.',
    images: ['/icon-512.png'],
  },
};

export const viewport = {
  themeColor: '#2D6A6A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased text-gray-800 dark:text-gray-200 bg-[#F8F9FA] dark:bg-dark`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
