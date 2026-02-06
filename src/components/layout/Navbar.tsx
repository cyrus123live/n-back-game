import { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { toggleTheme, getCurrentTheme } from '../../lib/theme';
import { FlameIcon } from '../icons/FlameIcon';

interface NavbarProps {
  currentStreak?: number;
  onNavigate: (view: string) => void;
  currentView: string;
}

export function Navbar({ currentStreak, onNavigate, currentView }: NavbarProps) {
  const [theme, setTheme] = useState(getCurrentTheme);

  const handleToggleTheme = () => {
    const next = toggleTheme();
    setTheme(next);
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-card-border">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="font-heading font-bold text-lg text-text-primary hover:text-primary-500 transition-colors"
          >
            Unreel
          </button>
          <div className="flex items-center gap-1">
            <SignedIn>
              <NavLink
                label="History"
                active={currentView === 'history'}
                onClick={() => onNavigate('history')}
              />
            </SignedIn>
            <NavLink
              label="Programs"
              active={currentView === 'programs'}
              onClick={() => onNavigate('programs')}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {currentStreak !== undefined && currentStreak > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <span className="text-[#c4a035] font-bold">{currentStreak}</span>
              <FlameIcon className="w-4 h-4 text-[#c4a035]" />
            </div>
          )}

          <button
            onClick={handleToggleTheme}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-secondary-surface transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm text-text-muted hover:text-text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary-surface">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
        ${active ? 'bg-secondary-surface text-text-primary' : 'text-text-muted hover:text-text-primary hover:bg-secondary-surface'}
      `}
    >
      {label}
    </button>
  );
}
