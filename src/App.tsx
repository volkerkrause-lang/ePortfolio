import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CurriculumMatrix } from './components/CurriculumMatrix';
import { WpbaModule } from './components/WpbaModule';
import { ReflectionModule } from './components/ReflectionModule';
import { LogbookModule } from './components/LogbookModule';
import { PdpModule } from './components/PdpModule';
import { ArcpModule } from './components/ArcpModule';
import { SupervisorModule } from './components/SupervisorModule';
import { KaizenExportHub } from './components/KaizenExportHub';
import { ProfileModule } from './components/ProfileModule';
import { AppraisalPlannerModule } from './components/AppraisalPlannerModule';
import { GitHubSyncModal } from './components/GitHubSyncModal';
import { AiAdvisorModal } from './components/AiAdvisorModal';
import { loadPortfolioState, savePortfolioState } from './lib/storage';
import { FullPortfolioState } from './types';

export function App() {
  const [state, setState] = useState<FullPortfolioState>(loadPortfolioState());
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);
  const [initialAiLo, setInitialAiLo] = useState<string | null>(null);
  const [initialWpbaTag, setInitialWpbaTag] = useState<string | null>(null);
  const [initialRefTag, setInitialRefTag] = useState<string | null>(null);

  // Sync with localStorage on state update
  const handleUpdateState = (newState: FullPortfolioState) => {
    setState(newState);
    savePortfolioState(newState);
  };

  const handleOpenAiAdvisor = (loId?: string) => {
    setInitialAiLo(loId || null);
    setIsAiAdvisorOpen(true);
  };

  const handleNewWpbaWithTag = (loId: string) => {
    setInitialWpbaTag(loId);
    setActiveTab('wpbas');
  };

  const handleNewReflectionWithTag = (loId: string) => {
    setInitialRefTag(loId);
    setActiveTab('reflections');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        state={state}
        onUpdateState={handleUpdateState}
        onOpenAiAdvisor={() => handleOpenAiAdvisor()}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
        onQuickKaizenCopy={() => setActiveTab('kaizen')}
        activeTab={activeTab}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          state={state}
          onOpenAiAdvisor={() => handleOpenAiAdvisor()}
        />

        {/* Dynamic Main Workspace Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f8fafc]">
          {activeTab === 'dashboard' && (
            <Dashboard
              state={state}
              onNavigate={setActiveTab}
              onNewWpba={() => setActiveTab('wpbas')}
              onNewReflection={() => setActiveTab('reflections')}
              onNewProcedure={() => setActiveTab('logbook')}
              onNewPdp={() => setActiveTab('pdp')}
              onOpenAiAdvisor={() => handleOpenAiAdvisor()}
              onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
            />
          )}

          {activeTab === 'curriculum' && (
            <CurriculumMatrix
              state={state}
              onNewWpbaWithTag={handleNewWpbaWithTag}
              onNewReflectionWithTag={handleNewReflectionWithTag}
              onOpenAiAdvisorWithLo={(loId) => handleOpenAiAdvisor(loId)}
            />
          )}

          {activeTab === 'wpbas' && (
            <WpbaModule
              state={state}
              onUpdateState={handleUpdateState}
              initialNewWithTag={initialWpbaTag}
              onClearInitialTag={() => setInitialWpbaTag(null)}
            />
          )}

          {activeTab === 'reflections' && (
            <ReflectionModule
              state={state}
              onUpdateState={handleUpdateState}
              initialNewWithTag={initialRefTag}
              onClearInitialTag={() => setInitialRefTag(null)}
            />
          )}

          {activeTab === 'logbook' && (
            <LogbookModule
              state={state}
              onUpdateState={handleUpdateState}
            />
          )}

          {activeTab === 'pdp' && (
            <PdpModule
              state={state}
              onUpdateState={handleUpdateState}
            />
          )}

          {activeTab === 'arcp' && (
            <ArcpModule
              state={state}
              onUpdateState={handleUpdateState}
            />
          )}

          {activeTab === 'appraisal-planner' && (
            <AppraisalPlannerModule
              state={state}
              onUpdateState={handleUpdateState}
            />
          )}

          {activeTab === 'supervisors' && (
            <SupervisorModule
              state={state}
              onUpdateState={handleUpdateState}
            />
          )}

          {activeTab === 'kaizen' && (
            <KaizenExportHub
              state={state}
              onUpdateState={handleUpdateState}
            />
          )}

          {activeTab === 'github' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">GitHub Mirror Synchronization</h1>
                  <p className="text-xs text-slate-500 mt-1">Export your staged evidence as structured markdown files directly to your GitHub repository.</p>
                </div>
                <button
                  onClick={() => setIsGitHubModalOpen(true)}
                  className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Configure & Sync Now
                </button>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <ProfileModule
              state={state}
              onUpdateState={handleUpdateState}
            />
          )}
        </main>
      </div>

      {/* Floating Modals */}
      <GitHubSyncModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        state={state}
        onUpdateState={handleUpdateState}
      />

      <AiAdvisorModal
        isOpen={isAiAdvisorOpen}
        onClose={() => setIsAiAdvisorOpen(false)}
        state={state}
        initialLoId={initialAiLo}
      />
    </div>
  );
}

export default App;
