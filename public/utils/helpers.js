import * as DB from "./database.js";
import { createSectionTable } from "./createSectionTable.js";

// =======================
// ===== Global Vars =====
// =======================
let apartmentCount;

// =======================
// ===== Main Helper =====
// =======================

export function getDate() {
  const date = new Date();
  return date;
}

export function appendApartmentEnergy(
  meterFee,
  meterNumber,
  electricityFee,
  apartmentName,
  i,
) {
  $("#energy").append(`
            <div class="apartment${i}container apartmentContainer">
                <h3 id="apartment${i}name_electricity" class="apartmentHeader">${apartmentName}</h3>
                <label class="preInputLabel" for="apartment${i}electricityMeterNumber">Zählernummer</label>
                <input type="text" id="apartment${i}electricityMeterNumber" name="apartment${i}electricityMeterNumber" value="${meterNumber}">
                <label class="preInputLabel" for="apartment${i}electricityMeterFee">Zählergebühren</label>
                <input type="number" id="apartment${i}electricityMeterFee" name="apartment${i}electricityMeterFee" min="0" value="${meterFee}">
                <label class="postInputLabel" for="apartment${i}electricityMeterFee">€</label>
                <label class="preInputLabel" for="apartment${i}electricityFee">Preis pro KWh</label>
                <input type="number" id="apartment${i}electricityFee" name="apartment${i}electricityFee" min="0" value="${electricityFee}">
                <label class="postInputLabel" for="apartment${i}electricityFee">€</label>
            </div>
        `);
}

export function extractBaseKey(key) {
  return key.replace(/[0-9]{1,2}-[0-9]{1,2}-[0-9]{4}$/, "").trim();
}

export function extractDate(key) {
  const match = key.match(/([0-9]{1,2})-([0-9]{1,2})-([0-9]{4})$/);
  if (!match) return null;
  const [_, day, month, year] = match.map(Number);
  return new Date(year, month - 1, day);
}

// ===========================
// ===== Listener Helper =====
// ===========================

// ===========================
// ===== Database Helper =====
// ===========================
export async function updateDatabaseTable() {
  // Datenbank-Tabellenbody finden, löschen und neu erstellen.
  $("#databaseTable tbody").remove();
  $("#databaseTable").append("<tbody></tbody>");

  const dbData = await DB.getAllValuesFromDB();
  const sorted = sortDataFromDB(dbData);

  console.log("DB Data:", dbData);
  console.log("Sorted:", sorted);

  renderDatabaseTable(sorted);
}

export function sortDataFromDB(dbData) {
  // Sortiere dbdata zuerst alphabetisch und dann nochmal nach datum
  const sorted = dbData.sort((a, b) => {
    const baseA = extractBaseKey(a.key);
    const baseB = extractBaseKey(b.key);

    // Alphabetisch nach Präfix
    const alphaCompare = baseA.localeCompare(baseB);
    if (alphaCompare !== 0) return alphaCompare;

    // Wenn gleich, nach Datum (neu → alt)
    const dateA = extractDate(a.key);
    const dateB = extractDate(b.key);

    if (!dateA && !dateB) return 0; // beide ohne Datum
    if (!dateA) return 1; // ohne Datum → älter
    if (!dateB) return -1;

    return dateB - dateA; // neueste zuerst
  });
  return sorted;
}

export function renderDatabaseTable(sortedDatabaseData) {
  for (let i = 0; i < sortedDatabaseData.length; i++) {
    const key = sortedDatabaseData[i].key;
    const value = sortedDatabaseData[i].value;

    // console.log("key in main", key);

    $("#databaseTable tbody").append(`
         <tr id="${key}_row">
            <td class="keyTd">${key}</td>
            <td>${value}</td>
            <td><input type="text" class="newKeyInput" id="new${key}Input"></td>
            <td><input type="text" class="newValueInput" id="new${value}Input"></td>
            <td><button class="deleteButton" id="${key}_button">Löschen</button></td>
        </tr>
    `);
  }
}

export async function getDBFees(section) {
  //...
}



// ===========================================
// ===== Energy / Heating / Water Helper =====
// ===========================================

/**
 * Erzeugt eine Jahrestabelle für die passende Seite (section) und das passende Jahr (year).
 * Füllt außerdem noch die Daten Arrays für den dazugehörigen Graphen, um code Dopplung zu vermeiden.
 * @param {String} section
 * @param {String} year
 * @returns {HTML}
 */
export async function createTable(section, year) {
  await createSectionTable(section, year);
}

function createGraphDatesArray(section, year) {
  const datesArray = [];

  $(`#${year}_${section}_dateRow td input`).each(function () {
    const dateValue = $(this).val();
    datesArray.push(dateValue);
  });

  //console.log("datesArray",datesArray);
  return datesArray;
}

function getAllMetricsOfTableRow(apartment, year, section, metric) {
  let data = [];
  for (let col = 1; col <= 12; col++) {
    const dataValue = $(
      `#apartment${apartment}_${year}_${section}Table_${metric}${col}`,
    ).val();

    //console.log(`#apartment${apartment}_${year}_${section}Table_${metric}${col}`,dataValue);
    data.push(Number(dataValue) || 0);
  }
  //console.log(`${apartment}-${metric}-Data`,data);
  return data;
}

function makeDatasetLayout(apartmentName, metric, dataArray) {
  // Min/Max bestimmen
  const meta = getMinMax(dataArray);
  const label = `${metric} ${apartmentName}`;

  return {
    label: label,
    data: dataArray,
    borderWidth: 2,
    tension: 0, // Linien zackig
    fill: false,
    borderColor: stableColorFor(label),
    pointRadius: dataArray.map((v, i) =>
      i === meta.minIndex || i === meta.maxIndex ? 6 : 2,
    ),
    pointBackgroundColor: dataArray.map((v, i) => {
      if (i === meta.maxIndex) return "red";
      if (i === meta.minIndex) return "blue";
      return stableColorFor(label);
    }),
    _minIndex: meta.minIndex,
    _maxIndex: meta.maxIndex,
    _minValue: meta.minValue,
    _maxValue: meta.maxValue,
  };
}

async function createGraphDatasets(section, year) {
  const datasets = [];
  const apartmentCount = await DB.getValueFromDB("apartmentcount");

  for (let apartment = 1; apartment <= apartmentCount; apartment++) {
    const apartmentName =
      (await DB.getValueFromDB(`apartment${apartment}name`)) ||
      `Wohnung ${apartment}`;

    let metrics;
    let displayMetrics;
    let data;

    switch (section) {
      case "energy":
        metrics = [
          "electricityMeterCount",
          "electricityConsumption",
          "electricityCost",
        ];
        displayMetrics = ["Zählerstand", "Verbrauch", "Kosten"];

        for (let metric = 0; metric < metrics.length; metric++) {
          const data = getAllMetricsOfTableRow(
            apartment,
            year,
            section,
            metrics[metric],
          );
          datasets.push(
            makeDatasetLayout(apartmentName, displayMetrics[metric], data),
          );
        }
        break;
      case "water":
        metrics = [];
        displayMetrics = [];

        for (let metric = 0; metric < metrics.length; metric++) {
          const data = getAllMetricsOfTableRow(
            apartment,
            year,
            section,
            metrics[metric],
          );
          datasets.push(
            makeDatasetLayout(apartmentName, displayMetrics[metric], data),
          );
        }
        break;
      case "heating":
        metrics = [];
        displayMetrics = [];

        for (let metric = 0; metric < metrics.length; metric++) {
          const data = getAllMetricsOfTableRow(
            apartment,
            year,
            section,
            metrics[metric],
          );
          datasets.push(
            makeDatasetLayout(apartmentName, displayMetrics[metric], data),
          );
        }
        break;
    }
  }

  //===============================
  //=== Zählerstände ignorieren ===
  //===============================

  const filteredDatasets = datasets.filter(
    (ds) => !ds.label.startsWith("Zählerstand"),
  );

  console.log(filteredDatasets);
  return filteredDatasets;
}

const energyCharts = {};



async function restoreDatasetVisibility(chart) {
  for (let i = 0; i < chart.data.datasets.length; i++) {
    const saved = await DB.getValueFromDB(
      `${chart.canvas.id}_dataset_${i}`
    );

    if (saved !== null) {
      const visible = toBool(saved);
      chart.setDatasetVisibility(i, visible);
    }
  }

  chart.update();
}


function renderGraph(section, year, datesArray, datasets) {
  const ctx = document.getElementById(`${year}_${section}Graph`);

  // Chart existiert schon → nur updaten
  if (energyCharts[year]) {
    const chart = energyCharts[year];

    chart.data.labels = datesArray;
    chart.data.datasets = datasets;

    chart.update();
    return;
  }

  // Neues Chart erstellen
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: datesArray,
      datasets: datasets,
    },
    options: {
      responsive: true,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: `${year}`,
        },
        tooltip: {
          mode: "nearest",
          intersect: false,
          position: "nearest",
        },
        legend: {
          labels: {
            font: { size: 16 },
            usePointStyle: true,
            pointStyle: "line",
          },

          onHover(event) {
            event.native.target.style.cursor = "pointer";
          },

          onLeave(event) {
            event.native.target.style.cursor = "default";
          },

          onClick: async (e, legendItem, legend) => {
            const chart = legend.chart;
            const datasetIndex = legendItem.datasetIndex;

            const visible = !chart.isDatasetVisible(datasetIndex);

            chart.setDatasetVisibility(datasetIndex, visible);
            chart.update();

            // State speichern
            await DB.saveValueToDB(
              `${chart.canvas.id}_dataset_${datasetIndex}`,
              visible
            );
            console.log(`saved ${chart.canvas.id}_dataset_${datasetIndex}`, visible);
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  });

  energyCharts[year] = chart;

  // State nach Erstellung wiederherstellen
  restoreDatasetVisibility(chart);
}

export async function createGraph(section, year) {
  const container = $(`#${year}_${section}TableContainer`);

  // Canvas erstellen falls nötig
  if (!$(`#${year}_${section}Graph`).length) {
    container.find("table").after(`
      <div class="canvasWrapper">
        <canvas id="${year}_${section}Graph" width="400" height="100"></canvas>
      </div>
    `);
  }

  // Collapse-State laden
  let tableCollapsed = await DB.getValueFromDB(
    `${year}_${section}TableCollapsed`
  );

  if (tableCollapsed === null) {
    tableCollapsed = "false";
    await DB.saveValueToDB(
      `${year}_${section}TableCollapsed`,
      "false"
    );
  }

  const canvasWrapper = container.find(".canvasWrapper");

  // UI State anwenden
  if (tableCollapsed === "true") {
    canvasWrapper.hide();
  } else {
    canvasWrapper.show();
  }

  // Daten vorbereiten
  const datasets = await createGraphDatasets(section, year);
  const datesArray = createGraphDatesArray(section, year);

  // Render
  renderGraph(section, year, datesArray, datasets);
}



export async function updateGraph(id) {
  const { apartment, year, section, metric, col } = parseInputId(id);
  if (metric !== "date") {
    let $input;
    let $total;
    let totalVar;
    switch (section) {
      case "energy":

        // tabelle verbrauch:
        $input = $(`#apartment${apartment}_${year}_energyTable_electricityConsumption${col}`);
        const consumption = await calculateConsumptionForInput(id)
        $input.val(consumption);

        // verbrauch total:
        $total = $(`#apartment${apartment}_${year}_energyTable_electricityConsumption13`);
        totalVar = 0;
        for(let i=1;i<13;i++){
          totalVar += parseFloat($(`#apartment${apartment}_${year}_energyTable_electricityConsumption${i}`).val()) || 0;
        }
        $total.text(`${totalVar.toFixed(2)}${getMeasuringUnit(section)}`);


        // tabelle kosten:
        $input = $(`#apartment${apartment}_${year}_energyTable_electricityCost${col}`);
        const cost = await calculateCostForInput(id);
        $input.val(cost);

        // kosten total:
        $total = $(`#apartment${apartment}_${year}_energyTable_electricityCost13`);
        totalVar = 0;
        for(let i=1;i<13;i++){
          totalVar += parseFloat($(`#apartment${apartment}_${year}_energyTable_electricityCost${i}`).val()) || 0;
        }
        $total.text(`${totalVar.toFixed(2)}€`);



        break;
      case "water":
        break;
      case "heating":
        break;
    }
  }

  const datasets = await createGraphDatasets(section, year);
  console.log("datasets:", datasets);
  const datesArray = createGraphDatesArray(section, year);
  console.log("datesArray:", datesArray);

  renderGraph(section, year, datesArray, datasets);
}

export async function updateOverviewGraph(id) {
  const { section, year } = parseInputId(id);

  const chart = window.overviewCharts?.[section];
  if (!chart) return;

  // komplett neu berechnen für das Jahr
  const newDatasets = await createGraphDatasets(section, year);

  // altes Jahr entfernen
  chart.data.datasets = chart.data.datasets.filter(d =>
    !d.label.includes(year)
  );

  // neues Jahr hinzufügen
  newDatasets.forEach(d => {
    d.label += ` ${year}`;
    chart.data.datasets.push(d);
  });

  chart.update();
}

export async function createOverviewGraph(section) {
  // ==========================
  // 1. Jahre aus DB holen
  // ==========================
  let years = await DB.getValueFromDB(`${section}Tables`);
  if (!years || !years.length) return;

  // Falls String → parsen
  if (typeof years === "string") {
    years = JSON.parse(years);
  }

  // Canvas nur einmal erzeugen
  if (!$(`#${section}_overviewGraph`).length) {
    $(`#overviewContainer h2`).after(`
      <div class="canvasWrapper">
        <canvas id="${section}_overviewGraph" width="400" height="200"></canvas>
      </div>
    `);
  }

  let combinedValues = [];

  // ==========================
  // 2. Alle Jahre durchlaufen
  // ==========================
  // console.log("Years from DB:", years);

  const datesArray = [
    "Jan",
    "Feb",
    "Mrz",
    "Apr",
    "Mai",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Okt",
    "Nov",
    "Dez",
  ];
  for (const year of years) {
    //console.log("Current year:", year);

    let datasets = await createGraphDatasets(section, year);
    for (const dataset of datasets) {
      dataset.label += ` ${year}`;
    }
    combinedValues.push(...datasets);
  }

  // ==========================
  // 3. Rendern
  // ==========================

  window.overviewCharts = window.overviewCharts || {};
  const ctx = document.getElementById(`${section}_overviewGraph`);
  // Neues Chart erstellen

  window.overviewCharts[section] = new Chart(ctx, {
    type: "line",
    data: {
      labels: datesArray,
      datasets: combinedValues,
    },
    options: {
      responsive: true,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: `Die Jahre im Vergleich`,
        },
        tooltip: {
          mode: "nearest",
          intersect: false,
          position: "nearest",
        },
        legend: {
          labels: {
            font: {
              size: 16,
            },
            usePointStyle: true,
            pointStyle: "line",
          },
          onHover(event, item) {
            event.native.target.style.cursor = "pointer";
          },
          onLeave(event, item) {
            event.native.target.style.cursor = "default";
          },
        },
      },
      scales: {
        y: {
          beginAtZero: false,
        },
      },
    },
  });
}

export async function calculateConsumptionForInput(id) {
  const { apartment, year, section, metric, col } =
    parseInputId(id);

  let currentMeterCountInputID = id.replace("Consumption", "MeterCount");
  const currentMeterCount = await DB.getValueFromDB(currentMeterCountInputID);

  let oldMeterCountInputID;
  if (col == 1) {
    oldMeterCountInputID = currentMeterCountInputID
      .replace(year, year - 1)
      .replace(/[0-9]{1,2}$/, 12);
  } else {
    oldMeterCountInputID = currentMeterCountInputID.replace(
      /[0-9]{1,2}$/,
      col - 1
    );
  }

  const oldMeterCount = await DB.getValueFromDB(oldMeterCountInputID);

  return calculateConsumption(oldMeterCount, currentMeterCount) || 0;
}

export function getMeasuringUnit(section) {
  switch (section) {
    case "energy":
      return " kWh";
    case "water":
    case "heating":
      return "L";
    default:
      return "";
  }
}

export async function calculateCostForInput(id) {
  const { apartment, year, section, col } =
    parseInputId(id);

  switch (section) {
    case "energy":
      return await calculateEnergyCost(apartment, year, col);

    case "water":
      return 0;

    case "heating":
      return 0;

    default:
      return 0;
  }
}

export async function calculateEnergyCost(apartment, year, col) {
  let dbFees = [
    ...(await DB.getAllKeysContaining(`apartment${apartment}electricityFee`)),
    ...(await DB.getAllKeysContaining(`apartment${apartment}electricityMeterFee`)),
  ]
    .map(obj => {
      const isMeterFee = obj.key.includes("MeterFee");
      return {
        ...obj,
        date: extractDate(obj.key),
        type: isMeterFee ? "meterFee" : "fee",
      };
    })
    .filter(obj => obj.date)
    .sort((a, b) => a.date - b.date);

  let inputDateRaw = await DB.getValueFromDB(
    `${year}_energyTable_date${col}`
  );

  let inputDate = null;
  if (inputDateRaw) {
    const [day, month, yearVal] = inputDateRaw.split(".").map(Number);
    inputDate = new Date(yearVal, month - 1, day);
  }

  const getValueForDate = (arr) => {
    let val = arr[0]?.value || 0;

    for (const entry of arr) {
      if (entry.date <= inputDate) {
        val = entry.value;
      } else break;
    }

    return parseFloat(val) || 0;
  };

  const electricityFees = dbFees.filter(e => e.type === "fee");
  const meterFees = dbFees.filter(e => e.type === "meterFee");

  const costPerKwh = getValueForDate(electricityFees);
  const metercountFee = getValueForDate(meterFees);

  let consumption = $(
    `#apartment${apartment}_${year}_energyTable_electricityConsumption${col}`
  ).val();

  consumption = parseFloat(consumption) || 0;

  let cost = consumption * costPerKwh + metercountFee / 12;

  return parseFloat(cost.toFixed(2));
}

function getMinMax(data) {
  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  return {
    minValue,
    maxValue,
    minIndex: data.indexOf(minValue),
    maxIndex: data.indexOf(maxValue),
  };
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function stableColorFor(label) {
  const hash = hashString(label) >>> 0;
  const hueIndex = hash % 12; // 12 fest definierte Farbtöne
  const hue = hueIndex * 30; // 0°, 30°, 60° ... 330°
  const sat = 70;
  const light = 50;
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}

export function parseInputId(id) {
  // Beispiele für IDs:
  // apartment2_2019_energyTable_electricityCost12
  // 2019_energyTable_date3
  // 2021_waterTable_mainWaterCost7

  const colMatch = id.match(/[0-9]{1,2}$/);
  const col = colMatch ? Number(colMatch[0]) : null;

  const parts = id.split("_");

  let apartment = null;
  let idx = 0;

  // Apartment?
  if (parts[0].startsWith("apartment")) {
    apartment = Number(parts[0].replace("apartment", ""));
    idx = 1;
  }

  const year = Number(parts[idx]);
  const section = parts[idx + 1].replace("Table", "");
  const rawMetric = parts[idx + 2]; // z.B. electricityCost12

  const metric = rawMetric.replace(/[0-9]{1,2}$/, "");

  return {
    apartment,
    year,
    section,
    metric,
    col,
  };
}

function toBool(value) {
  return value === true ||
    value === "true" ||
    value === 1 ||
    value === "1";
}

export function hideLoader() {
  document.getElementById("loadingOverlay").style.display = "none";
}

export function showLoader() {
  document.getElementById("loadingOverlay").style.display = "flex";
}

export function calculateConsumption(oldLevel, newLevel) {
  if (newLevel === null || oldLevel === null) return 0;
  return Math.abs(newLevel - oldLevel);
}