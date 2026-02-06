import type { StimulusType } from '../../types';

interface StimulusIconProps {
  type: StimulusType;
  className?: string;
  style?: React.CSSProperties;
}

export function StimulusIcon({ type, className = 'w-5 h-5', style }: StimulusIconProps) {
  switch (type) {
    case 'position':
      return (
        <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="3" width="5" height="5" rx="1" />
          <rect x="10" y="3" width="5" height="5" rx="1" />
          <rect x="17" y="3" width="5" height="5" rx="1" />
          <rect x="3" y="10" width="5" height="5" rx="1" />
          <rect x="10" y="10" width="5" height="5" rx="1" />
          <rect x="17" y="10" width="5" height="5" rx="1" />
          <rect x="3" y="17" width="5" height="5" rx="1" />
          <rect x="10" y="17" width="5" height="5" rx="1" />
          <rect x="17" y="17" width="5" height="5" rx="1" />
        </svg>
      );
    case 'color':
      return (
        <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0L12 2.69z" />
        </svg>
      );
    case 'shape':
      return (
        <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="9" cy="15" r="5" />
          <path strokeLinejoin="round" d="M17 4l4 8H13l4-8z" />
        </svg>
      );
    case 'number':
      return (
        <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <path d="M4 9h16M4 15h16M10 3l-2 18M16 3l-2 18" />
        </svg>
      );
    case 'audio':
      return (
        <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.14v7.72A4.5 4.5 0 0016.5 12zM14 3.23v2.06a6.51 6.51 0 010 13.42v2.06A8.5 8.5 0 0014 3.23z" />
        </svg>
      );
  }
}
