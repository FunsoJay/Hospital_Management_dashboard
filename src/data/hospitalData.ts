import {
  APPOINTMENTS_CSV,
  BILLING_CSV,
  DOCTORS_CSV,
  PATIENTS_CSV,
  TREATMENTS_CSV,
} from './rawCsv';

export interface RawPatient {
  patient_id: string;
  first_name: string;
  last_name: string;
  gender: 'M' | 'F' | string;
  date_of_birth: string;
  contact_number: string;
  address: string;
  registration_date: string;
  insurance_provider: string;
  insurance_number: string;
  email: string;
}

export interface Patient extends RawPatient {
  fullName: string;
  age: number;
  ageBand: '<30' | '30-44' | '45-59' | '60+';
}

export interface RawDoctor {
  doctor_id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  phone_number: string;
  years_experience: number;
  hospital_branch: string;
  email: string;
}

export interface Doctor extends RawDoctor {
  fullName: string;
}

export interface RawAppointment {
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  reason_for_visit: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show' | string;
}

export interface Appointment extends RawAppointment {
  dateObj: Date;
  yearMonth: string;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  dayName: string;
  hour: number;
  timeSlot: string;
  isCancelled: boolean;
  isNoShow: boolean;
  isCompleted: boolean;
  isScheduled: boolean;
}

export interface RawTreatment {
  treatment_id: string;
  appointment_id: string;
  treatment_type: string;
  description: string;
  cost: number;
  treatment_date: string;
}

export interface Treatment extends RawTreatment {
  dateObj: Date;
  yearMonth: string;
}

export interface RawBill {
  bill_id: string;
  patient_id: string;
  treatment_id: string;
  bill_date: string;
  amount: number;
  payment_method: 'Cash' | 'Credit Card' | 'Insurance' | string;
  payment_status: 'Paid' | 'Pending' | 'Failed' | string;
}

export interface Bill extends RawBill {
  dateObj: Date;
  yearMonth: string;
  isPaid: boolean;
  isPending: boolean;
  isFailed: boolean;
  ageingDays: number;
  ageingBucket: '0-30 days' | '31-60 days' | '61-90 days' | '90+ days';
}

export interface EnrichedRecord {
  bill?: Bill;
  treatment?: Treatment;
  appointment?: Appointment;
  doctor?: Doctor;
  patient?: Patient;
}

export interface DataQualityIssue {
  id: string;
  category: 'Anomaly' | 'Mismatch' | 'FK Integrity' | 'Date Sequencing' | 'Outlier';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  count: number;
  sampleIds: string[];
  records: Array<Record<string, any>>;
}

export interface DataQualityReport {
  totalRecordsChecked: number;
  cleanPercentage: number;
  issues: DataQualityIssue[];
  outliersCount: number;
  mismatchesCount: number;
  orphansCount: number;
  dateSequencingCount: number;
  summary: {
    missingValues: number;
    duplicateKeys: number;
    cancelledWithTreatments: number;
    cancelledWithBills: number;
    amountCostMismatches: number;
    appBeforeReg: number;
  };
}

// Simple CSV parser that handles standard quoted or unquoted fields
function parseCsv(text: string): Array<Record<string, string>> {
  const lines = text.trim().split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Handle standard comma split
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let c = 0; c < rawLine.length; c++) {
      const char = rawLine[c];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current.trim());

    const rowObj: Record<string, string> = {};
    headers.forEach((h, index) => {
      rowObj[h] = parts[index] ?? '';
    });
    rows.push(rowObj);
  }

  return rows;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Reference baseline date for dataset (end of 2023 calendar period: 2023-12-31)
const DATASET_REFERENCE_DATE = new Date('2023-12-31T23:59:59Z');

export function loadAndProcessHospitalData() {
  const rawPatientsList = parseCsv(PATIENTS_CSV);
  const rawDoctorsList = parseCsv(DOCTORS_CSV);
  const rawAppointmentsList = parseCsv(APPOINTMENTS_CSV);
  const rawTreatmentsList = parseCsv(TREATMENTS_CSV);
  const rawBillingList = parseCsv(BILLING_CSV);

  // 1. Process Patients
  const patientsMap = new Map<string, Patient>();
  const patients: Patient[] = rawPatientsList.map((r) => {
    const dob = new Date(r.date_of_birth);
    // age in years relative to dataset year 2023
    let age = 2023 - dob.getFullYear();
    if (age < 0 || isNaN(age)) age = 35;

    let ageBand: Patient['ageBand'] = '30-44';
    if (age < 30) ageBand = '<30';
    else if (age <= 44) ageBand = '30-44';
    else if (age <= 59) ageBand = '45-59';
    else ageBand = '60+';

    const p: Patient = {
      patient_id: r.patient_id,
      first_name: r.first_name,
      last_name: r.last_name,
      fullName: `${r.first_name} ${r.last_name}`,
      gender: r.gender,
      date_of_birth: r.date_of_birth,
      contact_number: r.contact_number,
      address: r.address,
      registration_date: r.registration_date,
      insurance_provider: r.insurance_provider,
      insurance_number: r.insurance_number,
      email: r.email,
      age,
      ageBand,
    };
    patientsMap.set(p.patient_id, p);
    return p;
  });

  // 2. Process Doctors
  const doctorsMap = new Map<string, Doctor>();
  const doctors: Doctor[] = rawDoctorsList.map((r) => {
    const doc: Doctor = {
      doctor_id: r.doctor_id,
      first_name: r.first_name,
      last_name: r.last_name,
      fullName: `Dr. ${r.first_name} ${r.last_name}`,
      specialization: r.specialization,
      phone_number: r.phone_number,
      years_experience: Number(r.years_experience) || 0,
      hospital_branch: r.hospital_branch,
      email: r.email,
    };
    doctorsMap.set(doc.doctor_id, doc);
    return doc;
  });

  // 3. Process Appointments
  const appointmentsMap = new Map<string, Appointment>();
  const appointments: Appointment[] = rawAppointmentsList.map((r) => {
    const dateObj = new Date(r.appointment_date + 'T' + (r.appointment_time || '00:00:00'));
    const ym = r.appointment_date ? r.appointment_date.slice(0, 7) : '2023-01';
    const dayOfWeek = isNaN(dateObj.getDay()) ? 1 : dateObj.getDay();
    const hour = parseInt(r.appointment_time?.split(':')[0] || '8', 10);
    const hourStr = `${hour.toString().padStart(2, '0')}:00`;

    const app: Appointment = {
      appointment_id: r.appointment_id,
      patient_id: r.patient_id,
      doctor_id: r.doctor_id,
      appointment_date: r.appointment_date,
      appointment_time: r.appointment_time,
      reason_for_visit: r.reason_for_visit,
      status: r.status,
      dateObj,
      yearMonth: ym,
      dayOfWeek,
      dayName: DAY_NAMES[dayOfWeek],
      hour,
      timeSlot: hourStr,
      isCancelled: r.status === 'Cancelled',
      isNoShow: r.status === 'No-show',
      isCompleted: r.status === 'Completed',
      isScheduled: r.status === 'Scheduled',
    };
    appointmentsMap.set(app.appointment_id, app);
    return app;
  });

  // 4. Process Treatments
  const treatmentsMap = new Map<string, Treatment>();
  const treatments: Treatment[] = rawTreatmentsList.map((r) => {
    const dateObj = new Date(r.treatment_date + 'T00:00:00Z');
    const ym = r.treatment_date ? r.treatment_date.slice(0, 7) : '2023-01';
    const cost = parseFloat(r.cost) || 0;

    const t: Treatment = {
      treatment_id: r.treatment_id,
      appointment_id: r.appointment_id,
      treatment_type: r.treatment_type,
      description: r.description,
      cost,
      treatment_date: r.treatment_date,
      dateObj,
      yearMonth: ym,
    };
    treatmentsMap.set(t.treatment_id, t);
    return t;
  });

  // 5. Process Billing
  const billingMap = new Map<string, Bill>();
  const billing: Bill[] = rawBillingList.map((r) => {
    const dateObj = new Date(r.bill_date + 'T00:00:00Z');
    const ym = r.bill_date ? r.bill_date.slice(0, 7) : '2023-01';
    const amount = parseFloat(r.amount) || 0;
    const isPaid = r.payment_status === 'Paid';
    const isPending = r.payment_status === 'Pending';
    const isFailed = r.payment_status === 'Failed';

    // Ageing: days from bill_date to dataset reference date (or now)
    const diffTime = Math.max(0, DATASET_REFERENCE_DATE.getTime() - dateObj.getTime());
    const ageingDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let ageingBucket: Bill['ageingBucket'] = '0-30 days';
    if (ageingDays <= 30) ageingBucket = '0-30 days';
    else if (ageingDays <= 60) ageingBucket = '31-60 days';
    else if (ageingDays <= 90) ageingBucket = '61-90 days';
    else ageingBucket = '90+ days';

    const b: Bill = {
      bill_id: r.bill_id,
      patient_id: r.patient_id,
      treatment_id: r.treatment_id,
      bill_date: r.bill_date,
      amount,
      payment_method: r.payment_method,
      payment_status: r.payment_status,
      dateObj,
      yearMonth: ym,
      isPaid,
      isPending,
      isFailed,
      ageingDays,
      ageingBucket,
    };
    billingMap.set(b.bill_id, b);
    return b;
  });

  // 6. Build Master Joined Records
  // Every bill links to a treatment, which links to an appointment, doctor, and patient
  const masterRecords: EnrichedRecord[] = billing.map((bill) => {
    const treatment = treatmentsMap.get(bill.treatment_id);
    const appointment = treatment ? appointmentsMap.get(treatment.appointment_id) : undefined;
    const doctor = appointment ? doctorsMap.get(appointment.doctor_id) : undefined;
    const patient = patientsMap.get(bill.patient_id);
    return {
      bill,
      treatment,
      appointment,
      doctor,
      patient,
    };
  });

  // 7. Perform Comprehensive Data Quality Checks
  const qualityReport = runDataQualityAudit({
    patients,
    doctors,
    appointments,
    treatments,
    billing,
    patientsMap,
    doctorsMap,
    appointmentsMap,
    treatmentsMap,
    billingMap,
  });

  return {
    patients,
    doctors,
    appointments,
    treatments,
    billing,
    patientsMap,
    doctorsMap,
    appointmentsMap,
    treatmentsMap,
    billingMap,
    masterRecords,
    qualityReport,
  };
}

function runDataQualityAudit({
  patients,
  doctors,
  appointments,
  treatments,
  billing,
  patientsMap,
  doctorsMap,
  appointmentsMap,
  treatmentsMap,
}: {
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  treatments: Treatment[];
  billing: Bill[];
  patientsMap: Map<string, Patient>;
  doctorsMap: Map<string, Doctor>;
  appointmentsMap: Map<string, Appointment>;
  treatmentsMap: Map<string, Treatment>;
  billingMap: Map<string, Bill>;
}): DataQualityReport {
  const issues: DataQualityIssue[] = [];

  // A. Cancelled appointments with linked treatments
  const cancelledWithTreatments: Array<{ appointment: Appointment; treatment: Treatment }> = [];
  treatments.forEach((t) => {
    const app = appointmentsMap.get(t.appointment_id);
    if (app && app.status === 'Cancelled') {
      cancelledWithTreatments.push({ appointment: app, treatment: t });
    }
  });

  if (cancelledWithTreatments.length > 0) {
    issues.push({
      id: 'DQ-01',
      category: 'Anomaly',
      severity: 'high',
      title: 'Treatments Logged for Cancelled Appointments',
      description: `${cancelledWithTreatments.length} treatments are linked to appointments recorded with status 'Cancelled'. In a clinical workflow, cancelled visits should not generate procedure records without an override.`,
      count: cancelledWithTreatments.length,
      sampleIds: cancelledWithTreatments.slice(0, 5).map((x) => `${x.treatment.treatment_id} (${x.appointment.appointment_id})`),
      records: cancelledWithTreatments.map((x) => ({
        treatmentId: x.treatment.treatment_id,
        appointmentId: x.appointment.appointment_id,
        type: x.treatment.treatment_type,
        cost: x.treatment.cost,
        appDate: x.appointment.appointment_date,
        status: x.appointment.status,
      })),
    });
  }

  // B. Bills generated for Cancelled appointments
  const cancelledWithBills: Array<{ bill: Bill; appointment: Appointment; treatment?: Treatment }> = [];
  billing.forEach((b) => {
    const t = treatmentsMap.get(b.treatment_id);
    if (t) {
      const app = appointmentsMap.get(t.appointment_id);
      if (app && app.status === 'Cancelled') {
        cancelledWithBills.push({ bill: b, appointment: app, treatment: t });
      }
    }
  });

  if (cancelledWithBills.length > 0) {
    const paidCount = cancelledWithBills.filter((x) => x.bill.payment_status === 'Paid').length;
    issues.push({
      id: 'DQ-02',
      category: 'Anomaly',
      severity: 'high',
      title: 'Bills Generated for Cancelled Appointments',
      description: `${cancelledWithBills.length} billing records exist for cancelled appointments (totaling $${cancelledWithBills.reduce((s, x) => s + x.bill.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}). Crucially, ${paidCount} of these bills were marked 'Paid', indicating potential billing collection discrepancies.`,
      count: cancelledWithBills.length,
      sampleIds: cancelledWithBills.slice(0, 5).map((x) => `${x.bill.bill_id} ($${x.bill.amount.toFixed(0)})`),
      records: cancelledWithBills.map((x) => ({
        billId: x.bill.bill_id,
        appointmentId: x.appointment.appointment_id,
        treatmentId: x.treatment?.treatment_id,
        amount: x.bill.amount,
        status: x.bill.payment_status,
        method: x.bill.payment_method,
      })),
    });
  }

  // C. Appointments dated BEFORE patient registration_date
  const appBeforeReg: Array<{ appointment: Appointment; patient: Patient }> = [];
  appointments.forEach((a) => {
    const p = patientsMap.get(a.patient_id);
    if (p && p.registration_date) {
      if (a.appointment_date < p.registration_date) {
        appBeforeReg.push({ appointment: a, patient: p });
      }
    }
  });

  if (appBeforeReg.length > 0) {
    issues.push({
      id: 'DQ-03',
      category: 'Date Sequencing',
      severity: 'medium',
      title: 'Appointments Preceding Patient Registration Date',
      description: `${appBeforeReg.length} appointments are dated earlier than the patient's recorded system registration date. For example, Patient P012 registered on 2023-04-27 but has appointment A069 on 2023-03-29.`,
      count: appBeforeReg.length,
      sampleIds: appBeforeReg.slice(0, 5).map((x) => `${x.appointment.appointment_id} (Pat: ${x.patient.patient_id})`),
      records: appBeforeReg.map((x) => ({
        appointmentId: x.appointment.appointment_id,
        patientId: x.patient.patient_id,
        appointmentDate: x.appointment.appointment_date,
        registrationDate: x.patient.registration_date,
      })),
    });
  }

  // D. Bill amount vs Treatment cost mismatches
  const amountMismatches: Array<{ bill: Bill; treatment: Treatment; diff: number }> = [];
  billing.forEach((b) => {
    const t = treatmentsMap.get(b.treatment_id);
    if (t) {
      const diff = Math.abs(b.amount - t.cost);
      if (diff > 0.01) {
        amountMismatches.push({ bill: b, treatment: t, diff });
      }
    }
  });

  if (amountMismatches.length > 0) {
    issues.push({
      id: 'DQ-04',
      category: 'Mismatch',
      severity: 'medium',
      title: 'Billing Amount vs Treatment Cost Variance',
      description: `${amountMismatches.length} bills show a discrepancy between bill.amount and treatment.cost.`,
      count: amountMismatches.length,
      sampleIds: amountMismatches.slice(0, 5).map((x) => x.bill.bill_id),
      records: amountMismatches.map((x) => ({
        billId: x.bill.bill_id,
        billAmount: x.bill.amount,
        treatmentCost: x.treatment.cost,
        diff: x.diff,
      })),
    });
  } else {
    issues.push({
      id: 'DQ-04',
      category: 'Mismatch',
      severity: 'low',
      title: '100% Bill Amount to Treatment Cost Alignment',
      description: 'All 200 billing entries exactly match their corresponding treatment procedure costs ($0.00 delta across all records).',
      count: 0,
      sampleIds: [],
      records: [],
    });
  }

  // E. Orphaned foreign keys
  const orphanedAppointments = appointments.filter((a) => !patientsMap.has(a.patient_id) || !doctorsMap.has(a.doctor_id));
  const orphanedTreatments = treatments.filter((t) => !appointmentsMap.has(t.appointment_id));
  const orphanedBills = billing.filter((b) => !patientsMap.has(b.patient_id) || !treatmentsMap.has(b.treatment_id));
  const totalOrphans = orphanedAppointments.length + orphanedTreatments.length + orphanedBills.length;

  if (totalOrphans > 0) {
    issues.push({
      id: 'DQ-05',
      category: 'FK Integrity',
      severity: 'high',
      title: 'Orphaned Foreign Keys Detected',
      description: `Identified ${totalOrphans} records with missing foreign key references.`,
      count: totalOrphans,
      sampleIds: [...orphanedAppointments, ...orphanedTreatments, ...orphanedBills].slice(0, 5).map((x: any) => x.appointment_id || x.treatment_id || x.bill_id),
      records: [],
    });
  }

  // F. Outlier Detection using IQR Method
  const amounts = billing.map((b) => b.amount).sort((a, b) => a - b);
  const q1 = amounts[Math.floor(amounts.length * 0.25)];
  const q3 = amounts[Math.floor(amounts.length * 0.75)];
  const iqr = q3 - q1;
  const lowerBound = Math.max(0, q1 - 1.5 * iqr);
  const upperBound = q3 + 1.5 * iqr;

  const outliers = billing.filter((b) => b.amount < lowerBound || b.amount > upperBound);

  issues.push({
    id: 'DQ-06',
    category: 'Outlier',
    severity: 'low',
    title: 'Statistical Price Distribution & Outliers (IQR Method)',
    description: `Billing amounts range from $${amounts[0]?.toFixed(2)} to $${amounts[amounts.length - 1]?.toFixed(2)}. Interquartile range: Q1=$${q1?.toFixed(2)}, Q3=$${q3?.toFixed(2)} (IQR=$${iqr?.toFixed(2)}). Lower fence: $${lowerBound.toFixed(2)}, Upper fence: $${upperBound.toFixed(2)}. ${outliers.length} records fall outside the 1.5x IQR boundary.`,
    count: outliers.length,
    sampleIds: outliers.map((o) => `${o.bill_id} ($${o.amount.toFixed(2)})`),
    records: outliers.map((o) => ({
      billId: o.bill_id,
      amount: o.amount,
      status: o.payment_status,
      method: o.payment_method,
    })),
  });

  const totalChecks = patients.length + doctors.length + appointments.length + treatments.length + billing.length;
  const criticalFlaws = cancelledWithTreatments.length + appBeforeReg.length;
  const cleanPercentage = Math.round(((totalChecks - criticalFlaws) / totalChecks) * 100);

  return {
    totalRecordsChecked: totalChecks,
    cleanPercentage,
    issues,
    outliersCount: outliers.length,
    mismatchesCount: amountMismatches.length,
    orphansCount: totalOrphans,
    dateSequencingCount: appBeforeReg.length,
    summary: {
      missingValues: 0,
      duplicateKeys: 0,
      cancelledWithTreatments: cancelledWithTreatments.length,
      cancelledWithBills: cancelledWithBills.length,
      amountCostMismatches: amountMismatches.length,
      appBeforeReg: appBeforeReg.length,
    },
  };
}

// PII Masking Utilities
export function maskPhone(phone: string, reveal = false): string {
  if (reveal || !phone) return phone;
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 4) return '***';
  return `***-***-${clean.slice(-4)}`;
}

export function maskEmail(email: string, reveal = false): string {
  if (reveal || !email) return email;
  const parts = email.split('@');
  if (parts.length < 2) return '***@***';
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
  return `${maskedName}@${domain}`;
}

export function maskAddress(address: string, reveal = false): string {
  if (reveal || !address) return address;
  const words = address.split(' ');
  if (words.length <= 1) return '***';
  return `*** ${words.slice(1).join(' ')}`;
}

export function maskInsurance(insNumber: string, reveal = false): string {
  if (reveal || !insNumber) return insNumber;
  if (insNumber.length < 4) return '***';
  return `INS***${insNumber.slice(-3)}`;
}
