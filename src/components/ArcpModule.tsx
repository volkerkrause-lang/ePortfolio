import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  Calendar, 
  Plus, 
  FileText, 
  RefreshCw,
  Users,
  Clock
} from 'lucide-react';
import { FullPortfolioState, MandatoryCert } from '../types';

interface ArcpModuleProps {
  state: FullPortfolioState;
  onUpdateState: (newState: FullPortfolioState) => void;
}

export const ArcpModule: React.FC<ArcpModuleProps> = ({
  state,
  onUpdateState,
}) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const [certForm, setCertForm] = useState<Partial<MandatoryCert>>({
    name: 'NLS (Neonatal Life Support)',
    issuer: 'Resuscitation Council UK',
    issueDate: new Date().toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: 'Valid'
  });

  const handleRunAiAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch('/api/gemini/arcp-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioState: state })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAuditResult(data.data);
      }
    } catch (err: any) {
      alert('ARCP Audit Error: ' + err.message);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleAddCert = (e: React.FormEvent) => {
    e.preventDefault();
    const newCert: MandatoryCert = {
      id: `cert-${Date.now()}`,
      ...(certForm as Required<MandatoryCert>)
    };
    onUpdateState({
      ...state,
      certificates: [...state.certificates, newCert]
    });
    setIsCertModalOpen(false);
  };

  const handleDeleteCert = (id: string) => {
    onUpdateState({
      ...state,
      certificates: state.certificates.filter(c => c.id !== id)
    });
  };

  // Basic checks
  const wpbaCount = state.wpbas.length;
  const refCount = state.reflections.length;
  const procCount = state.procedureLogs.length;
  const pdpCount = state.pdpGoals.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Annual Review of Competence Progression</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            ARCP Panel Readiness & Quality Audit
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Audit your staged portfolio against RCPCH Progress+ decision aid requirements for {state.profile.trainingGrade} ({state.profile.curriculumLevel}).
          </p>
        </div>

        <button
          id="run-arcp-audit-btn"
          onClick={handleRunAiAudit}
          disabled={isAuditing}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#0369a1] hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
        >
          {isAuditing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{isAuditing ? 'Auditing Portfolio with AI...' : 'Run Comprehensive ARCP Audit'}</span>
        </button>
      </div>

      {/* AI Audit Results Panel if available */}
      {auditResult && (
        <div className="bg-white border border-sky-300 rounded-2xl p-6 shadow-xs space-y-5 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center font-bold text-lg text-[#0369a1]">
                {auditResult.readinessScore}%
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  ARCP Readiness Assessment: {auditResult.status}
                </h2>
                <p className="text-xs text-slate-500">
                  Target Panel Date: {state.profile.arcpDate}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              auditResult.status === 'Ready for Panel'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {auditResult.status}
            </span>
          </div>

          {/* AI Feedback Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Trainee Strengths
              </h3>
              <ul className="space-y-1.5 text-slate-700 pl-4 list-disc">
                {auditResult.strengths?.map((s: string, idx: number) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Gaps & ARCP Vulnerabilities
              </h3>
              <ul className="space-y-1.5 text-slate-700 pl-4 list-disc">
                {auditResult.gaps?.map((g: string, idx: number) => (
                  <li key={idx}>{g}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <h3 className="font-bold text-sky-900">Action Plan to Secure Outcome 1:</h3>
            <ul className="space-y-1.5 text-slate-700 pl-4 list-decimal">
              {auditResult.recommendations?.map((r: string, idx: number) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ARCP Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Decision Aid Benchmarks */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Progress+ Benchmark Evidence Checklist
            </h2>
            <span className="text-xs text-[#0369a1] font-semibold">{state.profile.curriculumLevel}</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className={`w-4 h-4 ${wpbaCount >= 8 ? 'text-emerald-600' : 'text-amber-500'}`} />
                <div>
                  <div className="font-semibold text-slate-900">Supervised Learning Events (WPBAs)</div>
                  <div className="text-[11px] text-slate-500">Mini-CEX, CbD, DOPS, ACAT (Target: ≥ 8)</div>
                </div>
              </div>
              <span className="font-bold text-slate-800">{wpbaCount} / 8</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className={`w-4 h-4 ${refCount >= 6 ? 'text-emerald-600' : 'text-amber-500'}`} />
                <div>
                  <div className="font-semibold text-slate-900">Reflective Practice Notes</div>
                  <div className="text-[11px] text-slate-500">Gibbs Cycle, SEAs, Complaints (Target: ≥ 6)</div>
                </div>
              </div>
              <span className="font-bold text-slate-800">{refCount} / 6</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-semibold text-slate-900">Procedures & Practical Skills</div>
                  <div className="text-[11px] text-slate-500">Neonatal & Resus skills log</div>
                </div>
              </div>
              <span className="font-bold text-slate-800">{procCount} logged</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className={`w-4 h-4 ${pdpCount >= 3 ? 'text-emerald-600' : 'text-amber-500'}`} />
                <div>
                  <div className="font-semibold text-slate-900">SMART PDP Objectives</div>
                  <div className="text-[11px] text-slate-500">Agreed with Educational Supervisor (Target: ≥ 3)</div>
                </div>
              </div>
              <span className="font-bold text-slate-800">{pdpCount} / 3</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-semibold text-slate-900">Multi-Source Feedback (MSF)</div>
                  <div className="text-[11px] text-slate-500">Mini-TAB with 12 raters (Target: 1 per training year)</div>
                </div>
              </div>
              <span className="text-emerald-800 font-semibold text-[11px]">1 Completed</span>
            </div>
          </div>
        </div>

        {/* Right Column: Mandatory Life Support & Safeguarding Certificates */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Mandatory Resus & Safeguarding Certificates
            </h2>
            <button
              onClick={() => setIsCertModalOpen(true)}
              className="text-xs text-rose-700 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Cert</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {state.certificates.map((c) => (
              <div
                key={c.id}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{c.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Issuer: {c.issuer} • Expires: <strong className="text-slate-800">{c.expiryDate}</strong>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {c.status}
                  </span>
                  <button
                    onClick={() => handleDeleteCert(c.id)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer p-1 rounded hover:bg-slate-200"
                    title="Delete certificate"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Form R Declaration Card */}
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#0369a1]" /> Form R (Part B) Self-Declaration
              </span>
              <span className="text-[10px] px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold">
                Completed
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Includes Time Out of Training (TOOT) declaration (0 days), GMC probity and health status declarations.
            </p>
          </div>
        </div>
      </div>

      {/* Add Certificate Modal */}
      {isCertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-slate-900">Add Mandatory Training Certificate</h2>
            <form onSubmit={handleAddCert} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Certificate Course</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NLS, APLS, Safeguarding Level 3"
                  value={certForm.name || ''}
                  onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-semibold">Issuing Body</label>
                <input
                  type="text"
                  placeholder="e.g. Resuscitation Council UK, ALSG"
                  value={certForm.issuer || ''}
                  onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Issue Date</label>
                  <input
                    type="date"
                    value={certForm.issueDate || ''}
                    onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-semibold">Expiry Date</label>
                  <input
                    type="date"
                    value={certForm.expiryDate || ''}
                    onChange={(e) => setCertForm({ ...certForm, expiryDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-rose-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCertModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  Save Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
