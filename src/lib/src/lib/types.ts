export interface Lead {
  id: string;
  firmenname: string;
  adresse: string | null;
  telefon: string | null;
  webseite: string | null;
  ansprechpartner: string | null;
  status: string;
  letzter_kontakt: string | null;
  letzter_kontakt_von: string | null;
  naechster_schritt: string | null;
  notiz: string | null;
  owner_name: string | null;
  owner_since: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export const STATUSES = [
  'Noch nicht kontaktiert',
  'Kontaktiert',
  'Ablehnung',
  'Follow Up',
  'Pitch Durchfuehrung',
  'Vertrag zugesendet',
  'Geraet aufgestellt',
] as const;

export type LeadStatus = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<string, string> = {
  'Noch nicht kontaktiert': 'Noch nicht kontaktiert',
  'Kontaktiert': 'Kontaktiert',
  'Ablehnung': 'Ablehnung (abgelehnt)',
  'Follow Up': 'Follow Up (Pitch verabredet)',
  'Pitch Durchfuehrung': 'Pitch Durchführung',
  'Vertrag zugesendet': 'Vertrag zugesendet',
  'Geraet aufgestellt': 'Gerät aufgestellt',
};

export const OWNER_THRESHOLD_INDEX = 3;
