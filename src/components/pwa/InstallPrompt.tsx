import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('unreel-install-dismissed') === 'true'
  );
  const [isInstalled, setIsInstalled] = useState(() =>
    window.matchMedia('(display-mode: standalone)').matches
  );

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const mq = window.matchMedia('(display-mode: standalone)');
    const mqHandler = (e: MediaQueryListEvent) => setIsInstalled(e.matches);
    mq.addEventListener('change', mqHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      mq.removeEventListener('change', mqHandler);
    };
  }, []);

  if (!deferredPrompt || dismissed || isInstalled) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('unreel-install-dismissed', 'true');
    setDismissed(true);
  };

  return (
    <div className="card border-primary-500/30">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-bold text-lg text-text-primary">Install Unreel</div>
          <div className="text-sm text-text-muted mt-1">
            Add to your home screen for quick access
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={handleInstall}
            className="btn-primary text-sm px-4 py-2"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="text-text-muted hover:text-text-secondary transition-colors p-1"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
