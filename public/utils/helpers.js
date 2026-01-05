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
  i
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

export function createGraphDatesArray(section, year) {
  const datesArray = [];

  $(`#${year}_${section}_dateRow td input`).each(function () {
    const dateValue = $(this).val();
    datesArray.push(dateValue);
  });

  //console.log("datesArray",datesArray);
  return datesArray;
}

function getAllMetricsOfTableRow(apartment,year,section,metric){
  let data = [];
  for (let col = 1; col <= 12; col++) {
          
          const dataValue = $(`#apartment${apartment}_${year}_${section}Table_${metric}${col}`).val();
          
          //console.log(`#apartment${apartment}_${year}_${section}Table_${metric}${col}`,dataValue);
          data.push(Number(dataValue) || 0);
        }
        //console.log(`${apartment}-${metric}-Data`,data);
      return data;
}

function makeDatasetLayout(apartmentName,metric,dataArray,){
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
            i === meta.minIndex || i === meta.maxIndex ? 6 : 2
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
        }
}

export async function createGraphDatasets(section, year) {
  const datasets = [];
  const apartmentCount = await DB.getValueFromDB("apartmentcount");

  for (let apartment = 1; apartment <= apartmentCount; apartment++) {
    const apartmentName = (await DB.getValueFromDB(`apartment${apartment}name`)) ||`Wohnung ${apartment}`;

    
    let metrics;
    let displayMetrics;
    let data;

    switch (section) {
      case "energy":
          metrics = ["electricityMeterCount","electricityConsumption","electricityCost"];
          displayMetrics = ["Zählerstand","Verbrauch","Kosten"];

          for(let metric = 0; metric < metrics.length; metric++){
            const data = getAllMetricsOfTableRow(apartment, year, section, metrics[metric]);
            datasets.push(makeDatasetLayout(apartmentName, displayMetrics[metric], data));
          }
        break;
      case "water":
        metrics = [];
        displayMetrics = [];

        for(let metric = 0; metric < metrics.length; metric++){
            const data = getAllMetricsOfTableRow(apartment, year, section, metrics[metric]);
            datasets.push(makeDatasetLayout(apartmentName, displayMetrics[metric], data));
          }
        break;
      case "heating":
        metrics = [];
        displayMetrics = [];

        for(let metric = 0; metric < metrics.length; metric++){
            const data = getAllMetricsOfTableRow(apartment, year, section, metrics[metric]);
            datasets.push(makeDatasetLayout(apartmentName, displayMetrics[metric], data));
          }
        break;
    }
  }

  //===============================
  //=== Zählerstände ignorieren ===
  //===============================

  const filteredDatasets = datasets.filter(
    (ds) => !ds.label.startsWith("Zählerstand")
  );

  return filteredDatasets;
}

const energyCharts = {};

export function renderGraph(section, year, datesArray, datasets) {
  const ctx = document.getElementById(`${year}_${section}Graph`);

  // Prüfen, ob für dieses Jahr bereits ein Chart existiert
  if (energyCharts[year]) {
    // Bestehendes Chart updaten
    const chart = energyCharts[year];
    chart.data.labels = datesArray;
    chart.data.datasets = datasets;
    chart.update();
  } else {
    // Neues Chart erstellen
    energyCharts[year] = new Chart(ctx, {
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
}

export async function createGraph(section, year) {
  // Canvas einfügen, falls noch nicht vorhanden
  if (!$(`#${year}_${section}Graph`).length) {
    $(`#${year}_${section}TableContainer table`).after(`
            <div class="canvasWrapper">
            <canvas id="${year}_${section}Graph" width="400" height="200"></canvas>
            </div>
        `);
  }
  const datasets = await createGraphDatasets(section, year);
  const datesArray = createGraphDatesArray(section, year);
  renderGraph(section, year, datesArray, datasets);
}

export async function createOverviewGraph(section) {
  // Canvas einfügen, falls nicht vorhanden
  if (!$("#${section}OverviewGraph").length) {
    $("#overviewContainer h2").after(`
            <div class="canvasWrapper">
                <canvas id="${section}OverviewGraph" width="400" height="200"></canvas>
            </div>
        `);
  }

  const ctx = document.getElementById("${section}OverviewGraph");

  // -------------------------------------------
  // 1. Alle DB-Entries holen (key + value)
  // -------------------------------------------
  const allEntries = await DB.getAllKeysContaining("_${section}Table");

  // -------------------------------------------
  // 2. X-Achse bestimmen (alle Date12-Werte)
  // -------------------------------------------
  const rawDates = allEntries
    .filter((entry) => entry.key.includes("_${section}TableDate12"))
    .map((entry) => entry.value);

  // Dubletten entfernen + sortieren
  const xAxisDates = [...new Set(rawDates)].sort(
    (a, b) => new Date(a) - new Date(b)
  );

  // -------------------------------------------
  // 3. Overview-Datenstruktur vorbereiten
  // -------------------------------------------
  const apartmentCount = await DB.getValueFromDB("apartmentcount");
  const overviewData = {};
  for (let apartment = 1; apartment <= apartmentCount; apartment++) {
    overviewData[apartment] = {
      MeterCount: [],
      Consumption: [],
      Cost: [],
    };
  }

  // -------------------------------------------
  // 4. Für jedes Apartment: alle Werte für jedes Datum holen
  // -------------------------------------------
  for (let apartment = 1; apartment <= apartmentCount; apartment++) {
    const apartmentEntries = allEntries.filter((entry) =>
      entry.key.includes(`_apartment${apartment}`)
    );

    const meterCountEntries = apartmentEntries.filter((entry) =>
      entry.key.includes("MeterCount")
    );
    const consumptionEntries = apartmentEntries.filter((entry) =>
      entry.key.includes("Consumption")
    );
    const costEntries = apartmentEntries.filter((entry) =>
      entry.key.includes("Cost")
    );

    // Für jedes Datum den passenden Key finden
    for (const date of xAxisDates) {
      const year = date.slice(-4); // letzte 4 Zeichen = Jahr

      // MeterCount: nach Index sortieren, dann letzten Eintrag nehmen
      const mcEntry = meterCountEntries
        .filter((entry) =>
          entry.key.startsWith(`${year}_${section}TableMeterCount`)
        )
        .sort((a, b) => {
          const aIndex = Number(a.key.match(/MeterCount(\d+)_apartment/)[1]);
          const bIndex = Number(b.key.match(/MeterCount(\d+)_apartment/)[1]);
          return aIndex - bIndex;
        })
        .pop(); // letzter Eintrag

      // Consumption: dasselbe
      const consEntry = consumptionEntries
        .filter((entry) =>
          entry.key.startsWith(`${year}_${section}TableConsumption`)
        )
        .sort((a, b) => {
          const aIndex = Number(a.key.match(/Consumption(\d+)_apartment/)[1]);
          const bIndex = Number(b.key.match(/Consumption(\d+)_apartment/)[1]);
          return aIndex - bIndex;
        })
        .pop();

      // Cost: dasselbe
      const costEntry = costEntries
        .filter((entry) => entry.key.startsWith(`${year}_${section}TableCost`))
        .sort((a, b) => {
          const aIndex = Number(a.key.match(/Cost(\d+)_apartment/)[1]);
          const bIndex = Number(b.key.match(/Cost(\d+)_apartment/)[1]);
          return aIndex - bIndex;
        })
        .pop();

      // Werte in Overview-Datenstruktur speichern
      overviewData[apartment].MeterCount.push(
        mcEntry ? Number(mcEntry.value) : 0
      );
      overviewData[apartment].Consumption.push(
        consEntry ? Number(consEntry.value) : 0
      );
      overviewData[apartment].Cost.push(
        costEntry ? Number(costEntry.value) : 0
      );
    }
  }

  // -------------------------------------------
  // 5. Datasets bauen
  // -------------------------------------------
  const datasets = [];
  const typeLabels = {
    MeterCount: "Zählerstand",
    Consumption: "Verbrauch",
    Cost: "Kosten",
  };

  for (let apartment = 1; apartment <= apartmentCount; apartment++) {
    const apartmentName =
      (await DB.getValueFromDB(`apartment${apartment}name`)) ||
      `Wohnung ${apartment}`;

    for (const type of ["MeterCount", "Consumption", "Cost"]) {
      const values = overviewData[apartment][type];
      const { minIndex, maxIndex } = getMinMax(values);
      const color = stableColorFor(`Apartment${apartment}-${type}`);

      datasets.push({
        label: `${typeLabels[type]} ${apartmentName}`,
        data: values,
        borderColor: color,
        borderWidth: 2,
        tension: 0,
        pointRadius(ctx) {
          const i = ctx.dataIndex;
          return i === minIndex || i === maxIndex ? 6 : 3;
        },
        pointBorderWidth(ctx) {
          const i = ctx.dataIndex;
          return i === minIndex || i === maxIndex ? 3 : 1;
        },
        pointBackgroundColor(ctx) {
          const i = ctx.dataIndex;
          if (i === minIndex) return "blue";
          if (i === maxIndex) return "red";
          return color;
        },
      });
    }
  }

  console.log("Overview Graph Datasets:", datasets);

  //===============================
  //=== Zählerstände ignorieren ===
  //===============================

  const filteredDatasets = datasets.filter(
    (ds) => !ds.label.startsWith("Zählerstand")
  );

  // -------------------------------------------
  // 6. Chart erstellen
  // -------------------------------------------
  new Chart(ctx, {
    type: "line",
    data: {
      labels: xAxisDates,
      datasets: filteredDatasets,
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: false },
      },
      interaction: {
        mode: "nearest",
        intersect: false,
      },
      plugins: {
        tooltip: {
          mode: "nearest",
          intersect: false,
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
        },
      },
    },
  });
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
