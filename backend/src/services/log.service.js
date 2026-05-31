const supabase = require("../config/supabase");

async function createLog(logData) {
  const { data, error } = await supabase
    .from("Logs_apiD")
    .insert([logData])
    .select();

  if (error) throw error;
  return data;
}

async function listLogsByProject(projectId, limit = 100) {
  const { data, error } = await supabase
    .from("Logs_apiD")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

module.exports = { createLog, listLogsByProject };
