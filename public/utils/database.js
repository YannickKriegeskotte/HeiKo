import * as Helper from "./helpers.js";

const API = {
  time: "/time",
  snapshot: "/snapshot"
};

// =====================================================
// TIME SERIES (unchanged but fixed bugs)
// =====================================================

export async function saveTimeEntry(data) {
  return fetch(`${API.time}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.ok);
}

export async function getLatestTimeEntry(type, apartment_id, metric) {
  return fetch(`${API.time}/latest?type=${type}&apartment_id=${apartment_id}&metric=${metric}`)
    .then(r => r.json());
}

export async function getAllTimeEntries() {
  return fetch(`${API.time}/all`).then(r => r.json());
}

export async function getTimeEntry(type, apartment_id, metric, date) {
  return fetch(`${API.time}/get?type=${type}&apartment_id=${apartment_id}&metric=${metric}&date=${date}`)
    .then(r => r.json());
}

export async function getLatestTimeByType(type) {
  return fetch(`${API.time}/latestByType?type=${type}`)
    .then(r => r.json());
}

export async function getLatestTimeEntryByYear(type, apartment_id, metric, year) {
  return fetch(`${API.time}/latestByYear?type=${type}&apartment_id=${apartment_id}&metric=${metric}&year=${year}`)
    .then(r => r.json());
}

export async function getAllTimeByType(type) {
  return fetch(`${API.time}/allByType?type=${type}`)
    .then(r => r.json());
}

export async function getEntryAtDate(type, metric, apartment_id, date) {
  return fetch(`${API.time}/valueAtDate?type=${type}&metric=${metric}&apartment_id=${apartment_id}&date=${date}`)
    .then(r => r.json());
}

export async function getPreviousEntry(type, metric, apartment_id, date) {
  return fetch(`${API.time}/previous?type=${type}&metric=${metric}&apartment_id=${apartment_id}&date=${date}`)
    .then(r => r.json());
}

export async function deleteTimeEntry(id) {
  return fetch(`${API.time}/delete`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  }).then(r => r.ok);
}

// =====================================================
// SNAPSHOTS
// =====================================================

// SAVE
export async function saveSnapshot(type, data) {
  return fetch(`${API.snapshot}/${type}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.ok);
}

// GET SINGLE
export async function getSnapshot(type, query) {
  const params = new URLSearchParams(query);
  return fetch(`${API.snapshot}/${type}/get?${params}`)
    .then(r => r.json());
}

// GET ALL
export async function getAllSnapshots(type, apartment_id) {
  return fetch(`${API.snapshot}/${type}/all?apartment_id=${apartment_id}`)
    .then(r => r.json());
}

// DELETE
export async function deleteSnapshot(type, data) {
  return fetch(`${API.snapshot}/${type}/delete`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.ok);
}