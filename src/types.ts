export const LEAD_STATUSES = [
  "Neu",
  "Kontaktiert",
  "Follow Up",
  "Angebot gesendet",
  "Verhandlung",
  "Geraet aufgestellt",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

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
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}
