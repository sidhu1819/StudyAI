import { Search, Bell } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function TopNav() {
  const { user } = useContext(AuthContext);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="h-20 bg-bg-navbar/80 backdrop-blur-md border-b border-border-subtle sticky top-0 z-40 flex items-center justify-between px-8">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent-primary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search notes, flashcards, or ask AI (Cmd+K)" 
            className="w-full bg-white/5 border border-border-subtle rounded-xl py-2.5 pl-12 pr-4 text-sm text-text-primary focus:outline-none focus:border-accent-primary focus:bg-white/10 transition-all placeholder:text-text-secondary/60"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium text-text-secondary bg-white/10 border border-border-subtle rounded">⌘</kbd>
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium text-text-secondary bg-white/10 border border-border-subtle rounded">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 text-sm text-text-secondary">
          <span>{today}</span>
        </div>

        <button className="relative p-2 text-text-secondary hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-secondary rounded-full shadow-[0_0_8px_rgba(124,58,237,0.8)]"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-border-subtle">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white leading-tight">{user?.name || 'Student'}</p>
            <p className="text-xs text-text-secondary">Pro Plan</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-primary to-accent-secondary p-[2px]">
            <div className="w-full h-full rounded-full bg-bg-card flex items-center justify-center border-2 border-transparent">
              <span className="text-sm font-bold text-white">{user?.name?.charAt(0).toUpperCase() || 'S'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
