import { FullPortfolioState, GitHubSyncConfig } from '../types';
import { RCPCH_LEARNING_OUTCOMES } from '../data/rcpchCurriculum';

export interface GeneratedRepoFile {
  path: string;
  content: string;
}

/**
 * Generates an organized Markdown repository file tree representing the full RCPCH portfolio
 */
export function generatePortfolioRepoFiles(state: FullPortfolioState): GeneratedRepoFile[] {
  const files: GeneratedRepoFile[] = [];
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // 1. Root README.md
  files.push({
    path: 'README.md',
    content: `# RCPCH ePortfolio Staging & Progress+ Mirror
**Trainee:** ${state.profile.name || 'Trainee Name'} (GMC: ${state.profile.gmcNumber || 'N/A'}, RCPCH: ${state.profile.rcpchNumber || 'N/A'})  
**Training Grade:** ${state.profile.trainingGrade} (${state.profile.curriculumLevel})  
**Deanery:** ${state.profile.deanery}  
**Current Post:** ${state.profile.currentPost} @ ${state.profile.currentHospital}  
**Educational Supervisor:** ${state.profile.educationalSupervisor}  
**Clinical Supervisor:** ${state.profile.clinicalSupervisor}  
**Target ARCP Date:** ${state.profile.arcpDate}  
*Last Exported:* ${dateStr}

---

## 📁 Repository Structure
- \`01_CURRICULUM_MATRIX.md\` - Complete 11 Progress+ Learning Outcomes mapped to evidence
- \`02_ARCP_DOSSIER.md\` - ARCP checklist, Form R summary, and mandatory certificates
- \`03_SUPERVISOR_MEETINGS.md\` - Induction, Mid-Point, and End of Placement records
- \`04_PERSONAL_DEVELOPMENT_PLAN.md\` - SMART objectives and status tracking
- \`05_PROCEDURES_LOGBOOK.md\` - Neonatal, Resuscitation, and Paediatric skills log
- \`wpbas/\` - Individual Work Place Based Assessments (Mini-CEX, CbD, DOPS, ACAT)
- \`reflections/\` - Structured Gibbs Cycle clinical reflections & significant event analyses
- \`kaizen_export_bundle.json\` - Raw data backup compatible with RCPCH Staging Platform

---

## 🎯 Portfolio Summary Metrics
- **Total Staged WPBAs:** ${state.wpbas.length}
- **Reflective Notes:** ${state.reflections.length}
- **Logged Procedures:** ${state.procedureLogs.length}
- **Active / Completed PDP Goals:** ${state.pdpGoals.length}
- **Mandatory Life Support & Safeguarding:** ${state.certificates.filter(c => c.status === 'Valid').length} of ${state.certificates.length} valid
`
  });

  // 2. 01_CURRICULUM_MATRIX.md
  let matrixContent = `# RCPCH Progress+ 11 Learning Outcomes Evidence Matrix
**Trainee:** ${state.profile.name} | **Level:** ${state.profile.curriculumLevel}\n\n`;

  RCPCH_LEARNING_OUTCOMES.forEach(lo => {
    const linkedWpbas = state.wpbas.filter(w => w.curriculumTags.includes(lo.id));
    const linkedReflections = state.reflections.filter(r => r.curriculumTags.includes(lo.id));
    const linkedProcedures = state.procedureLogs.filter(p => p.curriculumTags.includes(lo.id));
    const linkedPdp = state.pdpGoals.filter(p => p.curriculumTags.includes(lo.id));
    const totalEvidence = linkedWpbas.length + linkedReflections.length + linkedProcedures.length + linkedPdp.length;

    matrixContent += `### ${lo.id}: ${lo.title} (${lo.gmcDomain})
**Description:** ${lo.shortDesc}  
**Total Linked Evidence Items:** ${totalEvidence}

#### Core Capabilities (Level 1):
${lo.coreCapabilities.map(c => `- [x] ${c}`).join('\n')}

#### Linked Staging Items:
${linkedWpbas.map(w => `- **WPBA [${w.type}]:** [${w.title}](wpbas/${sanitizeFilename(w.title)}.md) (${w.date})`).join('\n') || '- *No WPBAs linked yet*'}
${linkedReflections.map(r => `- **Reflection:** [${r.title}](reflections/${sanitizeFilename(r.title)}.md) (${r.date})`).join('\n') || '- *No reflections linked yet*'}
${linkedProcedures.map(p => `- **Procedure:** ${p.procedureName} (${p.supervisionLevel}) - ${p.date}`).join('\n') || ''}
${linkedPdp.map(p => `- **PDP Goal:** ${p.title} [${p.status}]`).join('\n') || ''}

---
\n`;
  });

  files.push({
    path: '01_CURRICULUM_MATRIX.md',
    content: matrixContent
  });

  // 3. 02_ARCP_DOSSIER.md
  let arcpContent = `# ARCP Staging Dossier & Checklist
**Trainee:** ${state.profile.name} (GMC: ${state.profile.gmcNumber})  
**Target ARCP Date:** ${state.profile.arcpDate}  
**Time out of training in period:** ${state.arcpChecklist.timeOutOfTrainingDays} days

## 📋 Pre-ARCP Readiness Checklist
- [${state.arcpChecklist.formRPartBCompleted ? 'x' : ' '}] **Form R Part B Completed & Signed** (Date: ${state.arcpChecklist.formRDate || 'Pending'})
- [${state.arcpChecklist.mandatoryCertificatesComplete ? 'x' : ' '}] **Mandatory Resuscitation & Safeguarding Up-to-Date**
- [${state.arcpChecklist.minWpbaCountReached ? 'x' : ' '}] **Minimum WPBA Requirements Satisfied** (${state.wpbas.length} completed)
- [${state.arcpChecklist.msfSummaryCompleted ? 'x' : ' '}] **Multi-Source Feedback (MSF/TAB) Completed & Summarised**
- [${state.arcpChecklist.educationalSupervisorReportReady ? 'x' : ' '}] **Educational Supervisor\'s Report Prepared**
- [${state.arcpChecklist.clinicalSupervisorReportReady ? 'x' : ' '}] **Clinical Supervisor\'s Report Prepared**
- [${state.arcpChecklist.safeguardingLevel3Current ? 'x' : ' '}] **Safeguarding Children Level 3 Certification Valid**
- [${state.arcpChecklist.qipCompleted ? 'x' : ' '}] **Quality Improvement Project (QIP / QIPAT) Completed**

## 📜 Mandatory Course & Revalidation Tracker
| Certificate | Issuer | Completed | Expiry Date | Status | Ref No. |
| :--- | :--- | :--- | :--- | :--- | :--- |
${state.certificates.map(c => `| **${c.name}** | ${c.issuer} | ${c.dateCompleted} | ${c.expiryDate} | ${c.status} | ${c.certificateRef || 'N/A'} |`).join('\n')}

## 💬 Trainee Comments for the ARCP Panel
> ${state.arcpChecklist.commentsForPanel || 'No additional comments provided.'}
`;
  files.push({
    path: '02_ARCP_DOSSIER.md',
    content: arcpContent
  });

  // 4. 03_SUPERVISOR_MEETINGS.md
  let meetingsContent = `# Supervisor Meetings & Educational Sign-Offs\n\n`;
  state.supervisorMeetings.forEach((m, idx) => {
    meetingsContent += `## ${idx + 1}. ${m.type} (${m.date})
**Supervisor:** ${m.supervisorName} (${m.supervisorRole})  
**Placement:** ${m.placementDetails}  
**Kaizen Sign-off Status:** ${m.isSignedOffInKaizen ? '✅ Signed off in official portal' : '⏳ Staged in draft'}

### Progress Summary:
${m.progressSummary}

### Strengths Identified:
${m.strengthsIdentified}

### Areas for Development & Focus:
${m.areasToFocusOn}

### Agreed Targets:
${m.agreedTargets}

### Curriculum Outcomes Discussed:
${m.curriculumOutcomesDiscussed.join(', ')}

---
\n`;
  });
  files.push({
    path: '03_SUPERVISOR_MEETINGS.md',
    content: meetingsContent
  });

  // 5. 04_PERSONAL_DEVELOPMENT_PLAN.md
  let pdpContent = `# Personal Development Plan (PDP) - SMART Goals\n\n`;
  state.pdpGoals.forEach((g, idx) => {
    pdpContent += `## ${idx + 1}. ${g.title}
**Status:** \`${g.status}\` | **Target Date:** ${g.targetDate} | **Category:** ${g.category}  
**Curriculum Mapping:** ${g.curriculumTags.join(', ')}

- **SMART Objective:** ${g.smartObjective}
- **Actions Planned:** ${g.actionsToAchieve}
- **Evidence Required:** ${g.evidenceToDemonstrate}
${g.completionDate ? `- **Completion Date:** ${g.completionDate}` : ''}
${g.reflectionNotes ? `- **Review Notes:** ${g.reflectionNotes}` : ''}

---
\n`;
  });
  files.push({
    path: '04_PERSONAL_DEVELOPMENT_PLAN.md',
    content: pdpContent
  });

  // 6. 05_PROCEDURES_LOGBOOK.md
  let procContent = `# Skills & Clinical Procedures Logbook\n\n`;
  procContent += `| Date | Procedure | Category | Age Group | Supervision Level | Location | Supervisor |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${state.procedureLogs.map(p => `| ${p.date} | **${p.procedureName}** | ${p.category} | ${p.patientAge} | ${p.supervisionLevel} | ${p.location} | ${p.supervisorName} |`).join('\n')}

\n### Detailed Procedure Notes:\n\n`;
  state.procedureLogs.forEach(p => {
    procContent += `#### ${p.procedureName} (${p.date})
- **Indication:** ${p.indication}
- **Supervision Level:** ${p.supervisionLevel}
- **Notes / Observations:** ${p.notes}
- **Curriculum Tags:** ${p.curriculumTags.join(', ')}

`;
  });
  files.push({
    path: '05_PROCEDURES_LOGBOOK.md',
    content: procContent
  });

  // 7. Individual WPBAs in /wpbas/
  state.wpbas.forEach(w => {
    const filename = `wpbas/${sanitizeFilename(w.title)}.md`;
    const content = `# ${w.type}: ${w.title}
**Date of Encounter:** ${w.date}  
**Clinical Setting:** ${w.clinicalSetting}  
**Patient Age Group:** ${w.patientAgeGroup}  
**Assessor:** ${w.assessorName} (${w.assessorRole}) - \`${w.assessorEmail}\`  
**Entrustment Level:** ${w.entrustmentLevel}  
**Curriculum Tags:** ${w.curriculumTags.join(', ')}  
**Kaizen Status:** ${w.isReadyForKaizen ? '✅ Ready for Kaizen Copy' : 'Draft'}

---

## 1. Case Summary / Description of Clinical Encounter
${w.caseSummary}

## 2. What Went Well (Feedback from Assessor)
${w.whatWentWell}

## 3. Areas for Development (Constructive Feedback)
${w.areasForDevelopment}

## 4. Agreed Action Plan & Next Steps
${w.agreedActionPlan}

${w.procedureName ? `\n## Procedure Specifics\n- **Procedure:** ${w.procedureName}\n- **Type:** ${w.procedureType || 'Diagnostic'}\n` : ''}
`;
    files.push({ path: filename, content });
  });

  // 8. Individual Reflections in /reflections/
  state.reflections.forEach(r => {
    const filename = `reflections/${sanitizeFilename(r.title)}.md`;
    const content = `# Reflective Practice Note: ${r.title}
**Date of Event:** ${r.date}  
**Category:** ${r.category}  
**Curriculum Tags:** ${r.curriculumTags.join(', ')}  
**GMC Anonymisation Checked:** ${r.anonymisationChecked ? '✅ Yes - No Patient Identifiers' : '⚠️ Pending Verification'}

---

## 🔄 Gibbs Reflective Cycle

### 1. Description (What happened?)
${r.description}

### 2. Feelings (What were you thinking and feeling?)
${r.feelings}

### 3. Evaluation (What was good and bad about the experience?)
${r.evaluation}

### 4. Analysis (What sense can you make of the situation?)
${r.analysis}

### 5. Conclusion (What else could you have done?)
${r.conclusion}

### 6. Action Plan (If it arose again, what would you do?)
${r.actionPlan}

---

## 💡 Key Learning Points
${r.learningPoints}
`;
    files.push({ path: filename, content });
  });

  return files;
}

function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

/**
 * Format a single WPBA specifically for Kaizen field-by-field or full block copy
 */
export function formatWpbaForKaizen(wpba: import('../types').WPBARecord): {
  summary: string;
  whatWentWell: string;
  areasForDevelopment: string;
  actionPlan: string;
  fullKaizenBlock: string;
} {
  const fullKaizenBlock = `[RCPCH ePortfolio - ${wpba.type} Assessment Form]
Title: ${wpba.title}
Date: ${wpba.date}
Clinical Setting: ${wpba.clinicalSetting}
Patient Age: ${wpba.patientAgeGroup}
Assessor: ${wpba.assessorName} (${wpba.assessorRole}) - ${wpba.assessorEmail}
Curriculum Outcomes: ${wpba.curriculumTags.join(', ')}
Entrustment Level: ${wpba.entrustmentLevel}

1. DESCRIPTION OF CLINICAL ENCOUNTER:
${wpba.caseSummary}

2. WHAT WENT WELL:
${wpba.whatWentWell}

3. AREAS FOR DEVELOPMENT:
${wpba.areasForDevelopment}

4. AGREED ACTION PLAN:
${wpba.agreedActionPlan}`;

  return {
    summary: wpba.caseSummary,
    whatWentWell: wpba.whatWentWell,
    areasForDevelopment: wpba.areasForDevelopment,
    actionPlan: wpba.agreedActionPlan,
    fullKaizenBlock
  };
}

/**
 * Format a single reflection for Kaizen input boxes
 */
export function formatReflectionForKaizen(ref: import('../types').ReflectiveNote): {
  description: string;
  reflectionBody: string;
  learningPoints: string;
  actionPlan: string;
  fullKaizenBlock: string;
} {
  const reflectionBody = `FEELINGS & THOUGHTS:
${ref.feelings}

EVALUATION:
${ref.evaluation}

ANALYSIS & SENSE-MAKING:
${ref.analysis}

CONCLUSION:
${ref.conclusion}`;

  const fullKaizenBlock = `[RCPCH ePortfolio - Reflective Practice Record]
Title: ${ref.title}
Date: ${ref.date}
Category: ${ref.category}
Curriculum Outcomes: ${ref.curriculumTags.join(', ')}

DESCRIPTION OF EVENT:
${ref.description}

STRUCTURED REFLECTION (GIBBS CYCLE):
${reflectionBody}

KEY LEARNING POINTS:
${ref.learningPoints}

ACTION PLAN / FUTURE PRACTICE:
${ref.actionPlan}`;

  return {
    description: ref.description,
    reflectionBody,
    learningPoints: ref.learningPoints,
    actionPlan: ref.actionPlan,
    fullKaizenBlock
  };
}

/**
 * Export portfolio as a GitHub Gist using personal access token
 */
export async function createGitHubGist(token: string, state: FullPortfolioState, isPublic: boolean = false): Promise<{ url: string; id: string }> {
  const files = generatePortfolioRepoFiles(state);
  const gistFiles: Record<string, { content: string }> = {};

  files.forEach(f => {
    // Gist filename cannot have slashes, replace slash with double underscore
    const gistKey = f.path.replace(/\//g, '__');
    gistFiles[gistKey] = { content: f.content };
  });

  const response = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    body: JSON.stringify({
      description: `RCPCH ePortfolio Staging Dossier - ${state.profile.name} (${new Date().toISOString().slice(0, 10)})`,
      public: isPublic,
      files: gistFiles
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `GitHub API error: ${response.statusText}`);
  }

  const result = await response.json();
  return {
    url: result.html_url,
    id: result.id
  };
}

/**
 * Direct push/create files in a GitHub repository via GitHub REST API
 */
export async function pushToGitHubRepo(
  token: string,
  owner: string,
  repo: string,
  branch: string = 'main',
  state: FullPortfolioState
): Promise<{ pushedFilesCount: number; repoUrl: string }> {
  const files = generatePortfolioRepoFiles(state);
  let pushedCount = 0;

  for (const file of files) {
    // 1. Check if file already exists to get SHA
    let sha: string | undefined = undefined;
    try {
      const getFileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file.path}?ref=${branch}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
      if (getFileRes.ok) {
        const fileData = await getFileRes.json();
        sha = fileData.sha;
      }
    } catch {
      // file might not exist yet
    }

    // 2. Put file content (Base64 encoded utf-8)
    const base64Content = btoa(unescape(encodeURIComponent(file.content)));
    const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        message: `Sync RCPCH ePortfolio Staging: ${file.path} [automated sync]`,
        content: base64Content,
        branch: branch,
        ...(sha ? { sha } : {})
      })
    });

    if (!putRes.ok) {
      const err = await putRes.json().catch(() => ({}));
      throw new Error(`Failed to push ${file.path}: ${err.message || putRes.statusText}`);
    }

    pushedCount++;
  }

  return {
    pushedFilesCount: pushedCount,
    repoUrl: `https://github.com/${owner}/${repo}`
  };
}

export const generatePortfolioRepositoryFiles = generatePortfolioRepoFiles;

/**
 * High level wrapper to export and sync portfolio to GitHub with live status callbacks
 */
export async function exportPortfolioToGitHub(
  state: FullPortfolioState,
  config: { owner?: string; repo?: string; branch?: string; token?: string; repoOwner?: string; repoName?: string; githubToken?: string },
  onProgress?: (msg: string) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
  const token = config.token || config.githubToken || '';
  const owner = config.owner || config.repoOwner || '';
  const repo = config.repo || config.repoName || '';
  const branch = config.branch || 'main';

  if (!token || !owner || !repo) {
    return { success: false, error: 'Missing GitHub token, username, or repository name.' };
  }

  const files = generatePortfolioRepoFiles(state);
  onProgress?.(`Generated ${files.length} structured RCPCH staging documents.`);

  let pushed = 0;
  for (const file of files) {
    onProgress?.(`Syncing ${file.path}... (${pushed + 1}/${files.length})`);
    let sha: string | undefined = undefined;
    try {
      const checkRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file.path}?ref=${branch}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
      if (checkRes.ok) {
        const d = await checkRes.json();
        sha = d.sha;
      }
    } catch {
      // file might be new
    }

    const base64Content = btoa(unescape(encodeURIComponent(file.content)));
    const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: JSON.stringify({
        message: `Sync RCPCH portfolio record: ${file.path}`,
        content: base64Content,
        branch: branch,
        ...(sha ? { sha } : {})
      })
    });

    if (!putRes.ok) {
      const err = await putRes.json().catch(() => ({}));
      return { success: false, error: `Error on ${file.path}: ${err.message || putRes.statusText}` };
    }
    pushed++;
  }

  return {
    success: true,
    url: `https://github.com/${owner}/${repo}`
  };
}

