import React from 'react';
import { 
  Plus, 
  ClipboardCheck, 
  BookOpen, 
  Syringe, 
  Target, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  Copy, 
  AlertTriangle,
  Github
} from 'lucide-react';
import { FullPortfolioState } from '../types';
import { RCPCH_LEARNING_OUTCOMES } from '../data/rcpchCurriculum';
import { NavigationTab } from './Sidebar';

interface DashboardProps {
  state: FullPortfolioState;
  onNavigate: (tab: NavigationTab) => void;
  onNewWpba: () => void;
  onNewReflection: () => void;
  onNewProcedure: () => void;
  onNewPdp: () => void;
  onOpenAiAdvisor: () => void;
  onOpenGitHubModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  state,
  onNavigate,
  onNewWpba,
  onNewReflection,
  onNewProcedure,
  onNewPdp,
  onOpenAiAdvisor,
  onOpenGitHubModal,
}) => {
  // Compute ARCP days remaining
  const arcpDate = new Date(state.profile.arcpDate);
  const now = new Date();
  const diffTime = arcpDate.getTime() - now.getTime();
  const daysToArcp = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Compute coverage of 11 Learning Outcomes
  const loCoverage = RCPCH_LEARNING_OUTCOMES.map(lo => {
    const wpbas = state.wpbas.filter(w => w.curriculumTags.includes(lo.id)).length;
    const reflections = state.reflections.filter(r => r.curriculumTags.includes(lo.id)).length;
    const procedures = state.procedureLogs.filter(p => p.curriculumTags.includes(lo.id)).length;
    const pdps = state.pdpGoals.filter(p => p.curriculumTags.includes(lo.id)).length;
    const total = wpbas + reflections + procedures + pdps;
    return {
      ...lo,
      totalEvidence: total,
      isCovered: total > 0
    };
  });

  const coveredCount = loCoverage.filter(lo => lo.isCovered).length;
  const underEvidenced = loCoverage.filter(lo => lo.totalEvidence === 0);

  // Uncopied Kaizen count
  const pendingKaizenCount = 
    state.wpbas.filter(w => !w.copiedToKaizenDate).length + 
    state.reflections.filter(r => !r.copiedToKaizenDate).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0369a1] bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                {state.profile.curriculumLevel}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {state.profile.currentHospital}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {state.profile.name || 'Doctor'}
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Staging & preparation workspace for your official RCPCH Progress+ risr/advance ePortfolio. All drafts are stored locally and ready for one-click copy or GitHub export.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="dash-quick-wpba-btn"
              onClick={onNewWpba}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#0369a1] hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Stage WPBA</span>
            </button>
            <button
              id="dash-quick-ref-btn"
              onClick={onNewReflection}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Draft Reflection</span>
            </button>
            <button
              id="dash-quick-kaizen-btn"
              onClick={() => onNavigate('kaizen')}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <Copy className="w-4 h-4 text-emerald-600" />
              <span>Kaizen Copy ({pendingKaizenCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ARCP Countdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ARCP Panel Review</span>
            <Calendar className="w-4 h-4 text-[#0369a1]" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">
              {daysToArcp > 0 ? `${daysToArcp} Days` : 'Due Today'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Target: {state.profile.arcpDate} ({state.profile.trainingGrade})
          </p>
        </div>

        {/* Learning Outcomes Coverage */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Progress+ LOs Covered</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{coveredCount} / 11</span>
            <span className="text-xs text-emerald-700 font-semibold">
              {Math.round((coveredCount / 11) * 100)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div 
              className="bg-[#0ea5e9] h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${(coveredCount / 11) * 100}%` }}
            />
          </div>
        </div>

        {/* WPBAs & SLEs Staged */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">WPBAs & Assessments</span>
            <ClipboardCheck className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{state.wpbas.length}</span>
            <span className="text-xs text-slate-500">staged forms</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Mini-CEX, CbD, DOPS & ACAT records
          </p>
        </div>

        {/* Life Support & Safeguarding Certificates */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Mandatory Courses</span>
            <ShieldCheck className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">
              {state.certificates.filter(c => c.status === 'Valid').length} / {state.certificates.length}
            </span>
            <span className="text-xs text-emerald-700 font-semibold">All Valid</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            NLS, APLS, Safeguarding Level 3
          </p>
        </div>
      </div>

      {/* Main Grid: Curriculum Heatmap & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 11 Learning Outcomes Matrix */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Progress+ 11 Learning Outcomes Evidence Coverage
              </h2>
              <p className="text-xs text-slate-500">
                Evidence mapping across Royal College domains for {state.profile.curriculumLevel}
              </p>
            </div>
            <button
              onClick={() => onNavigate('curriculum')}
              className="text-xs text-[#0369a1] hover:text-sky-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Warning banner if domains are under-evidenced */}
          {underEvidenced.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start space-x-3 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-amber-900">Curriculum Blindspots Identified:</strong>{' '}
                {underEvidenced.length} domain{underEvidenced.length > 1 ? 's' : ''} have no linked evidence ({underEvidenced.map(u => u.id).join(', ')}).
                <button
                  onClick={onOpenAiAdvisor}
                  className="ml-2 underline text-[#0369a1] hover:text-sky-800 font-semibold cursor-pointer"
                >
                  Ask AI for case ideas
                </button>
              </div>
            </div>
          )}

          {/* Grid of 11 Learning Outcome Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {loCoverage.map((lo) => (
              <div
                key={lo.id}
                onClick={() => onNavigate('curriculum')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  lo.isCovered
                    ? 'bg-white border-slate-200 hover:border-sky-400 hover:shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 border-dashed hover:border-amber-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span 
                      className="text-[11px] font-bold px-1.5 py-0.5 rounded text-white"
                      style={{ backgroundColor: lo.color }}
                    >
                      {lo.id}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[160px]">
                      {lo.title}
                    </span>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    lo.totalEvidence > 0
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {lo.totalEvidence} linked
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {lo.shortDesc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Quick Actions & Recent Staged Items */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Staging Actions</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={onNewWpba}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-left transition-colors cursor-pointer"
              >
                <ClipboardCheck className="w-4 h-4 text-[#0369a1] mb-1.5" />
                <div className="text-xs font-bold text-slate-800">New WPBA</div>
                <div className="text-[10px] text-slate-500">Mini-CEX, CbD, DOPS</div>
              </button>

              <button
                onClick={onNewReflection}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-left transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-600 mb-1.5" />
                <div className="text-xs font-bold text-slate-800">New Reflection</div>
                <div className="text-[10px] text-slate-500">Gibbs Cycle</div>
              </button>

              <button
                onClick={onNewProcedure}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-left transition-colors cursor-pointer"
              >
                <Syringe className="w-4 h-4 text-purple-600 mb-1.5" />
                <div className="text-xs font-bold text-slate-800">Log Procedure</div>
                <div className="text-[10px] text-slate-500">Skills Logbook</div>
              </button>

              <button
                onClick={onNewPdp}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-left transition-colors cursor-pointer"
              >
                <Target className="w-4 h-4 text-amber-600 mb-1.5" />
                <div className="text-xs font-bold text-slate-800">Add PDP Goal</div>
                <div className="text-[10px] text-slate-500">SMART Goals</div>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                onClick={onOpenGitHubModal}
                className="w-1/2 py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub Export</span>
              </button>

              <button
                onClick={() => onNavigate('kaizen')}
                className="w-1/2 py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Kaizen Copy</span>
              </button>
            </div>
          </div>

          {/* Recent Staged Activity Feed */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Recent Staging Activity</h3>
              <span className="text-[10px] text-slate-500 font-medium">Latest items</span>
            </div>

            <div className="space-y-2">
              {state.wpbas.slice(0, 3).map((w) => (
                <div 
                  key={w.id}
                  onClick={() => onNavigate('wpbas')}
                  className="p-2.5 bg-slate-50/80 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-[#0369a1] text-[10px] bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                        {w.type}
                      </span>
                      <span className="text-slate-800 font-semibold truncate">{w.title}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {w.date} • {w.assessorName}
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Ready
                  </span>
                </div>
              ))}

              {state.reflections.slice(0, 2).map((r) => (
                <div 
                  key={r.id}
                  onClick={() => onNavigate('reflections')}
                  className="p-2.5 bg-slate-50/80 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-emerald-800 text-[10px] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Reflection
                      </span>
                      <span className="text-slate-800 font-semibold truncate">{r.title}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {r.date} • {r.category}
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                    Gibbs
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
