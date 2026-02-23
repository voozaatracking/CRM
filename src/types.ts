export const LEAD_STATUSES = [
  "Neu",
  "Kontaktiert",
  "Follow Up",
  "Angebot gesendet",
  "Verhandlung",
  "Geraet aufgestellt",
] as const;

export const INACTIVE_STATUSES = [
  "Kein Interesse",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number] | (typeof INACTIVE_STATUSES)[number];

export const MITARBEITER = [
  "Luis",
  "David",
  "Stian",
  "Konrad",
  "Mitarbeiter 5",
  "Mitarbeiter 6",
  "Mitarbeiter 7",
  "Mitarbeiter 8",
  "Mitarbeiter 9",
  "Mitarbeiter 10",
];

export interface Lead {
  id: string;
  company_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: LeadStatus;
  owner: string | null;
  notes: string | null;
  last_contacted_at: string | null;
  first_contacted_at: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}
