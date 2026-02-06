interface TrialProgressProps {
  current: number;
  total: number;
  nLevel: number;
}

export function TrialProgress({ current, total, nLevel }: TrialProgressProps) {
  const percent = ((current + 1) / total) * 100;

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-between text-sm text-text-muted mb-1">
        <span>{current + 1} / {total}</span>
        <span>{nLevel}-Back</span>
      </div>
      <div className="h-2 bg-card-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
