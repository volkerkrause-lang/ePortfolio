import React, { useMemo, useState } from 'react';
import { BookOpenCheck, Check, CheckCircle2, Circle, FileText, Lightbulb, Search, ShieldCheck, Users } from 'lucide-react';
import { AppraisalChecklistGroup, AppraisalPlannerState, AppraisalQualityProject, FullPortfolioState } from '../types';
import { createInitialAppraisalPlanner } from '../data/appraisalPlanner';

type PlannerSection = 'cpd' | 'qi' | 'feedback';

interface AppraisalPlannerModuleProps {
  state: FullPortfolioState;
  onUpdateState: (newState: FullPortfolioState) => void;
}

const groups: AppraisalChecklistGroup[] = [
  'Courses & certificates',
  'Meetings & clinical learning',
  'Teaching & leadership',
  'Reading & case review',
];

export const AppraisalPlannerModule: React.FC<AppraisalPlannerModuleProps> = ({ state, onUpdateState }) => {
  const [section, setSection] = useState<PlannerSection>('cpd');
  const planner: AppraisalPlannerState = state.appraisalPlanner ?? createInitialAppraisalPlanner();
  const completedCount = planner.cpdChecklist.filter(item => item.completed).length;
  const [filter, setFilter] = useState<'all' | 'remaining' | 'found'>('all');

  const updatePlanner = (changes: Partial<AppraisalPlannerState>) => {
    onUpdateState({ ...state, appraisalPlanner: { ...planner, ...changes } });
  };

  const visibleItems = useMemo(
    () => planner.cpdChecklist.filter(item => filter === 'all' || (filter === 'found' ? item.completed : !item.completed)),
    [planner.cpdChecklist, filter],
  );

  const updateCpdItem = (id: string, changes: { completed?: boolean; notes?: string }) => {
    updatePlanner({ cpdChecklist: planner.cpdChecklist.map(item => item.id === id ? { ...item, ...changes } : item) });
  };

  const updateProject = (id: string, changes: Partial<AppraisalQualityProject>) => {
    updatePlanner({ qualityProjects: planner.qualityProjects.map(project => project.id === id ? { ...project, ...changes } : project) });
  };

  const sections: { id: PlannerSection; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'cpd', label: 'CPD checklist', icon: BookOpenCheck },
    { id: 'qi', label: 'Quality improvement', icon: Lightbulb },
    { id: 'feedback', label: '360° feedback', icon: Users },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" /> Personal appraisal workspace
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Appraisal planner</h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">Keep track of evidence to find, improvement work to develop and feedback to include in your next appraisal.</p>
          </div>
          <label className="text-xs font-semibold text-slate-600 w-full lg:w-64">
            Appraisal period
            <input
              value={planner.appraisalPeriod}
              onChange={event => updatePlanner({ appraisalPeriod: event.target.value })}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label="Appraisal period"
            />
          </label>
        </div>
      </header>

      <nav className="flex gap-2 overflow-x-auto rounded-xl bg-slate-100 p-1" aria-label="Appraisal planner sections">
        {sections.map(item => {
          const Icon = item.icon;
          const active = section === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${active ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600 hover:bg-white/70'}`}
            >
              <Icon className="w-4 h-4" /> {item.label}
            </button>
          );
        })}
      </nav>

      {section === 'cpd' && (
        <section className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-sky-50 border border-sky-100 p-4 sm:col-span-2">
              <h2 className="font-bold text-slate-900">Evidence-finding checklist</h2>
              <p className="text-xs text-slate-600 mt-1">Use this as a prompt to search your work email, calendar, teaching records and learning systems. Tick an item when you have found or documented it; add a note about the evidence.</p>
            </div>
            <div className="rounded-xl bg-white border border-slate-200 p-4 flex items-center gap-3">
              <div className="rounded-full bg-emerald-50 p-2 text-emerald-700"><CheckCircle2 className="w-5 h-5" /></div>
              <div><p className="text-xl font-bold text-slate-900">{completedCount}<span className="text-sm font-medium text-slate-500"> / {planner.cpdChecklist.length}</span></p><p className="text-xs text-slate-500">items found or documented</p></div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white border border-slate-200 p-3">
            <div className="flex items-center gap-2 text-xs text-slate-500"><Search className="w-4 h-4" /> Show</div>
            <div className="flex gap-1">
              {([{ id: 'all', label: 'All' }, { id: 'remaining', label: 'Still to find' }, { id: 'found', label: 'Found' }] as const).map(option => (
                <button key={option.id} onClick={() => setFilter(option.id)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${filter === option.id ? 'bg-sky-100 text-sky-800' : 'text-slate-600 hover:bg-slate-100'}`}>{option.label}</button>
              ))}
            </div>
          </div>

          {groups.map(group => {
            const items = visibleItems.filter(item => item.group === group);
            if (!items.length) return null;
            return (
              <section key={group} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <h3 className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800">{group}</h3>
                <div className="divide-y divide-slate-100">
                  {items.map(item => (
                    <div key={item.id} className="grid grid-cols-[auto_1fr] gap-3 p-4 sm:grid-cols-[auto_minmax(0,1fr)_minmax(220px,0.75fr)] sm:items-start">
                      <button
                        type="button"
                        onClick={() => updateCpdItem(item.id, { completed: !item.completed })}
                        className={`mt-0.5 rounded-full ${item.completed ? 'text-emerald-600' : 'text-slate-300 hover:text-sky-600'}`}
                        aria-label={`${item.completed ? 'Mark as still to find' : 'Mark as found'}: ${item.title}`}
                      >
                        {item.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                      </button>
                      <div>
                        <p className={`text-sm font-semibold ${item.completed ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-900'}`}>{item.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.lookFor}</p>
                      </div>
                      <label className="col-start-2 sm:col-start-auto">
                        <span className="sr-only">Evidence note for {item.title}</span>
                        <input
                          value={item.notes}
                          onChange={event => updateCpdItem(item.id, { notes: event.target.value })}
                          placeholder="Where found / short note"
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
          <p className="text-xs text-slate-500">For patient-related learning, record only anonymised information. Attach certificates or supporting documents in your appraisal system.</p>
        </section>
      )}

      {section === 'qi' && (
        <section className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h2 className="font-bold text-amber-950">Review your practice</h2>
            <p className="mt-1 text-xs leading-relaxed text-amber-900">Your three projects from the previous appraisal are listed as completed historical work. The next appraisal ideas are prompts only; they are not recorded as projects you have started.</p>
          </div>
          {(['Previous appraisal', 'Next appraisal idea'] as const).map(period => (
            <div key={period} className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700">{period === 'Previous appraisal' ? 'Completed in the previous appraisal' : 'Possible next projects or extensions'}</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {planner.qualityProjects.filter(project => project.period === period).map(project => (
                  <article key={project.id} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div><h4 className="text-sm font-bold text-slate-900">{project.title}</h4><p className="mt-1 text-xs leading-relaxed text-slate-600">{project.summary}</p></div>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${project.status === 'Completed' ? 'bg-emerald-50 text-emerald-800' : project.status === 'In progress' ? 'bg-sky-50 text-sky-800' : 'bg-amber-50 text-amber-800'}`}>{project.status}</span>
                    </div>
                    {period === 'Next appraisal idea' && (
                      <>
                        <label className="block text-xs font-semibold text-slate-600">Status
                          <select value={project.status} onChange={event => updateProject(project.id, { status: event.target.value as AppraisalQualityProject['status'] })} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-normal text-slate-800">
                            <option>Idea</option><option>In progress</option><option>Completed</option>
                          </select>
                        </label>
                        <label className="block text-xs font-semibold text-slate-600">Next step
                          <textarea value={project.nextStep} onChange={event => updateProject(project.id, { nextStep: event.target.value })} rows={2} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 font-normal text-slate-700" />
                        </label>
                      </>
                    )}
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {section === 'feedback' && (
        <section className="space-y-4">
          <div className="rounded-xl border border-violet-100 bg-violet-50 p-4">
            <h2 className="font-bold text-slate-900">Feedback to include</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">Find the reports, add them to your appraisal evidence and note the learning or actions. The patient feedback date reflects what you told me; the colleague feedback date is left open.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {planner.feedbackReminders.map(item => (
              <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div><h3 className="font-bold text-slate-900">{item.title}</h3>{item.lastCompleted && <p className="mt-1 text-xs text-slate-500">Last completed: {item.lastCompleted}</p>}</div>
                  <div className="rounded-xl bg-violet-50 p-2 text-violet-700"><Users className="w-5 h-5" /></div>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={item.evidenceLocated} onChange={event => updatePlanner({ feedbackReminders: planner.feedbackReminders.map(record => record.id === item.id ? { ...record, evidenceLocated: event.target.checked } : record) })} className="h-4 w-4 accent-violet-700" />
                  <span className="flex items-center gap-1.5">{item.evidenceLocated ? <Check className="w-4 h-4 text-emerald-600" /> : <FileText className="w-4 h-4 text-slate-400" />} Report found and ready to include</span>
                </label>
                <label className="block text-xs font-semibold text-slate-600">Reflection / action
                  <textarea value={item.notes} onChange={event => updatePlanner({ feedbackReminders: planner.feedbackReminders.map(record => record.id === item.id ? { ...record, notes: event.target.value } : record) })} rows={3} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 font-normal text-slate-700" />
                </label>
              </article>
            ))}
          </div>
          <p className="text-xs text-slate-500">Keep feedback reports and reflections confidential and follow your organisation’s appraisal process for sharing them.</p>
        </section>
      )}
    </div>
  );
};
