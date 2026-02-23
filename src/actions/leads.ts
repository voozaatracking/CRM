export async function importLeads(
  rows: Partial<Lead>[],
  userName: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  const errors: string[] = [];
  const validRows = [];

  // Existierende Firmennamen laden
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

    existingSet.add(key); // auch innerhalb der CSV Duplikate verhindern

    validRows.push({
      company_name: row.company_name,
      contact_person: row.contact_person || null,
      email: row.email || null,
      phone: row.phone || null,
      address: row.address || null,
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
