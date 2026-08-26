import React, { useState } from 'react';
import { 
  Target, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Trash2, 
  Calendar,
  Layers
} from 'lucide-react';
import { FullPortfolioState, PDPGoal } from '../types';
import { RCPCH_LEARNING_OUTCOMES } from '../data/rcpchCurriculum';

interface PdpModuleProps {
  state: FullPortfolioState;
  onUpdateState: (newState: FullPortfolioState) => void;
}

export const PdpModule: React.FC<PdpModuleProps> = ({
  state,
  onUpdateState,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<PDPGoal | null>(null);
  const [aiPromptTopic, setAiPromptTopic] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const [formData, setFormData] = useState<Partial<PDPGoal>>({
    title: '',
    targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    category: 'Clinical Skills',
    smartObjective: '',
    actionsToAchieve: '',
    evidenceToDemonstrate: '',
    curriculumTags: ['LO1', 'LO4'],
    status: 'Active / In Progress'
  });

  const handleOpenNew = () => {
    setEditingGoal(null);
    setAiPromptTopic('');
    setFormData({
      title: '',
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      category: 'Clinical Skills',
      smartObjective: '',
      actionsToAchieve: '',
      evidenceToDemonstrate: '',
      curriculumTags: ['LO1', 'LO4'],
      status: 'Active / In Progress'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (goal: PDPGoal) => {
    setEditingGoal(goal);
    setFormData({ ...goal });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this PDP objective?')) {
      onUpdateState({
        ...state,
        pdpGoals: state.pdpGoals.filter(g => g.id !== id)
      });
    }
  };

  const handleToggleStatus = (goal: PDPGoal) => {
    const newStatus = goal.status === 'Achieved' ? 'Active / In Progress' : 'Achieved';
    const updated = state.pdpGoals.map(g => {
      if (g.id === goal.id) {
        return {
          ...g,
          status: newStatus,
          completionDate: newStatus === 'Achieved' ? new Date().toISOString().slice(0, 10) : undefined
        };
      }
      return g;
    });
    onUpdateState({ ...state, pdpGoals: updated });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.smartObjective) return;

    if (editingGoal) {
      const updated = state.pdpGoals.map(g => {
        if (g.id === editingGoal.id) {
          return { ...g, ...(formData as PDPGoal) };
        }
        return g;
      });
      onUpdateState({ ...state, pdpGoals: updated });
    } else {
      const newGoal: PDPGoal = {
        id: `pdp-${Date.now()}`,
        ...(formData as Required<PDPGoal>),
        createdAt: new Date().toISOString()
      };
      onUpdateState({
        ...state,
        pdpGoals: [newGoal, ...state.pdpGoals]
      });
    }

    setIsFormOpen(false);
    setEditingGoal(null);
  };

  const handleAiSmartGenerate = async () => {
    if (!aiPromptTopic) {
      alert('Enter a learning area or clinical topic first (e.g. Neonatal ventilation, Paediatric diabetes DKA protocol, Quality improvement audit).');
      return;
    }
    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/gemini/smart-pdp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiPromptTopic,
          category: formData.category,
          targetLevel: state.profile.trainingGrade
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data;
        setFormData(prev => ({
          ...prev,
          title: d.title || prev.title,
          smartObjective: d.smartObjective || prev.smartObjective,
          actionsToAchieve: d.actionsToAchieve || prev.actionsToAchieve,
          evidenceToDemonstrate: d.evidenceToDemonstrate || prev.evidenceToDemonstrate,
          curriculumTags: Array.from(new Set([...(prev.curriculumTags || []), ...(d.curriculumTags || [])]))
        }));
      }
    } catch (err: any) {
      alert('AI generation failed: ' + err.message);
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Target className="w-4 h-4" />
            <span>Educational Governance & Appraisal</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Personal Development Plan (PDP)
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Maintain SMART objectives (Specific, Measurable, Achievable, Relevant, Time-bound) agreed with your Educational Supervisor for ARCP sign-off.
          </p>
        </div>

        <button
          id="add-pdp-btn"
          onClick={handleOpenNew}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add SMART PDP Goal</span>
        </button>
      </div>

      {/* Grid of PDP Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.pdpGoals.map((g) => {
          const isAchieved = g.status === 'Achieved';
          return (
            <div
              key={g.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between transition-all ${
                isAchieved ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                {/* Badges */}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    {g.category}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400" /> Target: {g.targetDate}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h2 className={`text-base font-bold tracking-tight ${isAchieved ? 'text-emerald-900' : 'text-slate-900'}`}>
                    {g.title}
                  </h2>
                </div>

                {/* SMART Objective */}
                <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider block mb-0.5">
                      SMART Objective:
                    </span>
                    <p className="text-slate-700 leading-relaxed">
                      {g.smartObjective}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 space-y-1 text-[11px]">
                    <p><strong className="text-sky-800">Actions Planned:</strong> <span className="text-slate-600">{g.actionsToAchieve}</span></p>
                    <p><strong className="text-emerald-800">Required Evidence:</strong> <span className="text-slate-600">{g.evidenceToDemonstrate}</span></p>
                  </div>
                </div>

                {/* Curriculum Tags */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Mapped LOs:</span>
                  {g.curriculumTags.map(t => (
                    <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-amber-900 border border-slate-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleOpenEdit(g)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 text-xs transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleToggleStatus(g)}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isAchieved
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{isAchieved ? 'Marked as Achieved' : 'Mark as Achieved'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden my-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {editingGoal ? 'Edit PDP Goal' : 'Stage SMART PDP Goal'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* AI Generator Bar */}
            <div className="bg-amber-50 border-b border-amber-200 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  AI SMART Goal Assistant:
                </span>
                <button
                  type="button"
                  onClick={handleAiSmartGenerate}
                  disabled={isAiGenerating}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{isAiGenerating ? 'Drafting...' : 'Generate SMART Goal'}</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. Lead neonatal resuscitations on on-call shifts, complete paediatric DKA audit..."
                value={aiPromptTopic}
                onChange={(e) => setAiPromptTopic(e.target.value)}
                className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-600"
              />
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Goal Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Achieve independence in neonatal intubation and long line placement"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-600 focus:bg-white"
                  >
                    <option value="Clinical Skills">Clinical Skills</option>
                    <option value="Procedures">Procedures</option>
                    <option value="Management & Leadership">Management & Leadership</option>
                    <option value="Teaching & Education">Teaching & Education</option>
                    <option value="Research & QIP">Research & QIP</option>
                    <option value="Exam Preparation">Exam Preparation</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={formData.targetDate || ''}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Current Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-600 focus:bg-white"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active / In Progress">Active / In Progress</option>
                    <option value="Achieved">Achieved</option>
                    <option value="Carried Forward">Carried Forward</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">SMART Objective Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specific, Measurable, Achievable, Relevant, Time-bound objective details..."
                  value={formData.smartObjective || ''}
                  onChange={(e) => setFormData({ ...formData, smartObjective: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Actions to Achieve This Goal</label>
                <textarea
                  rows={2}
                  placeholder="Simulation training, reading guidelines, clinical shifts, supervisor reviews..."
                  value={formData.actionsToAchieve || ''}
                  onChange={(e) => setFormData({ ...formData, actionsToAchieve: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Evidence Required for Sign-Off</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 3x DOPS forms, 1x reflective note, simulation debrief report..."
                  value={formData.evidenceToDemonstrate || ''}
                  onChange={(e) => setFormData({ ...formData, evidenceToDemonstrate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-600 focus:bg-white"
                />
              </div>

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
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Save PDP Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
