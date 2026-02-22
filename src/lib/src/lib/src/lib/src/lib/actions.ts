"use server";

import { getServiceClient } from './supabase-server';
import { STATUSES, OWNER_THRESHOLD_INDEX } from './types';
import { revalidatePath } from 'next/cache';
import { requireAuth } from './session';

const db = () => getServiceClient();

export async function getLeads() {
  requireAuth();
  const { data, error } = await db().from('leads').select('*').order('updated_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getLead(id: string) {
  requireAuth();
  const { data, error } = await db().from('leads').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createLead(
  form: { firmenname: string; adresse?: string; telefon?: string; webseite?: string },
  userName: string
) {
  requireAuth();
  const { error } = await db().from('leads').insert({
    firmenname: form.firmenname,
    adresse: form.adresse || null,
    telefon: form.telefon || null,
    webseite: form.webseite || null,
    status: STATUSES[0],
    updated_by: userName,
  });
  if (error) throw error;
  revalidatePath('/');
}

function applyOwnerRule(currentOwner: string | null, newStatus: string, userName: string) {
  const idx = (STATUSES as readonly string[]).indexOf(newStatus);
  if (idx >= OWNER_THRESHOLD_INDEX && !currentOwner) {
    return { owner_name: userName, owner_since: new Date().toISOString() };
  }
  return {};
}

export async function updateLeadStatus(id: string, newStatus: string, userName: string) {
  requireAuth();
  const lead = await getLead(id);
  const ownerFields = applyOwnerRule(lead.owner_name, newStatus, userName);

  const autoContact: Record<string, any> = {};
  if (lead.status === STATUSES[0] && newStatus === STATUSES[1]) {
    autoContact.letzter_kontakt = new Date().toISOString();
    autoContact.letzter_kontakt_von = userName;
  }

  const { error } = await db().from('leads').update({
    status: newStatus,
    updated_at: new Date().toISOString(),
    updated_by: userName,
    ...ownerFields,
    ...autoContact,
  }).eq('id', id);
  if (error) throw error;
  revalidatePath('/');
}

export async function updateLead(id: string, fields: Record<string, any>, userName: string) {
  requireAuth();
  const lead = await getLead(id);
  const ownerFields = fields.status ? applyOwnerRule(lead.owner_name, fields.status, userName) : {};
  const { error } = await db().from('leads').update({
    ...fields,
    updated_at: new Date().toISOString(),
    updated_by: userName,
    ...ownerFields,
  }).eq('id', id);
  if (error) throw error;
  revalidatePath('/');
  revalidatePath('/leads/' + id);
}

export async function markContacted(id: string, userName: string) {
  requireAuth();
  const lead = await getLead(id);
  const updates: Record<string, any> = {
    letzter_kontakt: new Date().toISOString(),
    letzter_kontakt_von: userName,
    updated_at: new Date().toISOString(),
    updated_by: userName,
  };
  if (lead.status === STATUSES[0]) {
    updates.status = STATUSES[1];
  }
  const { error } = await db().from('leads').update(updates).eq('id', id);
  if (error) throw error;
  revalidatePath('/');
  revalidatePath('/leads/' + id);
}

export async function importLeads(
  rows: { firmenname: string; adresse?: string; telefon?: string; webseite?: string; ansprechpartner?: string }[],
  userName: string
) {
  requireAuth();
  const toInsert = rows.filter(r => r.firmenname?.trim()).map(r => ({
    firmenname: r.firmenname.trim(),
    adresse: r.adresse?.trim() || null,
    telefon: r.telefon?.trim() || null,
    webseite: r.webseite?.trim() || null,
    ansprechpartner: r.ansprechpartner?.trim() || null,
    status: STATUSES[0],
    updated_by: userName,
  }));
  const skipped = rows.length - toInsert.length;
  if (toInsert.length > 0) {
    const { error } = await db().from('leads').insert(toInsert);
    if (error) throw error;
  }
  revalidatePath('/');
  return { imported: toInsert.length, skipped };
}

export async function setOwner(id: string, userName: string) {
  requireAuth();
  const { error } = await db().from('leads').update({
    owner_name: userName,
    owner_since: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    updated_by: userName,
  }).eq('id', id);
  if (error) throw error;
  revalidatePath('/');
  revalidatePath('/leads/' + id);
}
