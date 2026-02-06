interface FlameIconProps {
  className?: string;
}

export function FlameIcon({ className = 'w-5 h-5' }: FlameIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 23c-4.97 0-8-3.03-8-7 0-2.89 1.58-5.2 3.12-7.24.98-1.29 2-2.62 2.65-4.12.22-.5.74-.84 1.3-.76.55.08.97.48 1.1 1.02.36 1.5 1.1 2.81 2.06 3.93C16.22 11.2 18 13.56 18 16c0 3.97-3.03 7-6 7zm-4-7c0 2.76 1.79 5 4 5s4-2.24 4-5c0-1.67-1.22-3.44-2.88-5.36-.5-.58-.97-1.2-1.37-1.87-.57.88-1.22 1.66-1.87 2.44C8.52 13.86 8 15.15 8 16z" />
    </svg>
  );
}
