import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { LessonBuilder } from './components/LessonBuilder';
import { DigitalIntegrationView } from './components/DigitalIntegrationView';
import { SettingsModal } from './components/SettingsModal';
import { LessonPlan } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'integrate' | 'dashboard' | 'builder'>('integrate');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMandatoryKey, setIsMandatoryKey] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('gemini_api_key');
    if (!key || !key.trim()) {
      setIsMandatoryKey(true);
      setIsSettingsOpen(true);
    }
  }, []);

  const handleCreateNew = () => {
    setActiveLessonId(null);
    setCurrentView('builder');
  };

  const handleEdit = (id: string) => {
    setActiveLessonId(id);
    setCurrentView('builder');
  };

  const handleIntegrationComplete = (enrichedPlan: LessonPlan) => {
    setActiveLessonId(enrichedPlan.id);
    setCurrentView('builder');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      {/* Header Bar */}
      <Header onOpenSettings={() => { setIsMandatoryKey(false); setIsSettingsOpen(true); }} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          currentView={currentView} 
          onViewChange={setCurrentView} 
          onCreateNew={handleCreateNew}
          onOpenSettings={() => { setIsMandatoryKey(false); setIsSettingsOpen(true); }}
        />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {currentView === 'integrate' && (
            <DigitalIntegrationView 
              onIntegrationComplete={handleIntegrationComplete}
              onOpenSettings={() => { setIsMandatoryKey(false); setIsSettingsOpen(true); }}
            />
          )}

          {currentView === 'dashboard' && (
            <Dashboard 
              onEdit={handleEdit} 
              onCreateNew={() => setCurrentView('integrate')} 
            />
          )}

          {currentView === 'builder' && (
            <LessonBuilder 
              lessonId={activeLessonId} 
              onBack={() => setCurrentView('dashboard')} 
              onOpenSettings={() => { setIsMandatoryKey(false); setIsSettingsOpen(true); }}
            />
          )}
        </main>
      </div>

      {/* Footer Copyright */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-2 px-6 border-t border-slate-800 text-center shrink-0 z-20 flex items-center justify-center gap-1.5 shadow-inner">
        <span className="text-slate-300 font-medium">
          Bản quyền thuộc về Thầy Dương Bảo Quốc . Tổ Toán - Tin, Trường THPT Khánh Lâm - Cà Mau
        </span>
      </footer>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        isMandatory={isMandatoryKey}
        onClose={() => {
          setIsSettingsOpen(false);
          setIsMandatoryKey(false);
        }} 
        onDataRestored={() => {
          setIsSettingsOpen(false);
          setIsMandatoryKey(false);
          setCurrentView('dashboard');
        }}
      />
    </div>
  );
}
