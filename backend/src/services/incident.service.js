const supabase = require("../config/supabase");

function isColumnError(error) {
  return error && (
    error.code === "42703" ||
    error.message?.includes("does not exist") ||
    error.message?.includes("Could not find")
  );
}

async function findOpenMatching(log) {
  try {
    const { data, error } = await supabase
      .from("Incidents_apiD")
      .select("*")
      .eq("project_id", log.project_id)
      .eq("endpoint", log.endpoint)
      .eq("method", log.method)
      .eq("status_code", log.status_code)
      .eq("error_fingerprint", log.error_fingerprint)
      .in("status", ["open", "investigating"])
      .maybeSingle();

    if (error) {
      if (isColumnError(error)) return null;
      throw error;
    }
    return data;
  } catch (error) {
    if (isColumnError(error)) return null;
    throw error;
  }
}

async function create({ title, severity, status, projectId, endpoint, method, statusCode, errorFingerprint }) {
  const { data, error } = await supabase
    .from("Incidents_apiD")
    .insert([{
      title,
      severity,
      status: status || "open",
      project_id: projectId,
      endpoint,
      method,
      status_code: statusCode,
      error_fingerprint: errorFingerprint,
      total_occurence: "1",
      first_seen: new Date().toISOString(),
      last_seen: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) {
    if (isColumnError(error)) return null;
    throw error;
  }
  return data;
}

async function incrementOccurrence(id) {
  const { data: current } = await supabase
    .from("Incidents_apiD")
    .select("total_occurence")
    .eq("id", id)
    .single();

  if (!current) return;

  const count = (parseInt(current.total_occurence) || 0) + 1;

  const { data, error } = await supabase
    .from("Incidents_apiD")
    .update({
      total_occurence: String(count),
      last_seen: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase
    .from("Incidents_apiD")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function list(projectId) {
  let query = supabase
    .from("Incidents_apiD")
    .select("*")
    .order("last_seen", { ascending: false });

  if (projectId) query = query.eq("project_id", projectId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

async function update(id, fields) {
  const { data, error } = await supabase
    .from("Incidents_apiD")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

module.exports = { findOpenMatching, create, incrementOccurrence, findById, list, update };
