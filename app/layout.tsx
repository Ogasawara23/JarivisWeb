import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JARVIS — Just A Rather Very Intelligent System',
  description:
    'Assistente virtual IA futurista com voz, pesquisa em tempo real e conversação natural. Powered by OpenAI + Brave Search.',
  keywords: ['JARVIS', 'IA', 'assistente virtual', 'inteligência artificial', 'voz', 'chat'],
  authors: [{ name: 'JarvisWeb' }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%2307111f'/><path d='M16 6l2 8h8l-6.5 4.7 2.5 8L16 22l-6 4.7 2.5-8L6 14h8z' fill='%2300bfff'/></svg>",
  },
};

export const viewport: Viewport = {
  themeColor: '#07111f',
  width: 'device-width',
  initialScale: 1,
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
