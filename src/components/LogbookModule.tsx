import React, { useState } from 'react';
import { 
  Syringe, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Filter, 
  Activity,
  UserCheck
} from 'lucide-react';
import { FullPortfolioState, ProcedureLogItem } from '../types';
import { STANDARD_PROCEDURES } from '../data/rcpchCurriculum';

interface LogbookModuleProps {
  state: FullPortfolioState;
  onUpdateState: (newState: FullPortfolioState) => void;
}

export const LogbookModule: React.FC<LogbookModuleProps> = ({
  state,
  onUpdateState,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProcedureLogItem | null>(null);

  const [formData, setFormData] = useState<Partial<ProcedureLogItem>>({
    procedureName: 'Lumbar Puncture (Neonate <28 days)',
    category: 'Neonatal',
    date: new Date().toISOString().slice(0, 10),
    patientAge: '3 days',
    supervisionLevel: 'Independent',
    location: 'Neonatal Unit (NICU)',
    indication: 'Suspected late-onset sepsis screen',
    notes: 'Clear CSF on first pass, no blood contamination. Sent for microscopy, culture, viral PCR and glucose.',
    supervisorName: state.profile.clinicalSupervisor || 'Dr. Marcus Thorne',
    curriculumTags: ['LO3']
  });

  const handleOpenNew = () => {
    setEditingItem(null);
    setFormData({
      procedureName: 'Lumbar Puncture (Neonate <28 days)',
      category: 'Neonatal',
      date: new Date().toISOString().slice(0, 10),
      patientAge: '14 days',
      supervisionLevel: 'Independent',
      location: 'Neonatal Unit (NICU)',
      indication: 'Sepsis screen',
      notes: '',
      supervisorName: state.profile.clinicalSupervisor || '',
      curriculumTags: ['LO3']
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (item: ProcedureLogItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this procedure entry?')) {
      onUpdateState({
        ...state,
        procedureLogs: state.procedureLogs.filter(p => p.id !== id)
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.procedureName) return;

    if (editingItem) {
      const updated = state.procedureLogs.map(p => {
        if (p.id === editingItem.id) {
          return { ...p, ...(formData as ProcedureLogItem) };
        }
        return p;
      });
      onUpdateState({ ...state, procedureLogs: updated });
    } else {
      const newItem: ProcedureLogItem = {
        id: `proc-${Date.now()}`,
        ...(formData as Required<ProcedureLogItem>)
      };
      onUpdateState({
        ...state,
        procedureLogs: [newItem, ...state.procedureLogs]
      });
    }

    setIsFormOpen(false);
    setEditingItem(null);
  };

  const filteredLogs = state.procedureLogs.filter(p => {
    const matchesCat = filterCategory === 'ALL' || p.category === filterCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      p.procedureName.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.notes.toLowerCase().includes(q) ||
      p.supervisorName.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  // Calculate stats
  const totalProcedures = state.procedureLogs.length;
  const independentCount = state.procedureLogs.filter(p => p.supervisionLevel === 'Independent' || p.supervisionLevel === 'Supervising Others').length;
  const neonatalCount = state.procedureLogs.filter(p => p.category === 'Neonatal').length;
  const resusCount = state.procedureLogs.filter(p => p.category === 'Paediatric Resuscitation').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#0369a1] text-xs font-semibold uppercase tracking-wider mb-1">
            <Syringe className="w-4 h-4" />
            <span>Procedural Competency Tracker</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Clinical Procedures & Skills Logbook
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Log practical procedures in Neonatal, Resuscitation, Inpatient, and Safeguarding settings to satisfy Level 1/2/3 DOPS and ARCP requirements.
          </p>
        </div>

        <button
          id="log-procedure-btn"
          onClick={handleOpenNew}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#0369a1] hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Procedure</span>
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Logged</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalProcedures}</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Independent / Teaching</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{independentCount}</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Neonatal Skills</div>
          <div className="text-2xl font-bold text-[#0369a1] mt-1">{neonatalCount}</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Resuscitation Skills</div>
          <div className="text-2xl font-bold text-rose-700 mt-1">{resusCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-3.5 rounded-xl shadow-xs">
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'Neonatal', 'Paediatric Resuscitation', 'General Paediatric Inpatient', 'Emergency / Trauma', 'Safeguarding Medical'].map(c => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                filterCategory === c
                  ? 'bg-[#0369a1] text-white shadow-xs'
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
            placeholder="Search procedures, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Table of Procedures */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Procedure & Category</th>
                <th className="p-3.5">Patient Age</th>
                <th className="p-3.5">Supervision Level</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Supervisor</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 text-slate-500 whitespace-nowrap">{p.date}</td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-900">{p.procedureName}</div>
                    <div className="text-[10px] text-[#0369a1] font-semibold">{p.category}</div>
                    {p.notes && <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{p.notes}</div>}
                  </td>
                  <td className="p-3.5 whitespace-nowrap text-slate-600">{p.patientAge}</td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      p.supervisionLevel === 'Independent'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : p.supervisionLevel === 'Direct Supervision'
                        ? 'bg-sky-50 text-sky-800 border border-sky-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {p.supervisionLevel}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 whitespace-nowrap">{p.location}</td>
                  <td className="p-3.5 text-slate-700 font-medium whitespace-nowrap">{p.supervisorName}</td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                        title="Edit entry"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer border border-transparent hover:border-rose-100"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Procedure Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden my-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {editingItem ? 'Edit Procedure Log' : 'Log Clinical Procedure / Skill'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Standard Procedure</label>
                  <select
                    value={formData.procedureName}
                    onChange={(e) => {
                      const found = STANDARD_PROCEDURES.find(p => p.name === e.target.value);
                      setFormData({
                        ...formData,
                        procedureName: e.target.value,
                        category: (found?.category as any) || formData.category
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
                  >
                    {STANDARD_PROCEDURES.map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
                  >
                    <option value="Neonatal">Neonatal</option>
                    <option value="Paediatric Resuscitation">Paediatric Resuscitation</option>
                    <option value="General Paediatric Inpatient">General Paediatric Inpatient</option>
                    <option value="Emergency / Trauma">Emergency / Trauma</option>
                    <option value="Safeguarding Medical">Safeguarding Medical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Patient Age</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 weeks, 4 years"
                    value={formData.patientAge || ''}
                    onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Supervision Level</label>
                  <select
                    value={formData.supervisionLevel}
                    onChange={(e) => setFormData({ ...formData, supervisionLevel: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
                  >
                    <option value="Observed / Simulated">Observed / Simulated</option>
                    <option value="Assisted">Assisted</option>
                    <option value="Direct Supervision">Direct Supervision</option>
                    <option value="Independent">Independent</option>
                    <option value="Supervising Others">Supervising Others</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Location / Ward</label>
                  <input
                    type="text"
                    placeholder="e.g. NICU, Paediatric ED, Delivery Suite"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Supervisor Name</label>
                  <input
                    type="text"
                    placeholder="Dr. Supervisor"
                    value={formData.supervisorName || ''}
                    onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Indication</label>
                <input
                  type="text"
                  placeholder="e.g. Sepsis screen, Respiratory failure, IV access"
                  value={formData.indication || ''}
                  onChange={(e) => setFormData({ ...formData, indication: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Technical Notes / Observations</label>
                <textarea
                  rows={3}
                  placeholder="Needle gauge, number of passes, complications, CSF clarity, ETT size/depth, X-ray confirmation..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
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
                  className="px-5 py-2 bg-[#0369a1] hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
