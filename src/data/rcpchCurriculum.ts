import { LearningOutcome } from '../types';

export const RCPCH_LEARNING_OUTCOMES: LearningOutcome[] = [
  {
    id: 'LO1',
    number: 1,
    title: 'Professional values and behaviours',
    gmcDomain: 'GMC Domain 1: Knowledge, skills and performance & Domain 4: Trust',
    shortDesc: 'Practices within professional, ethical and legal boundaries, demonstrating honesty, empathy, cultural awareness and respect.',
    coreCapabilities: [
      'Acts in accordance with GMC Good Medical Practice and RCPCH guidelines',
      'Demonstrates integrity, compassion, cultural sensitivity and active listening with children, young people and families',
      'Understands paediatric consent, Gillick competence, Fraser guidelines and parental responsibility',
      'Recognises limits of personal competence and seeks timely senior advice',
      'Manages time effectively, prioritises acute clinical workload, and maintains professional boundaries'
    ],
    specialtyCapabilities: [
      'Role models professional behaviours and mentors junior team members and students',
      'Navigates complex ethical dilemmas in neonates and children (e.g. withdrawal of life-sustaining treatment, organ donation)',
      'Manages conflict resolution with families and multidisciplinary colleagues calmly and constructively'
    ],
    level3Capabilities: [
      'Exemplifies consultant-level ethical leadership and legal compliance across subspecialty practice',
      'Represents paediatric interests in hospital clinical ethics committees and coroner hearings'
    ],
    guidanceNotes: 'Evidence with: Reflective notes on ethical challenges, MSF/colleague feedback, Mini-CEX in difficult consultations, attendance at ethics grand rounds.',
    color: '#0284c7' // sky-600
  },
  {
    id: 'LO2',
    number: 2,
    title: 'Professional skills: Communication',
    gmcDomain: 'GMC Domain 3: Communication, partnership and teamwork',
    shortDesc: 'Communicates effectively with children, young people, parents/carers and colleagues across verbal, non-verbal and written modalities.',
    coreCapabilities: [
      'Communicates age-appropriately with infants, toddlers, school-age children and adolescents',
      'Delivers clear, empathetic explanations of diagnoses, investigations and management plans to parents',
      'Conducts structured handovers (SBAR) safely between shifts and multidisciplinary teams',
      'Breaks difficult or bad news with appropriate sensitivity, privacy and follow-up plan'
    ],
    specialtyCapabilities: [
      'Leads complex multidisciplinary case conferences, discharge planning for high-dependency patients, and inter-hospital transfer communications',
      'Communicates effectively in highly charged resuscitations and emotional bereavement settings'
    ],
    level3Capabilities: [
      'Chairs complex child protection strategy meetings, critical incident debriefs, and handles complex formal complaints'
    ],
    guidanceNotes: 'Evidence with: Mini-CEX in breaking bad news / adolescent consultations, HAT (Handover assessments), clinic letters audit, feedback from parent surveys.',
    color: '#0d9488' // teal-600
  },
  {
    id: 'LO3',
    number: 3,
    title: 'Professional skills: Procedures & clinical examination',
    gmcDomain: 'GMC Domain 1: Knowledge, skills and performance',
    shortDesc: 'Performs thorough, gentle paediatric examinations and executes diagnostic & therapeutic procedural skills safely.',
    coreCapabilities: [
      'Performs systematic developmental, neonatal and general paediatric clinical examinations',
      'Competent in infant/child venepuncture, cannulation, capillary/arterial blood gas sampling',
      'Competent in Bag-Valve-Mask ventilation in neonates and children, Lumbar Puncture (LP), and clean-catch/catheter urine sampling',
      'Performs Umbilical Venous and Arterial Catheterisation (UVC/UAC) and endotracheal intubation in neonates under supervision'
    ],
    specialtyCapabilities: [
      'Independently performs difficult neonatal intubations, chest drain insertion/needle aspiration, long line insertion (percutaneous central lines), and lumbar punctures in challenging neonates',
      'Supervises and teaches junior trainees and ANNP/nurses in core procedures'
    ],
    level3Capabilities: [
      'Executes expert procedural skills in resuscitation, emergency management of difficult airways, and leads procedural skills training programs'
    ],
    guidanceNotes: 'Evidence with: DOPS forms (e.g. LP, Intubation, UVC/UAC, Cannulation), clinical skills logbook entries, simulation debrief records.',
    color: '#7c3aed' // violet-600
  },
  {
    id: 'LO4',
    number: 4,
    title: 'Professional skills: Patient management',
    gmcDomain: 'GMC Domain 1: Knowledge, skills and performance',
    shortDesc: 'Diagnoses, investigates, plans and manages acute, chronic, emergency and complex paediatric and neonatal illnesses.',
    coreCapabilities: [
      'Recognises the deteriorating child using PEWS/NEWTT and initiates structured A-E resuscitation',
      'Manages common acute conditions: bronchiolitis, viral wheeze/asthma, gastroenteritis, sepsis, febrile convulsions, neonatal jaundice',
      'Formulates safe fluid prescribing, medication dosing (BNFC), and antimicrobial stewardship plans',
      'Recognises when to escalate care to PICU/NICU/retrieval transport services (e.g. CATS, STRS, NTS)'
    ],
    specialtyCapabilities: [
      'Leads paediatric arrest/crash calls and neonatal resuscitation calls independently as medical registrar',
      'Manages complex subspecialty inpatients (e.g. oncology neutropenic sepsis, metabolic crises, diabetic ketoacidosis, status epilepticus)'
    ],
    level3Capabilities: [
      'Operates at consultant level for whole-service inpatient triage, bed management, regional specialist referrals, and long-term complex condition pathways'
    ],
    guidanceNotes: 'Evidence with: Mini-CEX on acute take, CbD on complex admissions, ACAT on night shifts, Resuscitation course certificates (APLS/NLS/EPALS).',
    color: '#e11d48' // rose-600
  },
  {
    id: 'LO5',
    number: 5,
    title: 'Health promotion and illness prevention',
    gmcDomain: 'GMC Domain 1: Knowledge, skills and performance',
    shortDesc: 'Promotes child health, immunisation, nutrition, mental wellbeing, and disease prevention in hospital and community settings.',
    coreCapabilities: [
      'Advocates for the UK routine childhood immunisation schedule and addresses vaccine hesitancy objectively',
      'Provides evidence-based advice on infant feeding, breastfeeding support, weaning, and childhood obesity prevention',
      'Identifies social determinants of health, poverty, and environmental factors affecting child health outcomes'
    ],
    specialtyCapabilities: [
      'Implements health promotion interventions across chronic disease clinics (e.g. adolescent diabetes transition, asthma action plans)',
      'Collaborates with public health, health visitors, school nurses and community child health teams'
    ],
    level3Capabilities: [
      'Develops regional health prevention strategies, child mortality review contributions, and public health advocacy programs'
    ],
    guidanceNotes: 'Evidence with: Case reflections on vaccine discussions, clinic leaflets designed, health promotion audits, community placement logs.',
    color: '#16a34a' // green-600
  },
  {
    id: 'LO6',
    number: 6,
    title: 'Leadership and team working',
    gmcDomain: 'GMC Domain 3: Communication, partnership and teamwork',
    shortDesc: 'Works collaboratively in multidisciplinary teams, demonstrates leadership, delegates safely, and supports team wellbeing.',
    coreCapabilities: [
      'Works effectively with nursing, pharmacy, allied health professionals (dietitians, physio), and medical teams',
      'Demonstrates effective prioritization and calm communication during busy on-call shifts',
      'Participates constructively in clinical handovers and multi-disciplinary team (MDT) meetings'
    ],
    specialtyCapabilities: [
      'Leads the paediatric medical team on night shifts and busy ward rounds, delegating workload safely based on junior team competence',
      'Manages bed pressures, rotas, and supports junior doctor wellbeing and debriefing after stressful incidents'
    ],
    level3Capabilities: [
      'Provides strategic departmental leadership, chairs departmental meetings, and contributes to hospital governance committees'
    ],
    guidanceNotes: 'Evidence with: ACAT on running the take, MSF/TAB colleague ratings, leadership course reflections, rota coordination feedback.',
    color: '#d97706' // amber-600
  },
  {
    id: 'LO7',
    number: 7,
    title: 'Patient safety, clinical governance & infection control',
    gmcDomain: 'GMC Domain 2: Safety and quality',
    shortDesc: 'Promotes patient safety culture, adheres to infection control, reports incidents, and engages in clinical governance.',
    coreCapabilities: [
      'Applies strict hand hygiene, aseptic non-touch technique (ANTT), and isolation protocols',
      'Reports clinical incidents and near-misses via local incident reporting systems (e.g. Datix/Ulysses)',
      'Demonstrates safe prescribing practices using BNFC and double-checking high-risk calculations (e.g. morphine, potassium, inotropes)',
      'Participates in departmental Morbidity and Mortality (M&M) meetings and root cause analysis'
    ],
    specialtyCapabilities: [
      'Conducts formal Significant Event Analyses (SEA) and presents at departmental clinical governance meetings',
      'Reviews local clinical guidelines and safety alerts (MHRA/CAS)'
    ],
    level3Capabilities: [
      'Leads departmental safety audits, writes trust-wide paediatric guidelines, and participates in Serious Incident (SI) investigation panels'
    ],
    guidanceNotes: 'Evidence with: Datix incident report reflection, Datix review meeting attendance, Guideline creation/update WPBA, M&M presentation notes.',
    color: '#dc2626' // red-600
  },
  {
    id: 'LO8',
    number: 8,
    title: 'Quality improvement (QIP)',
    gmcDomain: 'GMC Domain 2: Safety and quality',
    shortDesc: 'Applies Quality Improvement methodology (PDSA cycles, run charts) to enhance healthcare delivery, patient safety, and clinical outcomes.',
    coreCapabilities: [
      'Understands basic QI principles (Plan-Do-Study-Act cycles, driver diagrams, SMART aims, measurement for improvement)',
      'Participates actively in a departmental clinical audit or Quality Improvement Project (QIP)',
      'Collects, analyzes and presents audit/QI data with meaningful recommendations'
    ],
    specialtyCapabilities: [
      'Designs, leads and executes a multi-cycle Quality Improvement Project (QIP) with measurable clinical impact',
      'Completes the official QIPAT (Quality Improvement Project Assessment Tool) with supervising consultant'
    ],
    level3Capabilities: [
      'Supervises junior trainees in QI initiatives, sustains improvement across rotations, and submits QI work for regional/national dissemination'
    ],
    guidanceNotes: 'Evidence with: Completed QIPAT form, QIP poster/presentation slides, PDSA cycle documentation, Run chart data summaries.',
    color: '#2563eb' // blue-600
  },
  {
    id: 'LO9',
    number: 9,
    title: 'Safeguarding',
    gmcDomain: 'GMC Domain 2: Safety and quality & Domain 1: Knowledge',
    shortDesc: 'Recognises indicators of child abuse and neglect, initiates multi-agency child protection processes, and maintains child-centred advocacy.',
    coreCapabilities: [
      'Maintains up-to-date Level 3 Safeguarding Children certification',
      'Recognises physical abuse, emotional abuse, sexual abuse, fabricated or induced illness (FII), and neglect in children',
      'Performs and documents thorough child protection examinations with body maps under supervision',
      'Fulfills legal duty of reporting to Hospital Safeguarding Leads, Children\'s Social Care (MASH), and attending strategy discussions'
    ],
    specialtyCapabilities: [
      'Conducts Child Protection Medical Examinations (CPMEs) for physical abuse and neglect, producing robust court-ready medical reports under consultant supervision',
      'Presents evidence at child protection conferences and multi-agency strategy meetings'
    ],
    level3Capabilities: [
      'Provides expert child protection advice, leads child death review processes, and writes comprehensive independent safeguarding reports'
    ],
    guidanceNotes: 'Evidence with: Safeguarding Level 3 certificate, CbD on safeguarding cases, Child Protection Medical Examination log, Peer-reviewed safeguarding report.',
    color: '#9333ea' // purple-600
  },
  {
    id: 'LO10',
    number: 10,
    title: 'Education and training',
    gmcDomain: 'GMC Domain 1: Knowledge, skills and performance & Domain 3',
    shortDesc: 'Plans, delivers and evaluates clinical teaching for medical students, nurses, junior trainees, and patients/families.',
    coreCapabilities: [
      'Delivers bedside clinical teaching, small group tutorials, and case presentations to students and multidisciplinary team',
      'Gives constructive, timely feedback to learners and medical students',
      'Participates in departmental teaching rotas and journal clubs'
    ],
    specialtyCapabilities: [
      'Designs structured simulation training sessions (in-situ sim, resus scenarios) and facilitates debriefings',
      'Completes formal Training the Trainers / Teaching course and obtains formal feedback via Assessment of Teaching (AoT)'
    ],
    level3Capabilities: [
      'Acts as clinical supervisor for foundation/GP/core trainees, designs curriculum modules, and conducts educational appraisals'
    ],
    guidanceNotes: 'Evidence with: AoT (Assessment of Teaching) form, student teaching feedback forms, simulation scenario design documentation, journal club slides.',
    color: '#0891b2' // cyan-600
  },
  {
    id: 'LO11',
    number: 11,
    title: 'Research and scholarship',
    gmcDomain: 'GMC Domain 1: Knowledge, skills and performance',
    shortDesc: 'Critically appraises scientific literature, applies evidence-based medicine, and engages with clinical research and academic scholarship.',
    coreCapabilities: [
      'Searches and critically appraises paediatric medical literature (PICO format, statistical methodology, bias evaluation)',
      'Applies national guidelines (NICE, RCPCH, BTS, SIGN) to clinical decision making',
      'Maintains Good Clinical Practice (GCP) certification if involved in clinical trials'
    ],
    specialtyCapabilities: [
      'Recruits patients to national paediatric research studies (e.g. NIHR portfolio studies, PERUKI, BPSU)',
      'Submits original abstracts, case reports or audits for presentation at regional or national conferences (e.g. RCPCH Conference, NeoResus)'
    ],
    level3Capabilities: [
      'Leads clinical research studies, writes peer-reviewed papers, and contributes to guideline steering groups'
    ],
    guidanceNotes: 'Evidence with: Journal club critical appraisal presentation, conference poster/oral certificate, publication reference, GCP certificate.',
    color: '#4f46e5' // indigo-600
  }
];

export const STANDARD_PROCEDURES = [
  { name: 'Lumbar Puncture (Infant / Child)', category: 'General Paediatric Inpatient' },
  { name: 'Lumbar Puncture (Neonate <28 days)', category: 'Neonatal' },
  { name: 'Neonatal Endotracheal Intubation', category: 'Neonatal' },
  { name: 'Paediatric Endotracheal Intubation (Resus / PICU)', category: 'Paediatric Resuscitation' },
  { name: 'Umbilical Venous Catheterisation (UVC)', category: 'Neonatal' },
  { name: 'Umbilical Arterial Catheterisation (UAC)', category: 'Neonatal' },
  { name: 'Percutaneous Long Line / PICC Insertion', category: 'Neonatal' },
  { name: 'Bag-Valve-Mask (BVM) Ventilation & Neopuff T-piece', category: 'Paediatric Resuscitation' },
  { name: 'Intraosseous (IO) Needle Insertion (EZ-IO / manual)', category: 'Paediatric Resuscitation' },
  { name: 'Chest Drain Insertion / Needle Thoracocentesis', category: 'Emergency / Trauma' },
  { name: 'Peripheral Cannulation (Difficult Neonate/Infant)', category: 'General Paediatric Inpatient' },
  { name: 'Arterial Blood Gas (Radial / Femoral Stab)', category: 'General Paediatric Inpatient' },
  { name: 'Capillary Blood Gas Sampling', category: 'Neonatal' },
  { name: 'Child Protection Medical Examination & Body Map', category: 'Safeguarding Medical' },
  { name: 'Suprapubic Bladder Aspiration / Catheterisation', category: 'General Paediatric Inpatient' },
  { name: 'Cranial Ultrasound Screening (Neonatal)', category: 'Neonatal' },
  { name: 'Surfactant Administration (LISA / MIST / ETT)', category: 'Neonatal' },
  { name: 'Nasal Cannula / High Flow / CPAP Setup', category: 'General Paediatric Inpatient' }
];
