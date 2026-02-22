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

  // Auto-set owner when moving to "Follow Up" or beyond (index >= 2)
  if (statusIndex >= 2) {
    const lead = await getLead(id);
    if (!lead.owner) {
      (updates as any).owner = userName;
    }
  }

  const { error } = await db().from("leads").update(updates).eq("id", id);
  if (error) throw error;
  revalidatePath("/");
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
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of rows) {
    if (!row.company_name) {
      failed++;
      errors.push("Zeile ohne Firmenname uebersprungen");
      continue;
    }
    try {
      await createLead(row, userName);
      success++;
    } catch (e: any) {
      failed++;
      errors.push(row.company_name + ": " + e.message);
    }
  }
  return { success, failed, errors };
}
