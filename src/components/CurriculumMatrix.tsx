import React, { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  ClipboardCheck,
  BookOpen,
  Syringe,
  Target,
  Sparkles
} from 'lucide-react';
import { FullPortfolioState, ProgressLevel } from '../types';
import { RCPCH_LEARNING_OUTCOMES } from '../data/rcpchCurriculum';

interface CurriculumMatrixProps {
  state: FullPortfolioState;
  onNewWpbaWithTag: (loId: string) => void;
  onNewReflectionWithTag: (loId: string) => void;
  onOpenAiAdvisorWithLo: (loId: string) => void;
}

export const CurriculumMatrix: React.FC<CurriculumMatrixProps> = ({
  state,
  onNewWpbaWithTag,
  onNewReflectionWithTag,
  onOpenAiAdvisorWithLo,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<ProgressLevel>(state.profile.curriculumLevel);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLo, setExpandedLo] = useState<string | null>('LO1');

  const filteredLOs = RCPCH_LEARNING_OUTCOMES.filter(lo => {
    const q = searchQuery.toLowerCase();
    return (
      lo.id.toLowerCase().includes(q) ||
      lo.title.toLowerCase().includes(q) ||
      lo.shortDesc.toLowerCase().includes(q) ||
      lo.gmcDomain.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[#0369a1] text-xs font-semibold uppercase tracking-wider mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>Royal College of Paediatrics & Child Health</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Progress+ Curriculum: 11 Learning Outcomes Matrix
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Map and verify your staged evidence against the 11 GMC-approved Learning Outcomes and Key Capabilities for paediatric specialty training.
            </p>
          </div>

          {/* Level Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['Level 1 (Core ST1-ST3)', 'Level 2 (Specialty ST4-ST5)', 'Level 3 (General/Subspecialty ST6-ST8)'] as ProgressLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-[#0369a1] text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl.split(' ')[0]} {lvl.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search learning outcomes, GMC domains, capabilities, or clinical keywords (e.g. safeguarding, resus, intubation)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* List of 11 Learning Outcomes */}
      <div className="space-y-4">
        {filteredLOs.map((lo) => {
          const isExpanded = expandedLo === lo.id;
          const linkedWpbas = state.wpbas.filter(w => w.curriculumTags.includes(lo.id));
          const linkedReflections = state.reflections.filter(r => r.curriculumTags.includes(lo.id));
          const linkedProcedures = state.procedureLogs.filter(p => p.curriculumTags.includes(lo.id));
          const linkedPdp = state.pdpGoals.filter(p => p.curriculumTags.includes(lo.id));
          const totalEvidence = linkedWpbas.length + linkedReflections.length + linkedProcedures.length + linkedPdp.length;

          // Select capabilities based on level
          let capabilities = lo.coreCapabilities;
          if (selectedLevel.includes('Level 2')) capabilities = lo.specialtyCapabilities;
          if (selectedLevel.includes('Level 3')) capabilities = lo.level3Capabilities;

          return (
            <div
              key={lo.id}
              className={`bg-white border rounded-2xl transition-all overflow-hidden ${
                isExpanded ? 'border-sky-300 shadow-xs ring-1 ring-sky-200' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Header Accordion Bar */}
              <div
                onClick={() => setExpandedLo(isExpanded ? null : lo.id)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-xs shrink-0"
                    style={{ backgroundColor: lo.color }}
                  >
                    {lo.id}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base font-bold text-slate-900 tracking-tight">
                        {lo.title}
                      </h2>
                      <span className="text-[11px] text-slate-500 hidden sm:inline">
                        • {lo.gmcDomain.split(':')[0]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {lo.shortDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    totalEvidence > 0
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {totalEvidence} Staged Item{totalEvidence !== 1 ? 's' : ''}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Body Details */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-100 bg-[#f8fafc] space-y-6">
                  {/* GMC Domain & Guidance */}
                  <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2 shadow-xs">
                    <div className="text-xs text-[#0369a1] font-semibold">
                      {lo.gmcDomain}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {lo.shortDesc}
                    </p>
                    <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <strong className="text-slate-800">ARCP Evidence Guidance:</strong> {lo.guidanceNotes}
                    </div>
                  </div>

                  {/* Key Capabilities Checklist */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        {selectedLevel} Key Capabilities Required
                      </h3>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Progress+ Benchmark
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {capabilities.map((cap, idx) => (
                        <div
                          key={idx}
                          className="flex items-start space-x-2.5 p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 shadow-xs"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{cap}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Linked Evidence Grid */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Linked Staging Evidence ({totalEvidence})
                      </h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onNewWpbaWithTag(lo.id)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-[#0369a1] hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Link WPBA</span>
                        </button>
                        <button
                          onClick={() => onNewReflectionWithTag(lo.id)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Link Reflection</span>
                        </button>
                        <button
                          onClick={() => onOpenAiAdvisorWithLo(lo.id)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-[#0369a1] border border-sky-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>AI Ideas</span>
                        </button>
                      </div>
                    </div>

                    {totalEvidence === 0 ? (
                      <div className="p-5 bg-white border border-slate-200 border-dashed rounded-xl text-center space-y-1 text-xs text-slate-500">
                        <p className="font-semibold text-slate-800">No staged evidence linked to {lo.id} yet</p>
                        <p>Stage a new Mini-CEX, CbD, DOPS, or Gibbs Reflection tagged with this Learning Outcome.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {linkedWpbas.map(w => (
                          <div key={w.id} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5 text-xs shadow-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#0369a1] text-[10px] bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200 flex items-center gap-1">
                                <ClipboardCheck className="w-3 h-3" />
                                {w.type}
                              </span>
                              <span className="text-[10px] text-slate-500">{w.date}</span>
                            </div>
                            <h4 className="font-semibold text-slate-900 line-clamp-1">{w.title}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1">Assessor: {w.assessorName}</p>
                          </div>
                        ))}

                        {linkedReflections.map(r => (
                          <div key={r.id} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5 text-xs shadow-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-emerald-800 text-[10px] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                Reflection
                              </span>
                              <span className="text-[10px] text-slate-500">{r.date}</span>
                            </div>
                            <h4 className="font-semibold text-slate-900 line-clamp-1">{r.title}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{r.category}</p>
                          </div>
                        ))}

                        {linkedProcedures.map(p => (
                          <div key={p.id} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5 text-xs shadow-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-purple-800 text-[10px] bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200 flex items-center gap-1">
                                <Syringe className="w-3 h-3" />
                                Procedure
                              </span>
                              <span className="text-[10px] text-slate-500">{p.date}</span>
                            </div>
                            <h4 className="font-semibold text-slate-900 line-clamp-1">{p.procedureName}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{p.supervisionLevel} • {p.supervisorName}</p>
                          </div>
                        ))}

                        {linkedPdp.map(g => (
                          <div key={g.id} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5 text-xs shadow-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-800 text-[10px] bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                PDP Goal
                              </span>
                              <span className="text-[10px] text-slate-500">Target: {g.targetDate}</span>
                            </div>
                            <h4 className="font-semibold text-slate-900 line-clamp-1">{g.title}</h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1">Status: {g.status}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
