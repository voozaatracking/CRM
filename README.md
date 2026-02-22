# CRM
# CRM Lite

Einfaches CRM für Vertriebsteams – Kanban Board, Lead-Management, CSV-Import.

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- @dnd-kit (Drag & Drop)
- Supabase (Postgres)
- Vercel Deployment

## Setup

### 1. Supabase – SQL ausführen

Führe dieses SQL im Supabase SQL Editor aus:
```sql
CREATE TABLE leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  firmenname text NOT NULL,
  adresse text,
  telefon text,
  webseite text,
  ansprechpartner text,
  status text NOT NULL DEFAULT 'Noch nicht kontaktiert',
  letzter_kontakt timestamptz,
  letzter_kontakt_von text,
  naechster_schritt text,
  notiz text,
  owner_name text,
  owner_since timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by text,

  CONSTRAINT valid_status CHECK (status IN (
    'Noch nicht kontaktiert',
    'Kontaktiert',
    'Ablehnung (Telefonat durchgeführt, abgelehnt)',
    'Follow Up (Pitch verabredet)',
    'Pitch Durchführung',
    'Vertrag zugesendet',
    'Geraet aufgestellt'
  ))
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_updated ON leads(updated_at DESC);
CREATE INDEX idx_leads_firmenname ON leads(firmenname);

-- RLS ist AUS, da wir nur über Service Role Key (serverseitig) zugreifen.
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- Demo-Daten (optional)
INSERT INTO leads (firmenname, adresse, telefon, webseite, status) VALUES
  ('Bäckerei Müller', 'Hauptstr. 12, 80331 München', '+49 89 1234567', 'baeckerei-mueller.de', 'Noch nicht kontaktiert'),
  ('Café Central', 'Marktplatz 3, 50667 Köln', '+49 221 9876543', 'cafe-central.de', 'Noch nicht kontaktiert'),
  ('Fitness First Hamburg', 'Reeperbahn 100, 20359 Hamburg', '+49 40 5551234', 'fitnessfirst-hh.de', 'Kontaktiert'),
  ('Hotel Seeblick', 'Seestr. 45, 78464 Konstanz', '+49 7531 88776', 'hotel-seeblick.de', 'Noch nicht kontaktiert'),
  ('Autohaus Schmidt', 'Industriestr. 8, 70173 Stuttgart', '+49 711 3334455', NULL, 'Noch nicht kontaktiert');
