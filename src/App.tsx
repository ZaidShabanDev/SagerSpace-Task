// App.tsx
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useState, type JSX } from 'react';
import { Header } from './components/layout/header';
import HeroSection from './components/layout/hero-section';
import { MapComponent } from './components/MapComponent';
import type { ViewType } from './types';

function App(): JSX.Element {
  const [activeView, setActiveView] = useState<ViewType>('dashboard'); // Default view

  const renderContent = (): JSX.Element => {
    switch (activeView) {
      case 'map':
        return <MapComponent />;
      default:
        return <HeroSection />;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar onViewChange={setActiveView} />
      <SidebarInset>
        <Header />
        {renderContent()}
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
