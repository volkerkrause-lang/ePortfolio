import { AppraisalPlannerState } from '../types';

const cpdItems = [
  ['gpam', 'GPAM/CPAM meetings and certificates', 'Courses & certificates', 'Search work emails, calendar invitations and certificates for GPAM/CPAM meetings.'],
  ['teaching-programme', 'Internal teaching programme certificates', 'Courses & certificates', 'Look for certificates or attendance records from the I+PC/internal teaching programme.'],
  ['elearning', 'Up-to-date e-learning and evidence-based study', 'Courses & certificates', 'Check current e-learning records and learning from resources such as UpToDate.'],
  ['mandatory-training', 'Mandatory/statutory training', 'Courses & certificates', 'Check the trust learning system for current mandatory training certificates.'],
  ['grand-rounds', 'Grand rounds', 'Meetings & clinical learning', 'Find invitations, attendance records, calendar entries or notes from grand rounds.'],
  ['pre-admission', 'Pre-admission clinics', 'Meetings & clinical learning', 'Record attendance, learning and any changes made to the clinic process.'],
  ['ams-rounds', 'Antimicrobial stewardship (AMS) rounds', 'Meetings & clinical learning', 'Search the rota, calendar and work emails for AMS rounds.'],
  ['psychosocial', 'Psychosocial meetings', 'Meetings & clinical learning', 'Find MDT invitations, notes or attendance records.'],
  ['consultant-huddles', 'Consultant huddles and job-plan activity', 'Meetings & clinical learning', 'Check calendars, meeting notes and job-plan records.'],
  ['weekly-risk', 'Weekly risk meetings', 'Meetings & clinical learning', 'Look for attendance, agenda or action records from risk meetings.'],
  ['medical-students', 'Teaching medical students (UCLH or elsewhere)', 'Teaching & leadership', 'Find teaching timetables, feedback, slides or emails confirming teaching.'],
  ['presentations', 'Presentations and other teaching', 'Teaching & leadership', 'Collect presentation slides, invitations, feedback and preparation evidence.'],
  ['recruitment', 'Resident doctor recruitment panel (if applicable)', 'Teaching & leadership', 'Check recruitment emails or panel records and note your contribution.'],
  ['article-review', 'Article or research review', 'Reading & case review', 'Record the paper reviewed, date, key learning and relevance to practice.'],
  ['case-review', 'Case reviews and discussion of interesting patients', 'Reading & case review', 'Search meeting notes and emails for case-based discussions or peer review.'],
  ['management-learning', 'Review of patient management and learning', 'Reading & case review', 'Capture what you learned from managing a patient, with all identifying details removed.'],
] as const;

export function createInitialAppraisalPlanner(): AppraisalPlannerState {
  return {
    appraisalPeriod: '1 Nov 2025 – 31 Oct 2026',
    cpdChecklist: cpdItems.map(([id, title, group, lookFor]) => ({
      id,
      title,
      group,
      lookFor,
      completed: false,
      notes: '',
    })),
    qualityProjects: [
      {
        id: 'epic-optimisation',
        title: 'Optimisation of EPIC use',
        period: 'Previous appraisal',
        status: 'Completed',
        summary: 'Worked with the EPIC team to improve ward workflows, introduce SlicerDicer and develop structured documentation such as the MDT Grand Round SmartPhrase.',
        nextStep: '',
      },
      {
        id: 'pre-admission-clinic',
        title: 'Optimisation of pre-admission clinics',
        period: 'Previous appraisal',
        status: 'Completed',
        summary: 'Reviewed the clinic workflow with the admissions team and EPIC, including a shared patient list to support more efficient review and documentation.',
        nextStep: '',
      },
      {
        id: 'ward-round-efficiency',
        title: 'Improvement of ward-round efficiency',
        period: 'Previous appraisal',
        status: 'Completed',
        summary: 'Improved the structure and efficiency of ward rounds to support clearer communication and continuity of care.',
        nextStep: '',
      },
      {
        id: 'safe-admissions',
        title: 'Safer patient transfers and admission decisions',
        period: 'Next appraisal idea',
        status: 'Idea',
        summary: 'Build on the previous appraisal plan to improve early consultant involvement and make admission suitability decisions more consistent.',
        nextStep: 'Consider a simple baseline review of transfer/admission decisions and draft an SOP for discussion with the team.',
      },
      {
        id: 'pre-admission-follow-up',
        title: 'Measure the impact of pre-admission clinic changes',
        period: 'Next appraisal idea',
        status: 'Idea',
        summary: 'Extend the previous clinic work by checking whether the shared workflow has improved preparation, documentation or avoidable delays.',
        nextStep: 'Agree one practical measure with the admissions team and run a small follow-up cycle.',
      },
      {
        id: 'ward-round-follow-up',
        title: 'Review ward-round efficiency and agreed actions',
        period: 'Next appraisal idea',
        status: 'Idea',
        summary: 'Build on the previous ward-round work by reviewing whether agreed actions are clear, allocated and completed reliably.',
        nextStep: 'Choose a small sample of ward rounds and agree a proportionate measure with the ward team.',
      },
    ],
    feedbackReminders: [
      {
        id: 'colleague-360',
        title: 'Colleague 360-degree feedback',
        evidenceLocated: false,
        notes: 'Find the report and record a short reflection on themes and actions.',
      },
      {
        id: 'patient-360',
        title: 'Patient 360-degree feedback',
        lastCompleted: 'January 2026',
        evidenceLocated: false,
        notes: 'Feedback was last completed in January 2026. Find the report and add a reflection.',
      },
    ],
  };
}
