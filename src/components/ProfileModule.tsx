import React, { useState } from 'react';
import { 
  User, 
  Building, 
  Calendar, 
  Award, 
  RotateCcw, 
  Save, 
  Check, 
  Shield, 
  Mail
} from 'lucide-react';
import { FullPortfolioState, ProgressLevel, TraineeGrade, TraineeProfile } from '../types';
import { INITIAL_SAMPLE_STATE } from '../data/sampleData';

interface ProfileModuleProps {
  state: FullPortfolioState;
  onUpdateState: (newState: FullPortfolioState) => void;
}

export const ProfileModule: React.FC<ProfileModuleProps> = ({
  state,
  onUpdateState,
}) => {
  const [profile, setProfile] = useState<TraineeProfile>(state.profile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateState({
      ...state,
      profile
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetToSample = () => {
    if (window.confirm('Reset portfolio to initial Progress+ sample staging state? (Current local changes will be replaced)')) {
      onUpdateState(INITIAL_SAMPLE_STATE);
      setProfile(INITIAL_SAMPLE_STATE.profile);
      alert('Portfolio reset to initial sample staging records.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#0369a1] text-xs font-semibold uppercase tracking-wider mb-1">
            <User className="w-4 h-4" />
            <span>Trainee Registration & Deanery Settings</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Trainee Profile & Placement Details
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Configure your GMC/RCPCH registration, training grade, and supervisory team.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetToSample}
          className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium border border-slate-200 transition-colors cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Data</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 text-xs">
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight border-b border-slate-200 pb-2">
            1. Personal & Professional Identifiers
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Full Name & Title</label>
              <input
                type="text"
                required
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">GMC Reference Number</label>
              <input
                type="text"
                value={profile.gmcNumber}
                onChange={(e) => setProfile({ ...profile, gmcNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none focus:border-sky-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">RCPCH College Number</label>
              <input
                type="text"
                value={profile.rcpchNumber}
                onChange={(e) => setProfile({ ...profile, rcpchNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none focus:border-sky-600 focus:bg-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight border-b border-slate-200 pb-2">
            2. Training Grade & Progress+ Level
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Training Grade</label>
              <select
                value={profile.trainingGrade}
                onChange={(e) => setProfile({ ...profile, trainingGrade: e.target.value as TraineeGrade })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
              >
                <option value="ST1">ST1 (Core)</option>
                <option value="ST2">ST2 (Core)</option>
                <option value="ST3">ST3 (Core)</option>
                <option value="ST4">ST4 (Specialty)</option>
                <option value="ST5">ST5 (Specialty)</option>
                <option value="ST6">ST6 (Subspecialty / General)</option>
                <option value="ST7">ST7 (Subspecialty / General)</option>
                <option value="ST8">ST8 (Subspecialty / General)</option>
                <option value="Post-CCT Fellow">Post-CCT Fellow</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">Progress+ Curriculum Level</label>
              <select
                value={profile.curriculumLevel}
                onChange={(e) => setProfile({ ...profile, curriculumLevel: e.target.value as ProgressLevel })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
              >
                <option value="Level 1 (Core ST1-ST3)">Level 1 (Core ST1-ST3)</option>
                <option value="Level 2 (Specialty ST4-ST5)">Level 2 (Specialty ST4-ST5)</option>
                <option value="Level 3 (General/Subspecialty ST6-ST8)">Level 3 (General/Subspecialty ST6-ST8)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">Deanery / LETB</label>
              <input
                type="text"
                value={profile.deanery}
                onChange={(e) => setProfile({ ...profile, deanery: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight border-b border-slate-200 pb-2">
            3. Current Placement & Supervisory Team
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Current Hospital / NHS Trust</label>
              <input
                type="text"
                value={profile.currentHospital}
                onChange={(e) => setProfile({ ...profile, currentHospital: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">Department / Subspecialty</label>
              <input
                type="text"
                value={profile.currentDepartment}
                onChange={(e) => setProfile({ ...profile, currentDepartment: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-700 font-semibold block mb-1">Educational Supervisor</label>
              <input
                type="text"
                value={profile.educationalSupervisor}
                onChange={(e) => setProfile({ ...profile, educationalSupervisor: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">Clinical Supervisor</label>
              <input
                type="text"
                value={profile.clinicalSupervisor}
                onChange={(e) => setProfile({ ...profile, clinicalSupervisor: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-slate-700 font-semibold block mb-1">Target ARCP Panel Date</label>
              <input
                type="date"
                value={profile.arcpDate}
                onChange={(e) => setProfile({ ...profile, arcpDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-slate-500 text-[11px]">
            Data saved in browser localStorage and ready for GitHub mirror sync.
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#0369a1] hover:bg-sky-700 text-white rounded-xl font-semibold shadow-xs flex items-center space-x-2 transition-colors cursor-pointer"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Profile Saved!' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
