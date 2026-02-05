import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

interface NavbarProps {
  currentStreak?: number;
  onNavigate: (view: string) => void;
  currentView: string;
}

export function Navbar({ currentStreak, onNavigate, currentView }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="font-bold text-lg hover:text-primary-400 transition-colors"
          >
            Unreel
          </button>
          <div className="hidden sm:flex items-center gap-1">
            <NavLink
              label="Play"
              active={currentView === 'settings'}
              onClick={() => onNavigate('settings')}
            />
            <NavLink
              label="History"
              active={currentView === 'history'}
              onClick={() => onNavigate('history')}
            />
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
              <span className="text-orange-400 font-bold">{currentStreak}</span>
              <span>🔥</span>
            </div>
          )}

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800">
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
        ${active ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'}
      `}
    >
      {label}
    </button>
  );
}
