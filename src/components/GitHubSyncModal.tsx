import React, { useState } from 'react';
import { 
  Github, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  Download, 
  RefreshCw, 
  FileText, 
  Lock,
  Layers,
  FolderGit2
} from 'lucide-react';
import { FullPortfolioState, GitHubSyncConfig } from '../types';
import { exportPortfolioToGitHub, generatePortfolioRepositoryFiles } from '../lib/githubSync';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: FullPortfolioState;
  onUpdateState: (newState: FullPortfolioState) => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateState,
}) => {
  const [config, setConfig] = useState<GitHubSyncConfig>(
    state.githubConfig || {
      owner: 'volkerkrause',
      repo: 'rcpch-eportfolio-staging',
      branch: 'main',
      token: ''
    }
  );

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null);
  const [repoUrl, setRepoUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.token || !config.owner || !config.repo) {
      alert('Please fill in your GitHub personal access token, username, and repository name.');
      return;
    }

    setIsSyncing(true);
    setSyncLogs(['Initializing RCPCH ePortfolio file generator...']);
    setSyncSuccess(null);
    setRepoUrl(null);

    // Save token/repo config in state
    onUpdateState({
      ...state,
      githubConfig: config
    });

    try {
      const result = await exportPortfolioToGitHub(state, config, (logMsg) => {
        setSyncLogs(prev => [...prev, logMsg]);
      });

      if (result.success) {
        setSyncSuccess(true);
        const finalUrl = `https://github.com/${config.owner}/${config.repo}`;
        setRepoUrl(finalUrl);
        setSyncLogs(prev => [...prev, `Sync complete! Staged documentation live at ${finalUrl}`]);
        
        onUpdateState({
          ...state,
          githubConfig: {
            ...config,
            lastSyncDate: new Date().toISOString()
          }
        });
      } else {
        setSyncSuccess(false);
        setSyncLogs(prev => [...prev, `Sync failed: ${result.error}`]);
      }
    } catch (err: any) {
      setSyncSuccess(false);
      setSyncLogs(prev => [...prev, `Error: ${err.message}`]);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadJsonBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `rcpch_eportfolio_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const generatedFiles = generatePortfolioRepositoryFiles(state);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Export & Sync Portfolio to GitHub
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Commit structured Markdown evidence records directly to your GitHub repository
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Repository Structure Info */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <FolderGit2 className="w-4 h-4 text-[#0369a1]" />
              <span>Repository File Structure to be Created ({generatedFiles.length} files):</span>
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 font-mono">
              <div>📁 /WPBAS/*.md ({state.wpbas.length} files)</div>
              <div>📁 /REFLECTIONS/*.md ({state.reflections.length} files)</div>
              <div>📁 /LOGBOOK/procedures.md</div>
              <div>📁 /PDP/pdp_goals.md</div>
              <div>📁 /ARCP/arcp_checklist.md</div>
              <div>📄 README.md & Curriculum Matrix</div>
            </div>
          </div>

          <form onSubmit={handleStartSync} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">GitHub Username / Owner *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. volkerkrause"
                  value={config.owner}
                  onChange={(e) => setConfig({ ...config, owner: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">Target Repository Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. rcpch-eportfolio-staging"
                  value={config.repo}
                  onChange={(e) => setConfig({ ...config, repo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-sky-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-semibold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>GitHub Personal Access Token (Classic or Fine-Grained) *</span>
                </label>
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#0369a1] hover:text-sky-800 text-[11px] flex items-center gap-1 underline font-medium"
                >
                  <span>Generate Token</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input
                type="password"
                required
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (Requires 'repo' scope)"
                value={config.token}
                onChange={(e) => setConfig({ ...config, token: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none focus:border-sky-600 focus:bg-white"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Your token is only used client-side for GitHub API commits and is never shared or stored externally.
              </p>
            </div>

            {/* Sync Progress Logs */}
            {syncLogs.length > 0 && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1 max-h-36 overflow-y-auto">
                <div className="text-slate-600 font-semibold text-[10px] uppercase">Sync Progress:</div>
                {syncLogs.map((log, i) => (
                  <div key={i} className="text-slate-700 flex items-start space-x-1.5">
                    <span className="text-[#0369a1] font-bold">›</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Success URL Banner */}
            {repoUrl && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between shadow-xs">
                <div className="text-emerald-800 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Repository Successfully Updated!</span>
                </div>
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs"
                >
                  <span>Open GitHub Repo</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDownloadJsonBackup}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save JSON Backup</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="px-5 py-2 bg-[#0369a1] hover:bg-sky-700 text-white rounded-xl font-semibold shadow-xs flex items-center space-x-2 cursor-pointer"
                >
                  {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
                  <span>{isSyncing ? 'Exporting to GitHub...' : 'Sync to GitHub'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
