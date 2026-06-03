import * as Helper from "./helpers.js";

const debug = true;

// =========================
// API BASE
// =========================
const API = {
  time: "/time",
  settings: "/settings",
  ui: "/ui"
};

// =====================================================
// TIME SERIES API (READINGS / FEES / UI)
// =====================================================

export async function saveTimeEntry({
  type,
  apartment_id = null,
  metric,
  value = null,
  state = null,
  date
}) {
  if (debug) console.log("saveTimeEntry", { type, apartment_id, metric, value, state, date });

  const response = await fetch(`${API.time}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      apartment_id,
      metric,
      value,
      state,
      date
    })
  });

  return response.ok;
}

export async function getLatestTimeEntry(type, apartment_id, metric) {
  const response = await fetch(
    `${API.time}/latest?type=${type}&apartment_id=${apartment_id}&metric=${metric}`
  );

  if (!response.ok) return null;
  return await response.json();
}

export async function getTimeRange(type, apartment_id, metric, from, to) {
  const response = await fetch(
    `${API.time}/range?type=${type}&apartment_id=${apartment_id}&metric=${metric}&from=${from}&to=${to}`
  );

  if (!response.ok) return [];
  return await response.json();
}

export async function getLatestTimeByType(type) {
  const response = await fetch(
    `${API.time}/latestByType?type=${type}`
  );

  if (!response.ok) return [];

  return await response.json();
}

export async function getLatestTimeEntryByYear(
    type,
    apartment_id,
    metric,
    year
) {
    const response = await fetch(
        `${API.time}/latestByYear?type=${type}&apartment_id=${apartment_id}&metric=${metric}&year=${year}`
    );

    if (!response.ok) return null;

    return await response.json();
}

// =====================================================
// DELETE TIME DATA
// =====================================================

export async function deleteTimeEntry(id) {
  const response = await fetch(`${API.time}/delete`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });

  return response.ok;
}

export async function deleteTimeByMetric(type, apartment_id, metric) {
  const response = await fetch(`${API.time}/deleteByMetric`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, apartment_id, metric })
  });

  return response.ok;
}

export async function deleteTimeRange(type, apartment_id, metric, from, to) {
  const response = await fetch(`${API.time}/deleteRange`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, apartment_id, metric, from, to })
  });

  return response.ok;
}

// =====================================================
// SETTINGS API (Miete, Preise, kWh etc.)
// =====================================================

export async function saveSetting(key, value) {
  const response = await fetch(`${API.settings}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value })
  });

  return response.ok;
}

export async function getSetting(key) {
  const response = await fetch(`${API.settings}/get?key=${key}`);

  if (!response.ok) return null;

  const data = await response.json();
  return data.value;
}

export async function deleteSetting(key) {
  const response = await fetch(`${API.settings}/delete`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key })
  });

  return response.ok;
}

// =====================================================
// UI STATE API (Checkboxes etc.)
// =====================================================

export async function saveUIState(element_id, state, date) {
  const response = await fetch(`${API.ui}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ element_id, state, date })
  });

  return response.ok;
}

export async function getUIState(element_id) {
  const response = await fetch(`${API.ui}/get?element_id=${element_id}`);

  if (!response.ok) return null;

  const data = await response.json();
  return data.state;
}