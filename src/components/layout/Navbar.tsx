import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

interface NavbarProps {
  currentStreak?: number;
  onNavigate: (view: string) => void;
  currentView: string;
}

export function Navbar({ currentStreak, onNavigate, currentView }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-card-border">
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
              <span>🔥</span>
            </div>
          )}

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
