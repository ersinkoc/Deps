import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ThemeProvider } from '@/hooks/useTheme';

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const content = children || <Outlet />;
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="min-h-[calc(100vh-8rem)]">
          {content}
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
