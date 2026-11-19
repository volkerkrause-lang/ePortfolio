import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  Syringe,
  Target,
  Users,
  CheckCircle2,
  Copy,
  Github,
  Settings,
  Sparkles
} from 'lucide-react';
import { FullPortfolioState } from '../types';

export type NavigationTab = 
  | 'dashboard'
  | 'curriculum'
  | 'wpbas'
  | 'reflections'
  | 'logbook'
  | 'pdp'
  | 'supervisors'
  | 'arcp'
  | 'appraisal-planner'
  | 'kaizen'
  | 'github'
  | 'profile';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  state: FullPortfolioState;
  onOpenAiAdvisor: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  state,
  onOpenAiAdvisor,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }>; count?: number }[] = [
    { id: 'dashboard', label: 'Dashboard & Overview', icon: LayoutDashboard },
    { id: 'curriculum', label: 'Progress+ Curriculum', icon: GraduationCap, count: 11 },
    { id: 'wpbas', label: 'Clinical Encounters (WPBAs)', icon: ClipboardCheck, count: state.wpbas.length },
    { id: 'reflections', label: 'Reflective Notes (Gibbs)', icon: BookOpen, count: state.reflections.length },
    { id: 'logbook', label: 'Procedures Logbook', icon: Syringe, count: state.procedureLogs.length },
    { id: 'pdp', label: 'Development Plans (PDP)', icon: Target, count: state.pdpGoals.length },
    { id: 'supervisors', label: 'Supervisory Meetings', icon: Users, count: state.supervisorMeetings.length },
    { id: 'arcp', label: 'ARCP Readiness & Certs', icon: CheckCircle2, count: state.certificates.length },
    { id: 'appraisal-planner', label: 'Appraisal Planner', icon: BookOpen, count: state.appraisalPlanner?.cpdChecklist.filter(item => item.completed).length ?? 0 },
    { id: 'kaizen', label: 'Stage to Export (Kaizen)', icon: Copy },
    { id: 'github', label: 'GitHub Staging Mirror', icon: Github },
    { id: 'profile', label: 'Trainee Profile', icon: Settings }
  ];

  // Calculate un-copied staging items
  const uncopiedWpbas = state.wpbas.filter(w => !w.copiedToKaizenDate).length;
  const uncopiedReflections = state.reflections.filter(r => !r.copiedToKaizenDate).length;
  const pendingStagingCount = uncopiedWpbas + uncopiedReflections;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-3 shrink-0 select-none">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all text-left cursor-pointer border-l-4 ${
                  isActive
                    ? 'bg-[#f1f5f9] text-[#0369a1] border-[#0369a1] font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent font-medium'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0369a1]' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isActive ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
                {item.id === 'kaizen' && pendingStagingCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                    {pendingStagingCount} new
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Staging Status & AI Copilot Callout */}
      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
        <div className="bg-[#eff6ff] p-3 rounded-xl border border-blue-100 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1e40af]">Staging Status</span>
            <span className="text-[10px] bg-blue-200/70 text-blue-900 font-bold px-1.5 py-0.2 rounded">
              risr/advance
            </span>
          </div>
          <p className="text-[11px] text-[#3b82f6] mt-1 font-medium">
            {pendingStagingCount} item{pendingStagingCount !== 1 ? 's' : ''} ready for Kaizen copy
          </p>
        </div>

        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xs">
          <div className="flex items-center space-x-2 text-sky-400 font-semibold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Progress+ Copilot</span>
          </div>
          <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
            Instant Gibbs cycle refinement, GMC anonymisation & ARCP audit.
          </p>
          <button
            id="sidebar-copilot-btn"
            onClick={onOpenAiAdvisor}
            className="w-full py-1.5 px-2 bg-[#0ea5e9] hover:bg-sky-400 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-3 h-3" />
            <span>Ask Advisor</span>
          </button>
        </div>

        <div className="text-[10px] text-slate-400 text-center py-0.5">
          RCPCH Progress+ Mirror • ST1-ST8
        </div>
      </div>
    </aside>
  );
};
