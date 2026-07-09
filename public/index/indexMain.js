import { loadSidebar } from "../utils/sidebar.js";
import { registerListeners } from "./indexListeners.js";

// Global Vars
let currentYearState, previousYearState;
const metricMap = {
  og: {
    strom_verbrauch: ["og", "verbrauch", "strom"],
    strom_solar: ["produziert", "solarstrom"],

    wasser_kalt: ["og", "verbrauch", "wasser", "kalt"],
    wasser_warm: ["og", "verbrauch", "wasser", "warm"],
    wasser_gesamt: ["og", "verbrauch", "wasser", "gesamt"],

    kosten_strom: ["og", "kosten", "strom"],
    kosten_wasser: ["og", "kosten", "wasser", "gesamt"],
    kosten_gesamt: ["og", "kosten", "gesamt"],
  },

  ug: {
    strom_verbrauch: ["ug", "verbrauch", "strom"],
    wasser_verbrauch: ["ug", "verbrauch", "wasser"],

    kosten_strom: ["ug", "kosten", "strom"],
    kosten_wasser: ["ug", "kosten", "wasser"],
    kosten_gesamt: ["ug", "kosten", "gesamt"],
  },

  shared: {
    heizoel_gesamt: ["total", "verbrauch", "oel"],
    heizung_laufzeit: ["laufzeit", "heizung"],
    solar_laufzeit: ["laufzeit", "solarpumpe"],
    wasser_solar: ["produziert", "solarwasserenergie"],
  },
};
const yearly_template = await fetch(
  "../utils/yearly_snapshot_template.json",
).then((r) => r.json());


// ===========================
// MAIN
// ===========================
$(document).ready(async function () {
  await loadSidebar("index");
  let currentYearData, previousYearData;

  // Aktuellstes Jahr aus DB laden
  let res = await fetch("/snapshot/year/latest");
  const latestRes = await res.json();

  // Wenn nichts gefunden, Template laden
  if (!res.ok || !latestRes.success) {
    const currentYear = new Date().getFullYear();

    currentYearData = structuredClone(yearly_template);
    currentYearData.year = currentYear;

    previousYearData = structuredClone(yearly_template);
    previousYearData.year = currentYear - 1;
  } else {
    currentYearData = latestRes.data.payload;
    console.log("currentYearData", currentYearData);
    const currentYear = Number(currentYearData.year);
    console.log(currentYear);

    // Vorjahr zum aktuellsten Jahr aus DB laden
    const prevRes = await fetch(`/snapshot/year/get/${currentYear - 1}`);
    const prevData = await prevRes.json();

    // Wenn Vorjahr nicht gefunden, Template laden
    if (!prevRes.ok || !prevData.success) {
      previousYearData = structuredClone(yearly_template);
      previousYearData.year = currentYearData.year - 1;
      console.log("load template");
    } else {
      previousYearData = prevData.data.payload;
    }
  }
  console.log("previousYearData", previousYearData);
  // Letzten aktuallisierten monat aus Snapshot extrahieren. Bei Template: lastAddedMonth = "" => mache zu 1
  const lastAddedMonth = Number(currentYearData.lastAddedMonth) || 1;

  // Aktuellen Jahresfortschirtt aus Jahressnapshot holen
  currentYearState = currentYearData.months[lastAddedMonth];

  // Vorjahresstand für aktuellen Jahresfortschritt aus Vorjahressnapshot holen
  previousYearState = previousYearData.months[lastAddedMonth];

  console.log("currentYearState", currentYearState);
  console.log("previousYearState", previousYearState);
  console.log(currentYearState === previousYearState);

  // Stockwerke mit Daten füllen

  await createFloor("og", "Obergeschoss");
  await createFloor("ug", "Untergeschoss");
  await createFloor("shared", "Gemeinsam");

  registerListeners();
});

async function createFloor(id, title) {
  $("#floor-sections").append(`
        <div class="floor-section" id="${id}-section">
            <div class="floor-header">
                <h2>${title}</h2>
                <span>Aktuelle Verbrauchsübersicht</span>
            </div>

            <div class="box-summaries" id="${id}-boxes"></div>
        </div>
    `);

  if (id === "og") await createOG(id);
  if (id === "ug") await createUG(id);
  if (id === "shared") await createShared(id);
}

async function getYearComparison(apartment, key) {
  const path = metricMap[apartment][key];

  const current = getValue(currentYearState, path);
  const previous = getValue(previousYearState, path);

  const change =
    previous === 0 ? current : ((current - previous) / previous) * 100;
  // console.log(currentYearState);
  // console.log(current, previous, change, path);

  return {
    currentData: current,
    previousData: previous,
    change: change,
  };
}

async function createOG(floor) {
  renderBox(floor, "strom", "Strom", [
    await metric("og", "strom_verbrauch", "Verbrauch", "kWh"),
    await metric("og", "strom_solar", "Erzeugt", "kWh"),
  ]);

  renderBox(floor, "wasser", "Wasser", [
    await metric("og", "wasser_kalt", "Kaltwasser", "L"),
    await metric("og", "wasser_warm", "Warmwasser", "L"),
    await metric("og", "wasser_gesamt", "Gesamt", "L"),
  ]);

  renderBox(floor, "kosten", "Kosten", [
    await metric("og", "kosten_strom", "Strom", "€"),
    await metric("og", "kosten_wasser", "Wasser", "€"),
    await metric("og", "kosten_gesamt", "Gesamt", "€"),
  ]);
}

async function createUG(floor) {
  renderBox(floor, "strom", "Strom", [
    await metric("ug", "strom_verbrauch", "Verbrauch", "kWh"),
  ]);

  renderBox(floor, "wasser", "Wasser", [
    await metric("ug", "wasser_verbrauch", "Verbrauch", "L"),
  ]);

  renderBox(floor, "kosten", "Kosten", [
    await metric("ug", "kosten_strom", "Strom", "€"),
    await metric("ug", "kosten_wasser", "Wasser", "€"),
    await metric("ug", "kosten_gesamt", "Gesamt", "€"),
  ]);
}

async function createShared(floor) {
  renderBox(floor, "heizung", "Heizung", [
    await metric("shared", "heizoel_gesamt", "Ölverbrauch", "L"),
    await metric("shared", "heizung_laufzeit", "Laufzeit", "Std"),
  ]);

  renderBox(floor, "solar", "Solarpumpe", [
    await metric("shared", "solar_laufzeit", "Laufzeit", "h"),
    await metric("shared", "wasser_solar", "Energie", "kW"),
  ]);
}

async function metric(apartment, key, label, unit) {
  const stats = await getYearComparison(apartment, key);

  return {
    label,
    value: stats.currentData,
    unit,
    change: stats.change,
    previous: stats.previousData,
    invert: key === "strom_solar" || key === "wasser_solar",
  };
}

function renderBox(floor, id, title, metrics) {
  $(`#${floor}-boxes`).append(`
        <div class="box ${id}-box" id="${floor}-${id}-box">
            <div class="top">
                <span>${title}</span>
            </div>

            <div class="metrics"></div>
            <div class="bottom"></div>
        </div>
    `);

  const box = $(`#${floor}-${id}-box`);

  metrics.forEach((m) => {
    const better = m.invert ? m.change > 0 : m.change < 0;

    box.find(".metrics").append(`
      <div class="metric-row">
          <span class="label">${m.label}</span>
          <span class="value"><strong>${m.value}</strong> ${m.unit}</span>
          <span class="change ${better ? "better" : "worse"}">
              ${m.change < 0 ? "↘" : "↗"} ${m.change.toFixed(1)}%
          </span>
      </div>
  `);
  });

  const last = metrics[metrics.length - 1];

  box.find(".bottom").html(`
        <div class="tooltip">Vorjahr: ${last.previous}</div>
    `);
}

function getValue(obj, path) {
  return path.reduce((o, key) => o?.[key], obj) ?? 0;
}