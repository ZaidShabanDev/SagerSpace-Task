// App.tsx
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useState, type JSX } from 'react';
import { DroneSidebar } from './components/droneSidebar';
import { Header } from './components/layout/header';
import { MapComponent } from './components/mapComponent';
import type { ViewType } from './types';

function App(): JSX.Element {
  const [activeView, setActiveView] = useState<ViewType>('dashboard'); // Default view

  const renderContent = (): JSX.Element => {
    switch (activeView) {
      case 'map':
        return (
          <div className="flex h-[100%] w-full">
            <DroneSidebar />
            <div className="flex-1">
              <MapComponent />
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="bg-muted/50 aspect-video rounded-xl" />
              <div className="bg-muted/50 aspect-video rounded-xl" />
              <div className="bg-muted/50 aspect-video rounded-xl" />
            </div>
            <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
          </div>
        );
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
