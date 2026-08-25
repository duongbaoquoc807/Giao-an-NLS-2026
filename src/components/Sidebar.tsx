import { LayoutDashboard, FileText, Settings, BookOpen } from 'lucide-react';

interface SidebarProps {
  currentView: 'dashboard' | 'builder';
  onViewChange: (view: 'dashboard' | 'builder') => void;
  onCreateNew: () => void;
  onOpenSettings: () => void;
}

export function Sidebar({ currentView, onViewChange, onCreateNew, onOpenSettings }: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3 text-white font-bold text-lg border-b border-slate-800">
        <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-orange-400 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/20">
          <BookOpen size={22} />
        </div>
        <div>
          <span className="block leading-tight font-extrabold tracking-tight">EduPlan AI</span>
          <span className="text-[10px] text-orange-400 font-semibold tracking-wider uppercase block">CV 5512 • Năng lực số</span>
        </div>
      </div>

      <div className="p-4 flex-1 space-y-2">
        <button
          onClick={() => onViewChange('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
            currentView === 'dashboard' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50' : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <LayoutDashboard size={18} />
          <span>Tổng quan</span>
        </button>

        <button
          onClick={onCreateNew}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
            currentView === 'builder' ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50' : 'hover:bg-slate-800 hover:text-white'
          }`}
        >
          <FileText size={18} />
          <span>Soạn giáo án 5512</span>
        </button>
      </div>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <button 
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-all text-slate-400 text-sm font-medium"
        >
          <Settings size={18} />
          <span>Cài đặt & API Key</span>
        </button>
      </div>
    </aside>
  );
}
