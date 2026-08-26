export type ProgressLevel = 'Level 1 (Core ST1-ST3)' | 'Level 2 (Specialty ST4-ST5)' | 'Level 3 (General/Subspecialty ST6-ST8)';

export type EntrustmentLevel = 
  | 'Level 1: Direct supervision required (observer/assisted)'
  | 'Level 2: Direct supervision available immediately (supervised)'
  | 'Level 3: Indirect supervision (independently acting, supervisor accessible)'
  | 'Level 4: Independent / Able to supervise and teach others';

export interface TraineeProfile {
  name: string;
  gmcNumber: string;
  rcpchNumber: string;
  trainingGrade: string; // e.g. "ST2 - Paediatrics"
  curriculumLevel: ProgressLevel;
  deanery: string; // e.g. "London & South East (LaSE)"
  currentHospital: string;
  currentPost: string; // e.g. "General Paediatrics & Neonatal Unit"
  placementStartDate: string;
  placementEndDate: string;
  educationalSupervisor: string;
  clinicalSupervisor: string;
  arcpDate: string;
}

export interface LearningOutcome {
  id: string; // e.g. "LO1"
  number: number;
  title: string;
  gmcDomain: string;
  shortDesc: string;
  coreCapabilities: string[];
  specialtyCapabilities: string[];
  level3Capabilities: string[];
  guidanceNotes: string;
  color: string;
}

export type WPBAKind = 'Mini-CEX' | 'CbD' | 'DOPS' | 'SLE' | 'ACAT' | 'HAT' | 'CBD-Safeguarding';

export interface WPBARecord {
  id: string;
  type: WPBAKind;
  title: string;
  date: string;
  clinicalSetting: 'Inpatient Ward' | 'Neonatal Unit (NICU/SCBU)' | 'Paediatric Emergency (ED)' | 'Outpatient Clinic' | 'PICU / HDU' | 'Delivery Suite / Resus' | 'Community / Safeguarding';
  patientAgeGroup: '<28 days (Neonate)' | '1-12 months (Infant)' | '1-4 years (Toddler)' | '5-11 years (Child)' | '12-18 years (Adolescent)';
  assessorName: string;
  assessorRole: 'Consultant' | 'ST6-8 Senior Registrar' | 'Advanced Clinical Practitioner' | 'Clinical Nurse Specialist' | 'Senior Fellow';
  assessorEmail: string;
  caseSummary: string;
  whatWentWell: string;
  areasForDevelopment: string;
  agreedActionPlan: string;
  entrustmentLevel: EntrustmentLevel;
  curriculumTags: string[]; // e.g. ["LO1", "LO3", "LO4"]
  isReadyForKaizen: boolean;
  copiedToKaizenDate?: string;
  createdAt: string;
  updatedAt: string;
  // Specific to DOPS
  procedureName?: string;
  procedureType?: 'Diagnostic' | 'Therapeutic' | 'Emergency Resuscitation';
  complicationsObserved?: string;
}

export interface ReflectiveNote {
  id: string;
  title: string;
  date: string;
  category: 'Clinical Incident / Case' | 'Communication & Conflict' | 'Complaints & Feedback' | 'Significant Event Analysis (SEA)' | 'Leadership & Teamwork' | 'Ethical / Safeguarding Dilemma' | 'Wellbeing & Personal Development';
  // Gibbs Reflective Cycle
  description: string; // What happened?
  feelings: string; // What were you thinking & feeling?
  evaluation: string; // What was good and bad about the experience?
  analysis: string; // What sense can you make of the situation?
  conclusion: string; // What else could you have done?
  actionPlan: string; // If it arose again, what would you do?
  learningPoints: string;
  curriculumTags: string[];
  anonymisationChecked: boolean;
  isReadyForKaizen: boolean;
  copiedToKaizenDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcedureLogItem {
  id: string;
  date: string;
  procedureName: string;
  category: 'Neonatal' | 'Paediatric Resuscitation' | 'General Paediatric Inpatient' | 'Emergency / Trauma' | 'Safeguarding Medical';
  patientAge: string;
  supervisionLevel: 'Observed / Simulated' | 'Assisted' | 'Direct Supervision' | 'Independent' | 'Supervising Others';
  location: string;
  indication: string;
  notes: string;
  supervisorName: string;
  curriculumTags: string[];
}

export interface PDPGoal {
  id: string;
  title: string;
  targetDate: string;
  category: 'Clinical Skills' | 'Procedures' | 'Management & Leadership' | 'Teaching & Education' | 'Research & QIP' | 'Exam Preparation';
  smartObjective: string;
  actionsToAchieve: string;
  evidenceToDemonstrate: string;
  curriculumTags: string[];
  status: 'Draft' | 'Active / In Progress' | 'Achieved' | 'Carried Forward';
  completionDate?: string;
  reflectionNotes?: string;
  createdAt: string;
}

export interface SupervisorMeeting {
  id: string;
  type: 'Induction Meeting' | 'Mid-Point Review' | 'End of Placement Review' | 'Clinical Supervisor (CS) Report Draft' | 'Educational Supervisor (ES) Report Draft' | string;
  date: string;
  supervisorName: string;
  supervisorRole: 'Educational Supervisor' | 'Clinical Supervisor' | 'College Tutor' | string;
  placementDetails?: string;
  hospital?: string;
  progressSummary?: string;
  summaryOfDiscussion?: string;
  strengthsIdentified?: string;
  areasToFocusOn?: string;
  agreedTargets?: string;
  agreedPdpTargets?: string;
  supervisorComments?: string;
  curriculumOutcomesDiscussed?: string[];
  isSignedOffInKaizen?: boolean;
  signedOff?: boolean;
  notes?: string;
}

export type TraineeGrade = 
  | 'ST1' 
  | 'ST2' 
  | 'ST3' 
  | 'ST4' 
  | 'ST5' 
  | 'ST6' 
  | 'ST7' 
  | 'ST8' 
  | 'Post-CCT Fellow'
  | string;

export interface MandatoryCertificate {
  id: string;
  name: string; // e.g. "NLS (Neonatal Life Support)", "APLS / EPALS", "Safeguarding Children Level 3", "GMC Good Medical Practice"
  issuer: string; // e.g. "Resuscitation Council UK", "ALGS"
  dateCompleted?: string;
  issueDate?: string;
  expiryDate: string;
  status: 'Valid' | 'Expiring Soon (<3 mo)' | 'Expired' | 'Booked / In Progress';
  certificateRef?: string;
  notes?: string;
}

export type MandatoryCert = MandatoryCertificate;

export interface ArcpChecklist {
  formRPartBCompleted: boolean;
  formRDate?: string;
  mandatoryCertificatesComplete: boolean;
  minWpbaCountReached: boolean;
  msfSummaryCompleted: boolean;
  educationalSupervisorReportReady: boolean;
  clinicalSupervisorReportReady: boolean;
  curriculumCoverageAdequate: boolean;
  qipCompleted: boolean;
  safeguardingLevel3Current: boolean;
  timeOutOfTrainingDays: number;
  commentsForPanel: string;
}

export interface FullPortfolioState {
  profile: TraineeProfile;
  wpbas: WPBARecord[];
  reflections: ReflectiveNote[];
  procedureLogs: ProcedureLogItem[];
  pdpGoals: PDPGoal[];
  supervisorMeetings: SupervisorMeeting[];
  certificates: MandatoryCertificate[];
  arcpChecklist: ArcpChecklist;
  lastUpdated: string;
}

export interface GitHubSyncConfig {
  githubToken?: string;
  repoOwner?: string;
  repoName?: string;
  branch?: string;
  isAutoSyncEnabled?: boolean;
  lastSyncTimestamp?: string;
  lastSyncStatus?: 'idle' | 'success' | 'error';
  lastSyncMessage?: string;
}
