import { FullPortfolioState, GitHubSyncConfig } from '../types';
import { INITIAL_PORTFOLIO_STATE } from '../data/sampleData';

const STORAGE_KEY = 'rcpch_eportfolio_staging_v1';
const GITHUB_CONFIG_KEY = 'rcpch_github_sync_config_v1';

export function loadPortfolioState(): FullPortfolioState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.profile && parsed.wpbas) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading portfolio state from localStorage:', err);
  }
  return INITIAL_PORTFOLIO_STATE;
}

export function savePortfolioState(state: FullPortfolioState): void {
  try {
    const updatedState: FullPortfolioState = {
      ...state,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
  } catch (err) {
    console.error('Error saving portfolio state to localStorage:', err);
  }
}

export function loadGitHubConfig(): GitHubSyncConfig {
  try {
    const raw = localStorage.getItem(GITHUB_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading GitHub config:', err);
  }
  return {
    repoOwner: '',
    repoName: 'my-rcpch-eportfolio-staging',
    branch: 'main',
    isAutoSyncEnabled: false,
    lastSyncStatus: 'idle'
  };
}

export function saveGitHubConfig(config: GitHubSyncConfig): void {
  try {
    localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Error saving GitHub config:', err);
  }
}

export function exportPortfolioAsJSON(state: FullPortfolioState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0, 10);
  const cleanName = (state.profile.name || 'Trainee').replace(/[^a-zA-Z0-9]/g, '_');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `RCPCH_ePortfolio_Backup_${cleanName}_${timestamp}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importPortfolioFromJSON(file: File): Promise<FullPortfolioState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed.profile || !parsed.wpbas || !Array.isArray(parsed.wpbas)) {
          throw new Error('Invalid RCPCH ePortfolio backup JSON schema.');
        }
        resolve(parsed);
      } catch (e: any) {
        reject(new Error(e.message || 'Failed to parse JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('File reading failed.'));
    reader.readAsText(file);
  });
}

export function resetToSampleData(): FullPortfolioState {
  localStorage.removeItem(STORAGE_KEY);
  return INITIAL_PORTFOLIO_STATE;
}
