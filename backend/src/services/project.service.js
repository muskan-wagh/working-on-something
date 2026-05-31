const supabase = require("../config/supabase");

async function findByApiKeyPrefix(prefix) {
  const { data, error } = await supabase
    .from("Projects_apiD")
    .select("*")
    .eq("key_prefix", prefix)
    .maybeSingle();

  if (error) return null;
  return data;
}

async function findByPlaintextKey(apiKey) {
  const { data, error } = await supabase
    .from("Projects_apiD")
    .select("*")
    .eq("API_key", apiKey)
    .maybeSingle();

  if (error) return null;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase
    .from("Projects_apiD")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return null;
  return data;
}

async function create({ name, apiKey }) {
  const { data, error } = await supabase
    .from("Projects_apiD")
    .insert([{ name, API_key: apiKey }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function list() {
  const { data, error } = await supabase
    .from("Projects_apiD")
    .select("id, name, created_at");

  if (error) throw error;
  return data;
}

async function remove(id) {
  const { error } = await supabase.from("Projects_apiD").delete().eq("id", id);
  if (error) throw error;
}

module.exports = { findByApiKeyPrefix, findByPlaintextKey, findById, create, list, remove };
