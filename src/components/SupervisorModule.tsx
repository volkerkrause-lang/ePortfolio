import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  FileText, 
  Award,
  UserCheck
} from 'lucide-react';
import { FullPortfolioState, SupervisorMeeting } from '../types';

interface SupervisorModuleProps {
  state: FullPortfolioState;
  onUpdateState: (newState: FullPortfolioState) => void;
}

export const SupervisorModule: React.FC<SupervisorModuleProps> = ({
  state,
  onUpdateState,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<SupervisorMeeting | null>(null);

  const [formData, setFormData] = useState<Partial<SupervisorMeeting>>({
    type: 'Induction Meeting',
    date: new Date().toISOString().slice(0, 10),
    supervisorName: state.profile.educationalSupervisor || 'Dr. Eleanor Vance',
    supervisorRole: 'Educational Supervisor',
    hospital: state.profile.currentHospital || "Great Ormond Street Hospital for Children NHS Foundation Trust",
    summaryOfDiscussion: '',
    agreedPdpTargets: '',
    supervisorComments: 'Good engagement, trainee well prepared with clear learning objectives.',
    signedOff: true
  });

  const handleOpenNew = () => {
    setEditingMeeting(null);
    setFormData({
      type: 'Induction Meeting',
      date: new Date().toISOString().slice(0, 10),
      supervisorName: state.profile.educationalSupervisor || 'Dr. Eleanor Vance',
      supervisorRole: 'Educational Supervisor',
      hospital: state.profile.currentHospital,
      summaryOfDiscussion: '',
      agreedPdpTargets: '',
      supervisorComments: '',
      signedOff: true
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (m: SupervisorMeeting) => {
    setEditingMeeting(m);
    setFormData({ ...m });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this supervisor meeting record?')) {
      onUpdateState({
        ...state,
        supervisorMeetings: state.supervisorMeetings.filter(m => m.id !== id)
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supervisorName || !formData.summaryOfDiscussion) return;

    if (editingMeeting) {
      const updated = state.supervisorMeetings.map(m => {
        if (m.id === editingMeeting.id) {
          return { ...m, ...(formData as SupervisorMeeting) };
        }
        return m;
      });
      onUpdateState({ ...state, supervisorMeetings: updated });
    } else {
      const newM: SupervisorMeeting = {
        id: `meet-${Date.now()}`,
        ...(formData as Required<SupervisorMeeting>)
      };
      onUpdateState({
        ...state,
        supervisorMeetings: [newM, ...state.supervisorMeetings]
      });
    }

    setIsFormOpen(false);
    setEditingMeeting(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Supervision & Faculty Governance</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Supervisor Meetings & Educational Reviews
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Stage and record your Induction, Mid-Point, and End-of-Placement appraisal discussions with your Educational and Clinical Supervisors.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#0369a1] hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Stage New Meeting</span>
        </button>
      </div>

      {/* Supervisors Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center space-x-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-500">Educational Supervisor</div>
            <div className="text-sm font-bold text-slate-900">{state.profile.educationalSupervisor}</div>
            <div className="text-xs text-slate-500">GOSH Paediatric Intensive Care & General</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center space-x-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0369a1]">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-500">Clinical Supervisor</div>
            <div className="text-sm font-bold text-slate-900">{state.profile.clinicalSupervisor}</div>
            <div className="text-xs text-slate-500">Neonatal Intensive Care Unit (NICU)</div>
          </div>
        </div>
      </div>

      {/* List of Meetings */}
      <div className="space-y-4">
        {state.supervisorMeetings.map((m) => (
          <div
            key={m.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xs px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200">
                  {m.type}
                </span>
                <span className="text-xs text-slate-500 font-medium">{m.date}</span>
                <span className="text-xs text-slate-400">• {m.hospital}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Signed Off by {m.supervisorRole}
                </span>
                <button
                  onClick={() => handleOpenEdit(m)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-xs space-y-2">
              <div className="text-slate-600">
                <strong className="text-slate-900">Supervisor:</strong> {m.supervisorName} ({m.supervisorRole})
              </div>

              <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
                <div>
                  <span className="text-slate-500 font-semibold uppercase text-[10px] block mb-0.5">
                    Summary of Discussion:
                  </span>
                  <p className="text-slate-700 leading-relaxed">{m.summaryOfDiscussion}</p>
                </div>

                {m.agreedPdpTargets && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-amber-800 font-semibold block mb-0.5">Agreed PDP & Development Priorities:</span>
                    <p className="text-slate-600">{m.agreedPdpTargets}</p>
                  </div>
                )}

                {m.supervisorComments && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[#0369a1] font-semibold block mb-0.5">Supervisor Official Comments:</span>
                    <p className="text-slate-600 italic">"{m.supervisorComments}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden my-auto">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">
                {editingMeeting ? 'Edit Supervisor Meeting' : 'Record Supervisor Meeting'}
              </h2>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Meeting Review Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
                  >
                    <option value="Induction Meeting">Induction Meeting</option>
                    <option value="Mid-Point Review">Mid-Point Review</option>
                    <option value="End of Placement Review">End of Placement Review</option>
                    <option value="Ad-hoc Educational Meeting">Ad-hoc Educational Meeting</option>
                    <option value="Educational Supervisor's Report (ESR)">Educational Supervisor's Report (ESR)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Supervisor Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Eleanor Vance"
                    value={formData.supervisorName || ''}
                    onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-semibold block mb-1">Supervisor Role</label>
                  <select
                    value={formData.supervisorRole}
                    onChange={(e) => setFormData({ ...formData, supervisorRole: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
                  >
                    <option value="Educational Supervisor">Educational Supervisor</option>
                    <option value="Clinical Supervisor">Clinical Supervisor</option>
                    <option value="College Tutor">College Tutor</option>
                    <option value="Training Programme Director (TPD)">Training Programme Director (TPD)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Summary of Discussion *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Review of clinical caseload, on-call experience, progress towards 11 Learning Outcomes, WPBA targets, exam preparation..."
                  value={formData.summaryOfDiscussion || ''}
                  onChange={(e) => setFormData({ ...formData, summaryOfDiscussion: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Agreed PDP & Development Priorities</label>
                <textarea
                  rows={2}
                  placeholder="Key clinical priorities for the next placement block..."
                  value={formData.agreedPdpTargets || ''}
                  onChange={(e) => setFormData({ ...formData, agreedPdpTargets: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Supervisor Comments</label>
                <textarea
                  rows={2}
                  placeholder="Supervisor feedback on clinical competence, professional behaviour, teamwork..."
                  value={formData.supervisorComments || ''}
                  onChange={(e) => setFormData({ ...formData, supervisorComments: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0369a1] hover:bg-sky-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  Save Meeting Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
