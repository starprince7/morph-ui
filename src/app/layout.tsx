import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'MorphUI | The UI builds itself',
  description: 'AI-powered UI component generator that builds interfaces from API endpoints',
  keywords: 'AI, UI generator, API visualization, React components, Next.js',
  authors: [{ name: 'Starprince Team' }],
  openGraph: {
    title: 'MorphUI',
    description: 'The UI builds itself — just give it an API',
    type: 'website',
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
