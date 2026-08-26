import React from 'react';
import { 
  Award, 
  Github, 
  Sparkles, 
  Download, 
  Upload, 
  RotateCcw, 
  Copy, 
  Calendar, 
  ShieldCheck,
  Building2,
  UserCheck
} from 'lucide-react';
import { FullPortfolioState, ProgressLevel } from '../types';
import { exportPortfolioAsJSON, resetToSampleData } from '../lib/storage';

interface NavbarProps {
  state: FullPortfolioState;
  onUpdateState: (newState: FullPortfolioState) => void;
  onOpenGitHubModal: () => void;
  onOpenAiAdvisor: () => void;
  onQuickKaizenCopy: () => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  state,
  onUpdateState,
  onOpenGitHubModal,
  onOpenAiAdvisor,
  onQuickKaizenCopy,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLevelChange = (newLevel: ProgressLevel) => {
    onUpdateState({
      ...state,
      profile: {
        ...state.profile,
        curriculumLevel: newLevel
      }
    });
  };

  const handleReset = () => {
    if (window.confirm('Reset staging portfolio to standard sample paediatric data? Any unsaved staging notes will be replaced.')) {
      const sample = resetToSampleData();
      onUpdateState(sample);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.profile && parsed.wpbas) {
          onUpdateState(parsed);
          alert('Portfolio staging backup loaded successfully!');
        } else {
          alert('Invalid RCPCH backup JSON format.');
        }
      } catch (err: any) {
        alert('Failed to parse file: ' + err.message);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#0369a1] flex items-center justify-center font-bold text-base text-white shadow-xs">
              P+
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-[#0369a1]">RCPCH Mirror</span>
                <span className="bg-sky-50 text-sky-800 text-[11px] px-2.5 py-0.5 rounded-full font-medium border border-sky-200">
                  Progress+ Staging
                </span>
                <span className="hidden sm:flex bg-emerald-50 text-emerald-800 text-[11px] px-2.5 py-0.5 rounded-full font-medium border border-emerald-200 items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> risr/advance
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block">
                Stage, refine & validate paediatric training evidence
              </p>
            </div>
          </div>

          {/* Trainee Quick Selector & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Level Selector */}
            <div className="hidden md:flex items-center space-x-1.5 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Level:</span>
              <select
                value={state.profile.curriculumLevel}
                onChange={(e) => handleLevelChange(e.target.value as ProgressLevel)}
                className="bg-transparent text-xs text-[#0369a1] font-semibold focus:outline-none cursor-pointer"
              >
                <option value="Level 1 (Core ST1-ST3)">Core (ST1-ST3)</option>
                <option value="Level 2 (Specialty ST4-ST5)">Specialty (ST4-ST5)</option>
                <option value="Level 3 (General/Subspecialty ST6-ST8)">ST6-ST8 / Subspecialty</option>
              </select>
            </div>

            {/* AI Advisor Button */}
            <button
              id="ai-advisor-btn"
              onClick={onOpenAiAdvisor}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0369a1] hover:bg-sky-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              title="Open AI Clinical Reflection & Curriculum Copilot"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            {/* Quick Kaizen Copy Button */}
            <button
              id="kaizen-copy-quick-btn"
              onClick={onQuickKaizenCopy}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              title="Open Kaizen 1-Click Copy Hub"
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Kaizen Copy Hub</span>
            </button>

            {/* GitHub Sync Button */}
            <button
              id="github-sync-nav-btn"
              onClick={onOpenGitHubModal}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
              title="Sync / Export Portfolio to GitHub"
            >
              <Github className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">GitHub Export</span>
            </button>

            {/* JSON Export/Import Menu */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => exportPortfolioAsJSON(state)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-xs transition-colors cursor-pointer"
                title="Download JSON Backup"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 text-xs transition-colors cursor-pointer"
                title="Restore from JSON Backup"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-amber-600 border border-slate-200 text-xs transition-colors cursor-pointer"
                title="Reset Sample Paediatric Data"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trainee Banner Sub-header */}
      <div className="bg-[#f8fafc] px-4 py-2 border-t border-slate-200 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-y-1 gap-x-4">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-[#0369a1]" />
              {state.profile.name || 'Dr. Sarah Jenkins'}
            </span>
            <span className="text-slate-300">|</span>
            <span>GMC: <strong className="text-slate-800">{state.profile.gmcNumber}</strong></span>
            <span className="text-slate-300">|</span>
            <span className="text-[#0369a1] font-semibold">{state.profile.trainingGrade}</span>
          </div>

          <div className="flex items-center space-x-4 text-slate-500 text-xs">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {state.profile.currentHospital}
            </span>
            <span className="flex items-center gap-1 text-sky-800 font-semibold bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
              <Calendar className="w-3 h-3 text-sky-600" />
              Target ARCP: {state.profile.arcpDate}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
