import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle,
  RefreshCw,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { FullPortfolioState, ReflectiveNote } from '../types';
import { RCPCH_LEARNING_OUTCOMES } from '../data/rcpchCurriculum';
import { formatReflectionForKaizen } from '../lib/githubSync';

interface ReflectionModuleProps {
  state: FullPortfolioState;
  onUpdateState: (newState: FullPortfolioState) => void;
  initialNewWithTag?: string | null;
  onClearInitialTag?: () => void;
}

export const ReflectionModule: React.FC<ReflectionModuleProps> = ({
  state,
  onUpdateState,
  initialNewWithTag,
  onClearInitialTag,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(!!initialNewWithTag);
  const [editingRef, setEditingRef] = useState<ReflectiveNote | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // AI Assistant in-form states
  const [rawNotesInput, setRawNotesInput] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [isAnonymising, setIsAnonymising] = useState(false);
  const [anonymiseResult, setAnonymiseResult] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ReflectiveNote>>({
    title: '',
    date: new Date().toISOString().slice(0, 10),
    category: 'Clinical Incident / Case',
    description: '',
    feelings: '',
    evaluation: '',
    analysis: '',
    conclusion: '',
    actionPlan: '',
    learningPoints: '',
    curriculumTags: initialNewWithTag ? [initialNewWithTag] : ['LO1', 'LO2'],
    anonymisationChecked: true,
    isReadyForKaizen: true
  });

  const handleOpenNew = (defaultTag?: string) => {
    setEditingRef(null);
    setRawNotesInput('');
    setAnonymiseResult(null);
    setFormData({
      title: '',
      date: new Date().toISOString().slice(0, 10),
      category: 'Clinical Incident / Case',
      description: '',
      feelings: '',
      evaluation: '',
      analysis: '',
      conclusion: '',
      actionPlan: '',
      learningPoints: '',
      curriculumTags: defaultTag ? [defaultTag] : ['LO1', 'LO2'],
      anonymisationChecked: true,
      isReadyForKaizen: true
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (ref: ReflectiveNote) => {
    setEditingRef(ref);
    setRawNotesInput('');
    setAnonymiseResult(null);
    setFormData({ ...ref });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this reflective practice note?')) {
      onUpdateState({
        ...state,
        reflections: state.reflections.filter(r => r.id !== id)
      });
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      alert('Please provide at least a title and event description.');
      return;
    }

    const nowIso = new Date().toISOString();

    if (editingRef) {
      const updatedList = state.reflections.map(r => {
        if (r.id === editingRef.id) {
          return {
            ...r,
            ...(formData as ReflectiveNote),
            updatedAt: nowIso
          };
        }
        return r;
      });
      onUpdateState({ ...state, reflections: updatedList });
    } else {
      const newRef: ReflectiveNote = {
        id: `ref-${Date.now()}`,
        ...(formData as Required<ReflectiveNote>),
        createdAt: nowIso,
        updatedAt: nowIso
      };
      onUpdateState({
        ...state,
        reflections: [newRef, ...state.reflections]
      });
    }

    setIsFormOpen(false);
    setEditingRef(null);
    if (onClearInitialTag) onClearInitialTag();
  };

  const handleCopyKaizen = (ref: ReflectiveNote) => {
    const formatted = formatReflectionForKaizen(ref);
    navigator.clipboard.writeText(formatted.fullKaizenBlock);
    setCopiedId(ref.id);
    setTimeout(() => setCopiedId(null), 2500);

    // Update state copied date
    const updated = state.reflections.map(r => {
      if (r.id === ref.id) {
        return { ...r, copiedToKaizenDate: new Date().toISOString().slice(0, 10) };
      }
      return r;
    });
    onUpdateState({ ...state, reflections: updated });
  };

  // AI Refine Action
  const handleAiRefine = async () => {
    if (!rawNotesInput && !formData.description) {
      alert('Please enter some raw notes or rough bullet points in the box below to refine.');
      return;
    }
    setIsRefining(true);
    try {
      const res = await fetch('/api/gemini/refine-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          rawNotes: rawNotesInput || formData.description,
          curriculumLevel: state.profile.curriculumLevel
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data;
        setFormData(prev => ({
          ...prev,
          title: prev.title || d.title,
          description: d.description || prev.description,
          feelings: d.feelings || prev.feelings,
          evaluation: d.evaluation || prev.evaluation,
          analysis: d.analysis || prev.analysis,
          conclusion: d.conclusion || prev.conclusion,
          actionPlan: d.actionPlan || prev.actionPlan,
          learningPoints: d.learningPoints || prev.learningPoints,
          curriculumTags: Array.from(new Set([...(prev.curriculumTags || []), ...(d.recommendedTags || [])])),
          anonymisationChecked: true
        }));
        alert('Reflection successfully structured with Gibbs Reflective Cycle & GMC compliance!');
      }
    } catch (err: any) {
      alert('Refining failed: ' + err.message);
    } finally {
      setIsRefining(false);
    }
  };

  // AI Anonymisation Scan
  const handleAnonymisationCheck = async () => {
    const fullText = `${formData.title}\n${formData.description}\n${formData.feelings}\n${formData.analysis}\n${formData.actionPlan}`;
    if (!fullText.trim()) return;
    setIsAnonymising(true);
    try {
      const res = await fetch('/api/gemini/anonymise-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: fullText })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAnonymiseResult(data.data);
      }
    } catch (err: any) {
      alert('Anonymisation check error: ' + err.message);
    } finally {
      setIsAnonymising(false);
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

  const filteredReflections = state.reflections.filter(r => {
    const matchesCat = filterCategory === 'ALL' || r.category === filterCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.analysis.toLowerCase().includes(q) ||
      r.curriculumTags.some(t => t.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Continuous Professional Development & Appraisal</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Reflective Practice & Clinical Encounter Notes
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Structure your clinical reflections around the Gibbs Cycle with GMC Good Medical Practice alignment and automatic patient confidentiality validation.
          </p>
        </div>

        <button
          id="open-new-ref-btn"
          onClick={() => handleOpenNew()}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Draft New Reflection</span>
        </button>
      </div>

      {/* Category Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            'ALL',
            'Clinical Incident / Case',
            'Communication & Conflict',
            'Significant Event Analysis (SEA)',
            'Leadership & Teamwork',
            'Ethical / Safeguarding Dilemma',
            'Wellbeing & Personal Development'
          ].map(c => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                filterCategory === c
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {c.split(' ')[0]} {c.includes('/') ? c.split('/')[1]?.trim() : ''}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search reflections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Reflection Cards Grid */}
      {filteredReflections.length === 0 ? (
        <div className="p-12 bg-white border border-slate-200 rounded-2xl text-center space-y-3 shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-base font-semibold text-slate-800">No reflections in this category</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Draft a clinical reflection using the Gibbs Reflective Cycle to demonstrate deep clinical reasoning and ethical practice for ARCP.
          </p>
          <button
            onClick={() => handleOpenNew()}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Reflection</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredReflections.map((r) => {
            const isCopied = copiedId === r.id;
            return (
              <div
                key={r.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between transition-all"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {r.category}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{r.date}</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5" /> GMC Anonymised
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      {r.title}
                    </h2>
                  </div>

                  {/* Gibbs Cycle Excerpt */}
                  <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider block mb-0.5">
                        Description (What Happened):
                      </span>
                      <p className="text-slate-700 line-clamp-2 leading-relaxed">
                        {r.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-sky-800 font-semibold block">Analysis & Sense-Making:</span>
                        <p className="text-slate-600 line-clamp-2">{r.analysis || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-emerald-800 font-semibold block">Action Plan / Learning:</span>
                        <p className="text-slate-600 line-clamp-2">{r.actionPlan || r.learningPoints || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Curriculum Tags */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Mapped LOs:</span>
                    {r.curriculumTags.map(tag => (
                      <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-emerald-800 border border-slate-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleOpenEdit(r)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs transition-colors cursor-pointer"
                      title="Edit Reflection"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 text-xs transition-colors cursor-pointer"
                      title="Delete Reflection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleCopyKaizen(r)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
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

      {/* Reflection Modal / Drawer */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {editingRef ? 'Edit Reflective Note' : 'Draft New Structured Gibbs Reflection'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Follows the 6 stages of the Gibbs Reflective Cycle with GMC Good Medical Practice compliance
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* AI Assistant Quick Polisher Bar */}
            <div className="bg-sky-50 border-b border-sky-100 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#0369a1] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#0369a1]" />
                  AI Reflection Refiner (Paste rough bullet points or voice-to-text here):
                </span>
                <button
                  type="button"
                  onClick={handleAiRefine}
                  disabled={isRefining}
                  className="px-3 py-1 bg-[#0369a1] hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isRefining ? 'Structuring into Gibbs Cycle...' : 'Convert to Gibbs Cycle'}</span>
                </button>
              </div>
              <textarea
                rows={2}
                placeholder="e.g. 2yo came in with wheeze, parents were very stressed and shouting. I gave salbutamol and sat down with them, realized they ran out of inhalers at home. Learned about prescribing social history..."
                value={rawNotesInput}
                onChange={(e) => setRawNotesInput(e.target.value)}
                className="w-full bg-white border border-sky-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-600"
              />
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveForm} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Category, Title & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    <option value="Clinical Incident / Case">Clinical Incident / Case</option>
                    <option value="Communication & Conflict">Communication & Conflict</option>
                    <option value="Complaints & Feedback">Complaints & Feedback</option>
                    <option value="Significant Event Analysis (SEA)">Significant Event Analysis (SEA)</option>
                    <option value="Leadership & Teamwork">Leadership & Teamwork</option>
                    <option value="Ethical / Safeguarding Dilemma">Ethical / Safeguarding Dilemma</option>
                    <option value="Wellbeing & Personal Development">Wellbeing & Personal Development</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Reflection Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Navigating Parental Anxiety & Communication in Acute Resuscitation"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Gibbs Cycle Fields */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-1">
                    1. Description: What happened? (Anonymised clinical event) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe the clinical context, sequence of events, and who was involved (strictly no names/dates of birth)..."
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-sky-800 block mb-1">
                      2. Feelings: What were you thinking and feeling?
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Your emotional reaction, uncertainty, cognitive load, team dynamics..."
                      value={formData.feelings || ''}
                      onChange={(e) => setFormData({ ...formData, feelings: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-amber-800 block mb-1">
                      3. Evaluation: What was good and bad about the experience?
                    </label>
                    <textarea
                      rows={3}
                      placeholder="What worked well, what was difficult, positive outcomes, near misses..."
                      value={formData.evaluation || ''}
                      onChange={(e) => setFormData({ ...formData, evaluation: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-sky-800 block mb-1">
                      4. Analysis: What sense can you make of the situation?
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Clinical guidelines, human factors, communication theory, system issues..."
                      value={formData.analysis || ''}
                      onChange={(e) => setFormData({ ...formData, analysis: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-teal-800 block mb-1">
                      5. Conclusion: What else could you have done?
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Alternative approaches, earlier senior escalation, different resources..."
                      value={formData.conclusion || ''}
                      onChange={(e) => setFormData({ ...formData, conclusion: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-emerald-800 block mb-1">
                    6. Action Plan: If it arose again, what would you do?
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Specific actionable steps, protocol changes, simulation training, audit..."
                    value={formData.actionPlan || ''}
                    onChange={(e) => setFormData({ ...formData, actionPlan: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-rose-800 block mb-1">
                    Key Learning Points (High-Yield Takeaways)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Key clinical or behavioural lessons in 1-2 sentences..."
                    value={formData.learningPoints || ''}
                    onChange={(e) => setFormData({ ...formData, learningPoints: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Anonymisation Scanner Tool */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-900">GMC Confidentiality & Anonymisation Guardian</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAnonymisationCheck}
                    disabled={isAnonymising}
                    className="text-xs text-[#0369a1] hover:text-sky-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isAnonymising ? 'animate-spin' : ''}`} />
                    <span>{isAnonymising ? 'Scanning...' : 'Verify Anonymisation'}</span>
                  </button>
                </div>
                {anonymiseResult && (
                  <div className={`p-2.5 rounded-lg text-xs border ${
                    anonymiseResult.isFullyAnonymised
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}>
                    {anonymiseResult.isFullyAnonymised ? (
                      <span className="flex items-center gap-1 font-semibold text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Fully anonymised. Safe for Kaizen ePortfolio submission.
                      </span>
                    ) : (
                      <div>
                        <strong className="text-amber-800 block mb-1">Potential Identifiers Flagged:</strong>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {anonymiseResult.flaggedItems?.map((item: string, i: number) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Curriculum Mapping Checklist */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block">
                  Map to Progress+ 11 Learning Outcomes
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
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold shadow-2xs'
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

              {/* Modal Actions */}
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {editingRef ? 'Save Changes' : 'Stage Reflection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
