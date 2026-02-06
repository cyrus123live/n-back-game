interface AchievementIconProps {
  category: 'sessions' | 'streaks' | 'performance' | 'combo' | 'level' | 'modes';
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  sessions: '#577fb5',
  streaks: '#c4a035',
  performance: '#538d4e',
  combo: '#8b6eae',
  level: '#c47a3e',
  modes: '#b85c4e',
};

export function AchievementIcon({ category, className = 'w-6 h-6' }: AchievementIconProps) {
  const color = CATEGORY_COLORS[category] || '#787774';

  switch (category) {
    case 'sessions':
      return (
        <svg className={className} viewBox="0 0 24 24" fill={color}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
        </svg>
      );
    case 'streaks':
      return (
        <svg className={className} viewBox="0 0 24 24" fill={color}>
          <path d="M12 23c-4.97 0-8-3.03-8-7 0-2.89 1.58-5.2 3.12-7.24.98-1.29 2-2.62 2.65-4.12.22-.5.74-.84 1.3-.76.55.08.97.48 1.1 1.02.36 1.5 1.1 2.81 2.06 3.93C16.22 11.2 18 13.56 18 16c0 3.97-3.03 7-6 7zm-4-7c0 2.76 1.79 5 4 5s4-2.24 4-5c0-1.67-1.22-3.44-2.88-5.36-.5-.58-.97-1.2-1.37-1.87-.57.88-1.22 1.66-1.87 2.44C8.52 13.86 8 15.15 8 16z" />
        </svg>
      );
    case 'performance':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" fill={color} stroke="none" />
        </svg>
      );
    case 'combo':
      return (
        <svg className={className} viewBox="0 0 24 24" fill={color}>
          <path d="M7 2v11h3v9l7-12h-4l4-8z" />
        </svg>
      );
    case 'level':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7 7 7M12 3v18" />
        </svg>
      );
    case 'modes':
      return (
        <svg className={className} viewBox="0 0 24 24" fill={color}>
          <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zm-9 9h7v7H4v-7zm9 0h7v7h-7v-7z" opacity={0.85} />
        </svg>
      );
    default:
      return null;
  }
}
