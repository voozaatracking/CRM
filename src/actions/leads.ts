"use server";
import { getServiceSupabase } from "@/lib/supabase-server";
import { Lead, LeadStatus, LEAD_STATUSES } from "@/types";
import { revalidatePath } from "next/cache";

const db = () => getServiceSupabase();

export async function getLeads() {
  const { data, error } = await db()
    .from("leads")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as Lead[];
}

export async function getLead(id: string) {
  const { data, error } = await db().from("leads").select("*").eq("id", id).single();
  if (error) throw error;
  return data as Lead;
}

export async function createLead(lead: Partial<Lead>, userName: string) {
  const { error } = await db().from("leads").insert({
    company_name: lead.company_name,
    contact_person: lead.contact_person || null,
    email: lead.email || null,
    phone: lead.phone || null,
    address: lead.address || null,
    website: lead.website || null,
    status: lead.status || "Neu",
    notes: lead.notes || null,
    updated_by: userName,
  });
  if (error) throw error;
  revalidatePath("/");
}

export async function updateLead(id: string, updates: Partial<Lead>, userName: string) {
  const { error } = await db()
    .from("leads")
    .update({ ...updates, updated_by: userName, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/lead/" + id);
}

export async function updateLeadStatus(id: string, newStatus: LeadStatus, userName: string) {
  const statusIndex = LEAD_STATUSES.indexOf(newStatus);
  const updates: Partial<Lead> & { updated_by: string; updated_at: string } = {
    status: newStatus,
    updated_by: userName,
    updated_at: new Date().toISOString(),
  };

  if (statusIndex >= 1) {
    const lead = await getLead(id);
    if (!lead.owner) {
      (updates as any).owner = userName;
    }
    if (statusIndex === 1 && !lead.first_contacted_at) {
      (updates as any).first_contacted_at = new Date().toISOString();
    }
  }

  const { error } = await db().from("leads").update(updates).eq("id", id);
  if (error) throw error;
}

export async function markContacted(id: string, userName: string) {
  const { error } = await db()
    .from("leads")
    .update({
      last_contacted_at: new Date().toISOString(),
      updated_by: userName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/lead/" + id);
}

export async function setOwner(id: string, ownerName: string, userName: string) {
  const { error } = await db()
    .from("leads")
    .update({
      owner: ownerName,
      updated_by: userName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/lead/" + id);
}

export async function deleteLead(id: string) {
  const { error } = await db().from("leads").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
}

export async function importLeads(
  rows: Partial<Lead>[],
  userName: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  const errors: string[] = [];
  const validRows = [];

  const { data: existing } = await db()
    .from("leads")
    .select("company_name, address");

  const existingSet = new Set(
    (existing || []).map((e) => `${e.company_name}|||${e.address || ""}`)
  );

  for (const row of rows) {
    if (!row.company_name) {
      errors.push("Zeile ohne Firmenname übersprungen");
      continue;
    }

    const key = `${row.company_name}|||${row.address || ""}`;
    if (existingSet.has(key)) {
      errors.push(`${row.company_name} – bereits vorhanden, übersprungen`);
      continue;
    }

    existingSet.add(key);

    validRows.push({
      company_name: row.company_name,
      contact_person: row.contact_person || null,
      email: row.email || null,
      phone: row.phone || null,
      address: row.address || null,
      website: row.website || null,
      notes: row.notes || null,
      status: "Neu",
      owner: null,
      updated_by: userName,
    });
  }

  if (validRows.length === 0) {
    return { success: 0, failed: errors.length, errors };
  }

  const { error } = await db().from("leads").insert(validRows);

  if (error) {
    return { success: 0, failed: validRows.length + errors.length, errors: [...errors, error.message] };
  }

  revalidatePath("/");
  return { success: validRows.length, failed: errors.length, errors };
}
