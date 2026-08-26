import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Filter, 
  ShieldCheck, 
  User, 
  Mail, 
  Building,
  CheckCircle
} from 'lucide-react';
import { FullPortfolioState, WPBARecord, WPBAKind, EntrustmentLevel } from '../types';
import { RCPCH_LEARNING_OUTCOMES, STANDARD_PROCEDURES } from '../data/rcpchCurriculum';
import { formatWpbaForKaizen } from '../lib/githubSync';

interface WpbaModuleProps {
  state: FullPortfolioState;
  onUpdateState: (newState: FullPortfolioState) => void;
  initialNewWithTag?: string | null;
  onClearInitialTag?: () => void;
}

export const WpbaModule: React.FC<WpbaModuleProps> = ({
  state,
  onUpdateState,
  initialNewWithTag,
  onClearInitialTag,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState<boolean>(!!initialNewWithTag);
  const [editingWpba, setEditingWpba] = useState<WPBARecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [aiTaggingLoading, setAiTaggingLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<WPBARecord>>({
    type: 'Mini-CEX',
    title: '',
    date: new Date().toISOString().slice(0, 10),
    clinicalSetting: 'Inpatient Ward',
    patientAgeGroup: '1-12 months (Infant)',
    assessorName: '',
    assessorRole: 'Consultant',
    assessorEmail: '',
    caseSummary: '',
    whatWentWell: '',
    areasForDevelopment: '',
    agreedActionPlan: '',
    entrustmentLevel: 'Level 3: Indirect supervision (independently acting, supervisor accessible)',
    curriculumTags: initialNewWithTag ? [initialNewWithTag] : ['LO1', 'LO4'],
    isReadyForKaizen: true,
    procedureName: '',
    procedureType: 'Diagnostic'
  });

  const handleOpenNew = (defaultTag?: string) => {
    setEditingWpba(null);
    setFormData({
      type: 'Mini-CEX',
      title: '',
      date: new Date().toISOString().slice(0, 10),
      clinicalSetting: 'Inpatient Ward',
      patientAgeGroup: '1-12 months (Infant)',
      assessorName: '',
      assessorRole: 'Consultant',
      assessorEmail: '',
      caseSummary: '',
      whatWentWell: '',
      areasForDevelopment: '',
      agreedActionPlan: '',
      entrustmentLevel: 'Level 3: Indirect supervision (independently acting, supervisor accessible)',
      curriculumTags: defaultTag ? [defaultTag] : ['LO1', 'LO4'],
      isReadyForKaizen: true,
      procedureName: '',
      procedureType: 'Diagnostic'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (wpba: WPBARecord) => {
    setEditingWpba(wpba);
    setFormData({ ...wpba });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this staged WPBA assessment?')) {
      onUpdateState({
        ...state,
        wpbas: state.wpbas.filter(w => w.id !== id)
      });
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.caseSummary) {
      alert('Please provide at least a title and case description.');
      return;
    }

    const nowIso = new Date().toISOString();

    if (editingWpba) {
      const updatedList = state.wpbas.map(w => {
        if (w.id === editingWpba.id) {
          return {
            ...w,
            ...(formData as WPBARecord),
            updatedAt: nowIso
          };
        }
        return w;
      });
      onUpdateState({ ...state, wpbas: updatedList });
    } else {
      const newRecord: WPBARecord = {
        id: `wpba-${Date.now()}`,
        ...(formData as Required<WPBARecord>),
        createdAt: nowIso,
        updatedAt: nowIso
      };
      onUpdateState({
        ...state,
        wpbas: [newRecord, ...state.wpbas]
      });
    }

    setIsFormOpen(false);
    setEditingWpba(null);
    if (onClearInitialTag) onClearInitialTag();
  };

  const handleCopyKaizenBlock = (wpba: WPBARecord) => {
    const formatted = formatWpbaForKaizen(wpba);
    navigator.clipboard.writeText(formatted.fullKaizenBlock);
    setCopiedId(wpba.id);
    setTimeout(() => setCopiedId(null), 2500);

    // Update copied status
    const updated = state.wpbas.map(w => {
      if (w.id === wpba.id) {
        return { ...w, copiedToKaizenDate: new Date().toISOString().slice(0, 10) };
      }
      return w;
    });
    onUpdateState({ ...state, wpbas: updated });
  };

  const handleAiAutoTag = async () => {
    if (!formData.caseSummary) {
      alert('Please fill in the Case Summary first so the AI can analyze clinical competencies.');
      return;
    }
    setAiTaggingLoading(true);
    try {
      const res = await fetch('/api/gemini/curriculum-tagger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `Title: ${formData.title}\n\nEncounter Summary: ${formData.caseSummary}\nWhat Went Well: ${formData.whatWentWell}\nAction Plan: ${formData.agreedActionPlan}`,
          type: formData.type
        })
      });
      const data = await res.json();
      if (data.success && data.data?.recommendedTags) {
        setFormData(prev => ({
          ...prev,
          curriculumTags: Array.from(new Set([...(prev.curriculumTags || []), ...data.data.recommendedTags]))
        }));
        alert(`AI Curriculum Tagger added: ${data.data.recommendedTags.join(', ')}\nRationale: ${data.data.rationale || 'Aligned to clinical content'}`);
      }
    } catch (err: any) {
      console.error('AI tag error:', err);
      alert('Could not auto-tag: ' + err.message);
    } finally {
      setAiTaggingLoading(false);
    }
  };

  const toggleCurriculumTag = (tagId: string) => {
    const current = formData.curriculumTags || [];
    if (current.includes(tagId)) {
      setFormData({ ...formData, curriculumTags: current.filter(t => t !== tagId) });
    } else {
      setFormData({ ...formData, curriculumTags: [...current, tagId] });
    }
  };

  // Filtered List
  const filteredWpbas = state.wpbas.filter(w => {
    const matchesType = filterType === 'ALL' || w.type === filterType;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      w.title.toLowerCase().includes(q) ||
      w.caseSummary.toLowerCase().includes(q) ||
      w.assessorName.toLowerCase().includes(q) ||
      w.curriculumTags.some(t => t.toLowerCase().includes(q));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#0369a1] text-xs font-semibold uppercase tracking-wider mb-1">
            <ClipboardCheck className="w-4 h-4" />
            <span>Supervised Learning Events & Assessments</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Work Place Based Assessments (WPBAs)
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Stage, draft, and tag Mini-CEX, CbD, DOPS, ACAT, and Safeguarding assessments matching the official RCPCH risr/advance (Kaizen) layout.
          </p>
        </div>

        <button
          id="open-new-wpba-modal-btn"
          onClick={() => handleOpenNew()}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#0369a1] hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Stage New WPBA Form</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
        {/* Type Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'Mini-CEX', 'CbD', 'DOPS', 'ACAT', 'SLE', 'CBD-Safeguarding'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                filterType === t
                  ? 'bg-[#0369a1] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search assessments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* WPBA Grid Cards */}
      {filteredWpbas.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center space-y-3 shadow-xs">
          <ClipboardCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-base font-semibold text-slate-800">No WPBAs found in this filter</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click "Stage New WPBA Form" to draft an assessment and map it to your Progress+ curriculum outcomes.
          </p>
          <button
            onClick={() => handleOpenNew()}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#0369a1] hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Assessment</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredWpbas.map((w) => {
            const isCopied = copiedId === w.id;
            return (
              <div
                key={w.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between transition-all"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-sky-50 text-[#0369a1] border border-sky-200">
                        {w.type}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {w.date}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • {w.clinicalSetting}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      {w.copiedToKaizenDate ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Copied {w.copiedToKaizenDate}
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                          Staged (Uncopied)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Age */}
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      {w.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Patient: <strong className="text-slate-700">{w.patientAgeGroup}</strong> • Assessor: <strong className="text-slate-700">{w.assessorName}</strong> ({w.assessorRole})
                    </p>
                  </div>

                  {/* Case Summary Preview */}
                  <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider block mb-0.5">
                        Description of Encounter:
                      </span>
                      <p className="text-slate-700 line-clamp-3 leading-relaxed">
                        {w.caseSummary}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-emerald-700 font-semibold block">What Went Well:</span>
                        <p className="text-slate-600 line-clamp-2">{w.whatWentWell || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-amber-700 font-semibold block">Agreed Action Plan:</span>
                        <p className="text-slate-600 line-clamp-2">{w.agreedActionPlan || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Entrustment & Tags */}
                  <div className="space-y-2">
                    <div className="text-[11px] text-sky-800 font-medium bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-lg">
                      <strong>Entrustment:</strong> {w.entrustmentLevel}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">LOs:</span>
                      {w.curriculumTags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-sky-800 border border-slate-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleOpenEdit(w)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs transition-colors cursor-pointer"
                      title="Edit Staged Assessment"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(w.id)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 text-xs transition-colors cursor-pointer"
                      title="Delete Staged Assessment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleCopyKaizenBlock(w)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-[#0369a1] hover:bg-sky-700 text-white shadow-xs'
                    }`}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Kaizen Form Copied!' : 'Copy for Kaizen'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WPBA Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {editingWpba ? 'Edit Staged WPBA Assessment' : 'Stage New Work Place Based Assessment'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prepare full clinical encounter feedback matching official RCPCH risr/advance fields
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveForm} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Type, Title & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Assessment Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as WPBAKind })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
                  >
                    <option value="Mini-CEX">Mini-CEX (Clinical Evaluation)</option>
                    <option value="CbD">CbD (Case-Based Discussion)</option>
                    <option value="DOPS">DOPS (Procedural Skills)</option>
                    <option value="ACAT">ACAT (Acute Care Assessment)</option>
                    <option value="SLE">SLE (Supervised Learning Event)</option>
                    <option value="HAT">HAT (Handover Assessment)</option>
                    <option value="CBD-Safeguarding">CBD-Safeguarding</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Case / Assessment Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acute assessment of 3-month-old with severe bronchiolitis"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Setting, Patient Age & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Date of Encounter</label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Clinical Setting</label>
                  <select
                    value={formData.clinicalSetting}
                    onChange={(e) => setFormData({ ...formData, clinicalSetting: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
                  >
                    <option value="Inpatient Ward">Inpatient Ward</option>
                    <option value="Neonatal Unit (NICU/SCBU)">Neonatal Unit (NICU/SCBU)</option>
                    <option value="Paediatric Emergency (ED)">Paediatric Emergency (ED)</option>
                    <option value="Outpatient Clinic">Outpatient Clinic</option>
                    <option value="PICU / HDU">PICU / HDU</option>
                    <option value="Delivery Suite / Resus">Delivery Suite / Resus</option>
                    <option value="Community / Safeguarding">Community / Safeguarding</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Patient Age Group</label>
                  <select
                    value={formData.patientAgeGroup}
                    onChange={(e) => setFormData({ ...formData, patientAgeGroup: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
                  >
                    <option value="<28 days (Neonate)">&lt;28 days (Neonate)</option>
                    <option value="1-12 months (Infant)">1-12 months (Infant)</option>
                    <option value="1-4 years (Toddler)">1-4 years (Toddler)</option>
                    <option value="5-11 years (Child)">5-11 years (Child)</option>
                    <option value="12-18 years (Adolescent)">12-18 years (Adolescent)</option>
                  </select>
                </div>
              </div>

              {/* DOPS Specific Fields */}
              {formData.type === 'DOPS' && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-sky-800 block mb-1">Procedure Name</label>
                    <select
                      value={formData.procedureName || ''}
                      onChange={(e) => setFormData({ ...formData, procedureName: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                    >
                      <option value="">Select standard procedure...</option>
                      {STANDARD_PROCEDURES.map(p => (
                        <option key={p.name} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-sky-800 block mb-1">Procedure Type</label>
                    <select
                      value={formData.procedureType || 'Diagnostic'}
                      onChange={(e) => setFormData({ ...formData, procedureType: e.target.value as any })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                    >
                      <option value="Diagnostic">Diagnostic</option>
                      <option value="Therapeutic">Therapeutic</option>
                      <option value="Emergency Resuscitation">Emergency Resuscitation</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Assessor Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Assessor Name</label>
                  <input
                    type="text"
                    placeholder="Dr. Full Name"
                    value={formData.assessorName || ''}
                    onChange={(e) => setFormData({ ...formData, assessorName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Assessor Role</label>
                  <select
                    value={formData.assessorRole}
                    onChange={(e) => setFormData({ ...formData, assessorRole: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
                  >
                    <option value="Consultant">Consultant</option>
                    <option value="ST6-8 Senior Registrar">ST6-8 Senior Registrar</option>
                    <option value="Advanced Clinical Practitioner">Advanced Clinical Practitioner</option>
                    <option value="Clinical Nurse Specialist">Clinical Nurse Specialist</option>
                    <option value="Senior Fellow">Senior Fellow</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Assessor NHS Email</label>
                  <input
                    type="email"
                    placeholder="assessor@nhs.net"
                    value={formData.assessorEmail || ''}
                    onChange={(e) => setFormData({ ...formData, assessorEmail: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Kaizen Core Fields */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-800">
                      1. Description of Clinical Encounter / Case Summary *
                    </label>
                    <button
                      type="button"
                      onClick={handleAiAutoTag}
                      disabled={aiTaggingLoading}
                      className="text-[11px] text-[#0369a1] hover:text-sky-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{aiTaggingLoading ? 'Analyzing...' : 'Auto-Map LOs with AI'}</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    required
                    placeholder="Detailed account of presentation, findings, clinical reasoning, and investigations (anonymised - no patient names/numbers)..."
                    value={formData.caseSummary || ''}
                    onChange={(e) => setFormData({ ...formData, caseSummary: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-emerald-800 block mb-1">
                    2. What Went Well (Assessor Positive Feedback)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Specific strengths, communication approach, diagnostic accuracy, procedure safety..."
                    value={formData.whatWentWell || ''}
                    onChange={(e) => setFormData({ ...formData, whatWentWell: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-amber-800 block mb-1">
                    3. Areas for Development (Constructive Feedback)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Learning gaps, guideline nuances, speed, escalation triggers..."
                    value={formData.areasForDevelopment || ''}
                    onChange={(e) => setFormData({ ...formData, areasForDevelopment: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-sky-800 block mb-1">
                    4. Agreed Action Plan
                  </label>
                  <textarea
                    rows={2}
                    placeholder="SMART next steps, guideline reading, subsequent supervised cases..."
                    value={formData.agreedActionPlan || ''}
                    onChange={(e) => setFormData({ ...formData, agreedActionPlan: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Entrustment Level */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Assessed Entrustment / Supervision Level
                </label>
                <select
                  value={formData.entrustmentLevel}
                  onChange={(e) => setFormData({ ...formData, entrustmentLevel: e.target.value as EntrustmentLevel })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
                >
                  <option value="Level 1: Direct supervision required (observer/assisted)">
                    Level 1: Direct supervision required (observer / assisted)
                  </option>
                  <option value="Level 2: Direct supervision available immediately (supervised)">
                    Level 2: Direct supervision available immediately (supervised in room)
                  </option>
                  <option value="Level 3: Indirect supervision (independently acting, supervisor accessible)">
                    Level 3: Indirect supervision (independently acting, supervisor accessible in hospital)
                  </option>
                  <option value="Level 4: Independent / Able to supervise and teach others">
                    Level 4: Independent / Able to supervise and teach others
                  </option>
                </select>
              </div>

              {/* Curriculum Tagging Checklist */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Map to Progress+ 11 Learning Outcomes (Select all relevant)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {RCPCH_LEARNING_OUTCOMES.map(lo => {
                    const isSelected = (formData.curriculumTags || []).includes(lo.id);
                    return (
                      <button
                        key={lo.id}
                        type="button"
                        onClick={() => toggleCurriculumTag(lo.id)}
                        className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center space-x-2 ${
                          isSelected
                            ? 'bg-sky-50 border-sky-400 text-sky-900 font-semibold shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: lo.color }}
                        />
                        <span className="truncate">{lo.id}: {lo.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0369a1] hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {editingWpba ? 'Save Changes' : 'Stage WPBA Form'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
