import { useEffect, useState } from 'react';
import { useAuth, SignInButton } from '@clerk/clerk-react';
import type { GameSettings, TrainingProgramRecord } from '../../types';
import { getPrograms, enrollInProgram, abandonProgram } from '../../lib/api';
import { PROGRAM_TEMPLATES, getTemplate, getRequiredScore } from '../../lib/programs';
import { ProgramDetail } from './ProgramDetail';
import { STIMULUS_LABELS } from '../../lib/constants';

interface ProgramsScreenProps {
  onBack: () => void;
  onStartSession: (settings: GameSettings, programId: string) => void;
}

export function ProgramsScreen({ onBack, onStartSession }: ProgramsScreenProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const [programs, setPrograms] = useState<TrainingProgramRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [abandonTarget, setAbandonTarget] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadPrograms();
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  const loadPrograms = async () => {
    try {
      const data = await getPrograms();
      setPrograms(data.programs);
    } catch {
      // not signed in
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (templateId: string) => {
    setEnrolling(templateId);
    try {
      await enrollInProgram(templateId);
      await loadPrograms();
    } catch {
      // error
    } finally {
      setEnrolling(null);
    }
  };

  const handleAbandon = async () => {
    if (!abandonTarget) return;
    try {
      await abandonProgram(abandonTarget);
      await loadPrograms();
    } catch {
      // error
    } finally {
      setAbandonTarget(null);
    }
  };

  const activePrograms = programs.filter((p) => p.status === 'active');
  const completedPrograms = programs.filter((p) => p.status === 'completed');

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'beginner': return 'text-green-400 bg-green-500/10';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/10';
      case 'advanced': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">Training Programs</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-24 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      ) : !isSignedIn ? (
        <div className="space-y-6">
          <div className="card border-primary-500/30 bg-primary-950/20 text-center space-y-4">
            <div className="text-4xl">🎯</div>
            <h2 className="text-xl font-bold">Structured Training Programs</h2>
            <p className="text-gray-400">
              Follow a guided 20-day program designed to progressively challenge your working memory.
              Track your progress, earn achievements, and level up.
            </p>
            <SignInButton mode="modal">
              <button className="btn-primary w-full">
                Sign in to access programs
              </button>
            </SignInButton>
          </div>

          {/* Preview of available programs */}
          <div className="space-y-3 opacity-60">
            <h2 className="text-sm text-gray-400 font-medium uppercase tracking-wider">Available Programs</h2>
            {PROGRAM_TEMPLATES.map((template) => (
              <div key={template.id} className="card space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg">{template.name}</div>
                    <div className="text-sm text-gray-400">{template.totalDays} sessions</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(template.difficulty)}`}>
                    {template.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{template.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Active Programs */}
          {activePrograms.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm text-gray-400 font-medium uppercase tracking-wider">Active Programs</h2>
              {activePrograms.map((program) => {
                const template = getTemplate(program.templateId);
                if (!template) return null;
                const todaySession = template.sessions[program.currentDay - 1];
                const progress = ((program.currentDay - 1) / template.totalDays) * 100;
                const isExpanded = expandedTemplate === `active-${program.id}`;

                return (
                  <div key={program.id} className="card space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-lg">{template.name}</div>
                        <div className="text-sm text-gray-400">
                          Day {program.currentDay} of {template.totalDays}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </span>
                    </div>

                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {todaySession && (
                      <div className="bg-gray-900/50 rounded-xl p-3">
                        <div className="text-sm font-medium text-gray-300">
                          Today: {todaySession.nLevel}-Back • {todaySession.activeStimuli.map((s) => STIMULUS_LABELS[s]).join(' + ')}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {todaySession.description} · Score {Math.round(getRequiredScore(todaySession) * 100)}% to advance
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {todaySession && (
                        <button
                          onClick={() => onStartSession(
                            {
                              nLevel: todaySession.nLevel,
                              activeStimuli: todaySession.activeStimuli,
                              trialCount: todaySession.trialCount,
                              intervalMs: todaySession.intervalMs,
                              adaptive: todaySession.adaptive,
                            },
                            program.id
                          )}
                          className="btn-primary flex-1 min-w-0"
                        >
                          Start Day {program.currentDay}
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedTemplate(isExpanded ? null : `active-${program.id}`)}
                        className="btn-secondary px-4 flex-shrink-0"
                      >
                        {isExpanded ? 'Hide' : 'Schedule'}
                      </button>
                      <button
                        onClick={() => setAbandonTarget(program.id)}
                        className="text-gray-500 hover:text-red-400 px-3 flex-shrink-0 flex items-center"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {isExpanded && <ProgramDetail template={template} program={program} />}
                  </div>
                );
              })}
            </div>
          )}

          {/* Available Programs */}
          <div className="space-y-3">
            <h2 className="text-sm text-gray-400 font-medium uppercase tracking-wider">Available Programs</h2>
            {PROGRAM_TEMPLATES.map((template) => {
              const activeForThis = activePrograms.find((p) => p.templateId === template.id);
              const isExpanded = expandedTemplate === template.id;

              return (
                <div key={template.id} className="card space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg">{template.name}</div>
                      <div className="text-sm text-gray-400">{template.totalDays} sessions</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(template.difficulty)}`}>
                      {template.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{template.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {activeForThis ? (
                      <span className="text-sm text-primary-400 py-2">Currently active</span>
                    ) : (
                      <button
                        onClick={() => handleEnroll(template.id)}
                        className="btn-primary flex-1 min-w-0"
                        disabled={enrolling === template.id}
                      >
                        {enrolling === template.id ? 'Enrolling...' : 'Start Program'}
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedTemplate(isExpanded ? null : template.id)}
                      className="btn-secondary px-4 flex-shrink-0"
                    >
                      {isExpanded ? 'Hide' : 'View Schedule'}
                    </button>
                  </div>

                  {isExpanded && <ProgramDetail template={template} />}
                </div>
              );
            })}
          </div>

          {/* Completed Programs */}
          {completedPrograms.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm text-gray-400 font-medium uppercase tracking-wider">Completed Programs</h2>
              {completedPrograms.map((program) => {
                const template = getTemplate(program.templateId);
                if (!template) return null;
                return (
                  <div key={program.id} className="card opacity-60">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold">{template.name}</div>
                        <div className="text-sm text-gray-500">
                          Completed {program.completedAt ? new Date(program.completedAt).toLocaleDateString() : ''}
                        </div>
                      </div>
                      <span className="text-green-400 text-sm">Completed</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Abandon Confirmation Modal */}
      {abandonTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="card max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold">Abandon this program?</h3>
            <p className="text-sm text-gray-400">Your progress will be saved but the program will be marked as abandoned.</p>
            <div className="flex gap-3">
              <button onClick={() => setAbandonTarget(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleAbandon}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-all"
              >
                Abandon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
