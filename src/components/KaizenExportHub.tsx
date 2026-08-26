import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  ClipboardCheck, 
  BookOpen, 
  Syringe, 
  ShieldCheck, 
  AlertCircle,
  FileCheck,
  Sparkles
} from 'lucide-react';
import { FullPortfolioState, WPBARecord, ReflectiveNote } from '../types';
import { formatWpbaForKaizen, formatReflectionForKaizen } from '../lib/githubSync';

interface KaizenExportHubProps {
  state: FullPortfolioState;
  onUpdateState: (newState: FullPortfolioState) => void;
}

export const KaizenExportHub: React.FC<KaizenExportHubProps> = ({
  state,
  onUpdateState,
}) => {
  const [activeTab, setActiveTab] = useState<'wpbas' | 'reflections' | 'all'>('wpbas');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleMarkWpbaCopied = (wpba: WPBARecord) => {
    const isAlready = !!wpba.copiedToKaizenDate;
    const updated = state.wpbas.map(w => {
      if (w.id === wpba.id) {
        return {
          ...w,
          copiedToKaizenDate: isAlready ? undefined : new Date().toISOString().slice(0, 10)
        };
      }
      return w;
    });
    onUpdateState({ ...state, wpbas: updated });
  };

  const handleMarkRefCopied = (ref: ReflectiveNote) => {
    const isAlready = !!ref.copiedToKaizenDate;
    const updated = state.reflections.map(r => {
      if (r.id === ref.id) {
        return {
          ...r,
          copiedToKaizenDate: isAlready ? undefined : new Date().toISOString().slice(0, 10)
        };
      }
      return r;
    });
    onUpdateState({ ...state, reflections: updated });
  };

  const pendingWpbas = state.wpbas.filter(w => !w.copiedToKaizenDate);
  const pendingRefs = state.reflections.filter(r => !r.copiedToKaizenDate);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Copy className="w-4 h-4" />
            <span>Official risr/advance (Kaizen) Staging Bridge</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            1-Click Kaizen Copy & Export Center
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Copy your fully formulated, anonymised, and curriculum-tagged documentation into the official RCPCH Kaizen ePortfolio with single-field or whole-form clipboard buttons.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-center">
            <div className="text-[10px] text-slate-500 font-semibold uppercase">Pending Copy</div>
            <div className="text-sm font-bold text-emerald-800">{pendingWpbas.length + pendingRefs.length} Staged Items</div>
          </div>
        </div>
      </div>

      {/* Guide Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-emerald-950 shadow-xs">
        <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-semibold text-emerald-900">How to transfer staged items into RCPCH Kaizen:</strong>
          <ol className="list-decimal pl-4 space-y-0.5 text-slate-700 text-[11px]">
            <li>Open the official RCPCH ePortfolio in another tab (risr/advance).</li>
            <li>Click <strong>"Create New Event"</strong> in Kaizen (e.g. Mini-CEX, CbD, or Reflective Note).</li>
            <li>Use the buttons below to copy individual fields or the entire formulated block into Kaizen.</li>
            <li>Tag the corresponding Progress+ Learning Outcomes (indicated in the tags) and send for assessor sign-off.</li>
          </ol>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 p-1.5 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('wpbas')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'wpbas'
              ? 'bg-[#0369a1] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          WPBAs ({state.wpbas.length})
        </button>
        <button
          onClick={() => setActiveTab('reflections')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'reflections'
              ? 'bg-[#0369a1] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Reflective Notes ({state.reflections.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[#0369a1] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Staged Entries
        </button>
      </div>

      {/* WPBAs List */}
      {(activeTab === 'wpbas' || activeTab === 'all') && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-[#0369a1]" />
            <span>Work Place Based Assessments ({state.wpbas.length})</span>
          </h2>

          <div className="space-y-4">
            {state.wpbas.map((w) => {
              const kaizenData = formatWpbaForKaizen(w);
              const isCopied = !!w.copiedToKaizenDate;
              return (
                <div
                  key={w.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs px-2.5 py-0.5 rounded bg-sky-50 text-[#0369a1] border border-sky-200">
                          {w.type}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">{w.title}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Date: {w.date} • Setting: {w.clinicalSetting} • Patient: {w.patientAgeGroup} • Assessor: {w.assessorName}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleMarkWpbaCopied(w)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                          isCopied
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isCopied ? `Copied (${w.copiedToKaizenDate})` : 'Mark Copied'}</span>
                      </button>

                      <button
                        onClick={() => handleCopyText(kaizenData.fullKaizenBlock, `wpba-full-${w.id}`)}
                        className="text-xs px-3.5 py-1.5 rounded-xl font-semibold bg-[#0369a1] hover:bg-sky-700 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        {copiedField === `wpba-full-${w.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === `wpba-full-${w.id}` ? 'Form Copied!' : 'Copy Full Form'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Field-by-Field Quick Copy Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Case Summary */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-800">1. Description / Case Summary</span>
                          <button
                            onClick={() => handleCopyText(w.caseSummary, `summary-${w.id}`)}
                            className="text-[11px] text-[#0369a1] hover:text-sky-800 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedField === `summary-${w.id}` ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="text-slate-600 line-clamp-3 text-[11px] leading-relaxed">{w.caseSummary}</p>
                      </div>
                    </div>

                    {/* What Went Well */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-emerald-800">2. What Went Well</span>
                          <button
                            onClick={() => handleCopyText(w.whatWentWell, `well-${w.id}`)}
                            className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedField === `well-${w.id}` ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="text-slate-600 line-clamp-3 text-[11px] leading-relaxed">{w.whatWentWell}</p>
                      </div>
                    </div>

                    {/* Areas for Development */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-amber-800">3. Areas for Development</span>
                          <button
                            onClick={() => handleCopyText(w.areasForDevelopment, `areas-${w.id}`)}
                            className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedField === `areas-${w.id}` ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="text-slate-600 line-clamp-3 text-[11px] leading-relaxed">{w.areasForDevelopment}</p>
                      </div>
                    </div>

                    {/* Agreed Action Plan */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-[#0369a1]">4. Agreed Action Plan</span>
                          <button
                            onClick={() => handleCopyText(w.agreedActionPlan, `action-${w.id}`)}
                            className="text-[11px] text-[#0369a1] hover:text-sky-800 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedField === `action-${w.id}` ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="text-slate-600 line-clamp-3 text-[11px] leading-relaxed">{w.agreedActionPlan}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tags to click on Kaizen */}
                  <div className="flex items-center space-x-2 text-xs pt-1">
                    <span className="text-slate-500 font-medium">Tag in Kaizen:</span>
                    {w.curriculumTags.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded bg-sky-50 text-[#0369a1] font-bold text-[10px] border border-sky-200">
                        {t}
                      </span>
                    ))}
                    <span className="text-slate-500 text-[11px]">• Entrustment: {w.entrustmentLevel.split(':')[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reflections List */}
      {(activeTab === 'reflections' || activeTab === 'all') && (
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Reflective Practice Notes ({state.reflections.length})</span>
          </h2>

          <div className="space-y-4">
            {state.reflections.map((r) => {
              const kaizenData = formatReflectionForKaizen(r);
              const isCopied = !!r.copiedToKaizenDate;
              return (
                <div
                  key={r.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {r.category}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">{r.title}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Date: {r.date} • Gibbs Reflective Cycle • GMC Anonymised
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleMarkRefCopied(r)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
                          isCopied
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isCopied ? `Copied (${r.copiedToKaizenDate})` : 'Mark Copied'}</span>
                      </button>

                      <button
                        onClick={() => handleCopyText(kaizenData.fullKaizenBlock, `ref-full-${r.id}`)}
                        className="text-xs px-3.5 py-1.5 rounded-xl font-semibold bg-[#0369a1] hover:bg-sky-700 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        {copiedField === `ref-full-${r.id}` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === `ref-full-${r.id}` ? 'Reflection Copied!' : 'Copy Full Reflection'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Gibbs Field Copy */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">1. Description</span>
                        <button
                          onClick={() => handleCopyText(r.description, `desc-${r.id}`)}
                          className="text-[11px] text-[#0369a1] hover:text-sky-800 font-semibold cursor-pointer"
                        >
                          {copiedField === `desc-${r.id}` ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-slate-600 line-clamp-3 text-[11px] leading-relaxed">{r.description}</p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">2. Analysis</span>
                        <button
                          onClick={() => handleCopyText(r.analysis, `anal-${r.id}`)}
                          className="text-[11px] text-[#0369a1] hover:text-sky-800 font-semibold cursor-pointer"
                        >
                          {copiedField === `anal-${r.id}` ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-slate-600 line-clamp-3 text-[11px] leading-relaxed">{r.analysis}</p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">3. Action Plan & Learning</span>
                        <button
                          onClick={() => handleCopyText(`${r.actionPlan}\n\nKey Learning: ${r.learningPoints}`, `act-${r.id}`)}
                          className="text-[11px] text-[#0369a1] hover:text-sky-800 font-semibold cursor-pointer"
                        >
                          {copiedField === `act-${r.id}` ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <p className="text-slate-600 line-clamp-3 text-[11px] leading-relaxed">{r.actionPlan}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs pt-1">
                    <span className="text-slate-500 font-medium">Tag in Kaizen:</span>
                    {r.curriculumTags.map(t => (
                      <span key={t} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
