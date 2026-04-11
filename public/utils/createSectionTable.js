import * as DB from "./database.js";
import * as Helper from "../utils/helpers.js";

/**
 * Erzeugt eine Jahrestabelle für die passende Seite (section) und das passende Jahr (year)
 * @param {String} section
 * @param {String} year
 * @returns {HTML}
 */
export async function createSectionTable(section, year) {
  await makeTableWrapper(section, year);
  await makeTableBody(section, year);
  await fillTableWithData(section, year);
  await toggleTableCollapsed(section, year);
}

// 1.
//=========================
//===== TABLE WRAPPER =====
//=========================
function makeTableWrapper(section, year) {
  $(".annualTablesWrapper").prepend(`
        <div class="annualTableContainer" id="${year}_${section}TableContainer">
            <div class="annualTableHeaderContainer" id="${year}_${section}TableHeaderContainer">
                <img class="tableCollapseIcon" src="../assets/caret-down-solid-full.svg">
                <input class="tableHeaderInput" type="number" id="${year}_${section}TableHeaderH2" value="${year}">
                <img class="tableDeleteIcon" src="../assets/trash-solid-full.svg">
            </div>
            <div class="tableWrapper">
                <table>
                <thead>
                </thead>
                <tbody>
                </tbody>
                </table>
            </div>
        </div>    
    `);
}

// 2.
//======================
//===== TABLE BODY =====
//======================
async function makeTableBody(section, year) {
  let apartmentCount = await DB.getValueFromDB("apartmentcount");
  const $tbody = $(`#${year}_${section}TableContainer tbody`);
  $tbody.empty();

  let tableRows = "";

  // Datumszeile
  tableRows += makeDateRow(section, year);

  switch (section) {
    case "energy":
      for (let apartment = 1; apartment <= apartmentCount; apartment++) {
        const apartmentName =
          (await DB.getValueFromDB(`apartment${apartment}name`)) ||
          `Wohnung ${apartment}`;

        tableRows += `
            <tr>
                <td rowspan="3">${apartmentName}</td>
                <td>Zählerstand</td>
            `;
        tableRows += makeApartmentRow(
          section,
          year,
          apartment,
          "electricityMeterCount",
        );
        tableRows += "</tr>";

        tableRows += `
            <tr>
                <td>Verbrauch</td>
            `;
        tableRows += makeApartmentRow(
          section,
          year,
          apartment,
          "electricityConsumption",
        );
        tableRows += "</tr>";

        tableRows += `
            <tr>
                <td>Kosten</td>
            `;
        tableRows += makeApartmentRow(
          section,
          year,
          apartment,
          "electricityCost",
        );
        tableRows += "</tr>";
      }
      break;

    case "water":
      // Allgemeine Inputs (vor allen Wohnungen)
      tableRows += `
            <tr>
                <td rowspan="7">Allgemein</td>
                <td>Druck Heizung</td>
            `;
      tableRows += makeMainRow(section, year, "heatingPressure");
      tableRows += "</tr>";

      tableRows += `
            <tr>
                <td>Druck Wasser</td>
            `;
      tableRows += makeMainRow(section, year, "waterPressure");
      tableRows += "</tr>";

      tableRows += `
            <tr>
                <td>Druck Solar</td>
            `;
      tableRows += makeMainRow(section, year, "solarPressure");
      tableRows += "</tr>";

      tableRows += `
            <tr>
                <td>Zählerstand Gesamt</td>
            `;
      tableRows += makeMainRow(section, year, "mainWaterMeterCount");
      tableRows += "</tr>";

      tableRows += `
            <tr>
                <td>Verbrauch Gesamt</td>
            `;
      tableRows += makeMainRow(section, year, "mainWaterConsumption");
      tableRows += "</tr>";

      tableRows += `
            <tr>
                <td>Kosten Wasser Gesamt</td>
            `;
      tableRows += makeMainRow(section, year, "mainWaterCost");
      tableRows += "</tr>";

      tableRows += `
            <tr>
                <td>Kosten Abwasser Gesamt</td>
            `;
      tableRows += makeMainRow(section, year, "mainSewageCost");
      tableRows += "</tr>";

      for (let apartment = 1; apartment <= apartmentCount; apartment++) {
        const apartmentName =
          (await DB.getValueFromDB(`apartment${apartment}name`)) ||
          `Wohnung ${apartment}`;

        // Berechne wie viele Spalten pro Wohnung benötigt werden
        let rowSpan = 2; // default Verbrauch + Kosten
        let hasWarm =
          (await DB.getValueFromDB(
            `apartment${apartment}IsWarmWaterMeterExisting`,
          )) === "checked";
        let hasCold =
          (await DB.getValueFromDB(
            `apartment${apartment}IsColdWaterMeterExisting`,
          )) === "checked";

        if (hasWarm) rowSpan += 2;
        if (hasCold) rowSpan += 2;
        // rowSpan += 2; // Kosten Wasser + Kosten Abwasser

        tableRows += `
                <tr>
                    <td rowspan="6">${apartmentName}</td>
                    <td>Zählerstand Warm</td>
                `;
        tableRows += makeApartmentRow(
          section,
          year,
          apartment,
          "warmWaterMeterCount",
        );
        tableRows += "</tr>";

        tableRows += `
                <tr>
                    <td>Zählerstand Kalt</td>
                `;
        tableRows += makeApartmentRow(
          section,
          year,
          apartment,
          "coldWaterMeterCount",
        );
        tableRows += "</tr>";

        tableRows += `
                <tr>
                    <td>Verbrauch Warm</td>
                `;
        tableRows += makeApartmentRow(
          section,
          year,
          apartment,
          "warmWaterConsumption",
        );
        tableRows += "</tr>";

        tableRows += `
                <tr>
                    <td>Verbrauch Kalt</td>
                `;
        tableRows += makeApartmentRow(
          section,
          year,
          apartment,
          "coldWaterConsumption",
        );
        tableRows += "</tr>";

        tableRows += `
                <tr>
                    <td>Kosten Wasser</td>
                `;
        tableRows += makeApartmentRow(section, year, apartment, "waterCost");
        tableRows += "</tr>";

        tableRows += `
                <tr>
                    <td>Kosten Abwasser</td>
                `;
        tableRows += makeApartmentRow(section, year, apartment, "sewageCost");
        tableRows += "</tr>";
      }
      break;

    case "heating":
      tableRows += `
            <tr>
                <td rowspan="3">Öl</td>
                <td>Füllstand</td>
            `;
      tableRows += makeMainRow(section, year, "oilLevelInTank");
      tableRows += "</tr>";

      tableRows += `
            <tr>
                <td>Verbrauch</td>
            `;
      tableRows += makeMainRow(section, year, "oilConsumption");
      tableRows += "</tr>";

      tableRows += `
            <tr>
                <td>Kosten</td>
            `;
      tableRows += makeMainRow(section, year, "oilCost");
      tableRows += "</tr>";

      tableRows += `
            <tr>
                <td rowspan="2">Heizung</td>
                <td>Betriebstunden</td>
            `;
      tableRows += makeMainRow(section, year, "boilerOperatingHours");
      tableRows += "</tr>";

      tableRows += `
            <tr>
                <td>Laufzeit</td>
            `;
      tableRows += makeMainRow(section, year, "boilerRuntime");
      tableRows += "</tr>";

      tableRows += `
            <tr>
                <td rowspan="4">Solar Pumpe</td>
                <td>Betriebstunden</td>
            `;
      tableRows += makeMainRow(section, year, "solarpumpOperatingHours");
      tableRows += "</tr>";

      tableRows += `
            <tr>
                <td>Laufzeit</td>
            `;
      tableRows += makeMainRow(section, year, "solarpumpRuntime");
      tableRows += "</tr>";

      tableRows += `
            <tr>
                <td>Zählerstand</td>
            `;
      tableRows += makeMainRow(section, year, "solarpumpMeterCount");
      tableRows += "</tr>";

      tableRows += `
            <tr>
                <td>Erzeugte Energie</td>
            `;
      tableRows += makeMainRow(section, year, "solarpumpProducedEnergy");
      tableRows += "</tr>";

      break;
  }

  $tbody.append(tableRows);
}

function makeDateRow(section, year) {
  let colString = `
    <tr id="${year}_${section}_dateRow">
        <td></td>
        <td>Datum</td>
    `;
  for (let col = 1; col <= 12; col++) {
    colString += `<td><input type="text" id="${year}_${section}Table_date${col}" value=""></td>`;
  }
  colString += `<td id="${year}_${section}Table_date13">Summe</td>`;
  colString += "</tr>";
  return colString;
}

function makeMainRow(section, year, metric) {
  let disabled =
    metric.toLowerCase().includes("cost") ||
      metric.toLowerCase().includes("consumption")
      ? "disabled"
      : "";

  let colString = "";
  for (let col = 1; col <= 12; col++) {
    colString += `<td><input type="text" id="${year}_${section}Table_${metric}${col}" value="" ${disabled}></td>`;
  }
  colString += `<td id="${year}_${section}Table_${metric}13"></td>`;
  return colString;
}

function makeApartmentRow(section, year, apartment, metric) {
  let disabled =
    metric.toLowerCase().includes("cost") ||
      metric.toLowerCase().includes("consumption")
      ? "disabled"
      : "";

  let colString = "";
  for (let col = 1; col <= 12; col++) {
    colString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table_${metric}${col}" value="" ${disabled}></td>`;
  }
  colString += `<td id="apartment${apartment}_${year}_${section}Table_${metric}13"></td>`;
  return colString;
}

async function fillTableWithData(section, year) {
  const $tbody = $(`#${year}_${section}TableContainer tbody`);
  const allInputs = $tbody.find("input");

  // DB values
  for (const element of allInputs.toArray()) {
    const $input = $(element);
    const id = $input.attr("id");
    const value = $input.val();

    if (
      id.toLowerCase().includes("cost") ||
      id.toLowerCase().includes("consumption") ||
      value !== ""
    )
      continue;

    const data = await DB.getValueFromDB(id);
    if (data) $input.val(data);
  }

  // Consumption calculations
  let filteredInputs = allInputs.filter(function () {
    return this.id.toLowerCase().includes("consumption");
  });

  for (const element of filteredInputs.toArray()) {
    const $input = $(element);
    const id = $input.attr("id");

    const { apartment, year, section, metric, col } = parseInputId(id);

    const totalID = id.replace(/\d+$/, 13);
    const $total = $(`#${totalID}`);

    // IMMER aktuellen Wert aus DOM lesen
    let totalVar = parseFloat($total.text()) || 0;

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
        col - 1,
      );
    }

    const oldMeterCount = await DB.getValueFromDB(oldMeterCountInputID);

    const consumption =
      calculateConsumption(oldMeterCount, currentMeterCount) || 0;

    totalVar += consumption;

    $input.val(consumption);
    let measuringUnit;
    switch (section) {
      case "energy":
        measuringUnit = " kWh";
        break;
      case "water":
        measuringUnit = "L";
        break;
      case "heating":
        measuringUnit = "L";
        break;
    }
    $total.text(`${totalVar.toFixed(2)}${measuringUnit}`);
  }

  // Cost calculations
  filteredInputs = allInputs.filter(function () {
    return this.id.toLowerCase().includes("cost");
  });


  for (const element of filteredInputs.toArray()) {
    const $input = $(element);
    const id = $input.attr("id");

    const { apartment, year, section, metric, col } = parseInputId(id);

    const totalID = id.replace(/\d+$/, 13);
    const $total = $(`#${totalID}`);

    let totalVar = parseFloat($total.text()) || 0;

    let cost = 0;

    switch (section) {
      case "energy": {
        // --- DB FEES LADEN ---
        let dbFees = [
          ...(await DB.getAllKeysContaining(`apartment${apartment}electricityFee`)),
          ...(await DB.getAllKeysContaining(`apartment${apartment}electricityMeterFee`)),
        ]
          .map(obj => {
            const isMeterFee = obj.key.includes("MeterFee");
            return {
              ...obj,
              date: Helper.extractDate(obj.key),
              type: isMeterFee ? "meterFee" : "fee"
            };
          })
          .filter(obj => obj.date)
          .sort((a, b) => a.date - b.date);

        // --- DATUM HOLEN ---
        let inputDateRaw = await DB.getValueFromDB(`${year}_${section}Table_date${col}`);

        let inputDate = null;
        if (inputDateRaw) {
          const [day, month, year] = inputDateRaw.split(".").map(Number);
          inputDate = new Date(year, month - 1, day);
        }

        // --- passenden Wert holen ---
        const getValueForDate = (arr) => {
          let val = arr[0]?.value || 0;

          for (const entry of arr) {
            if (entry.date <= inputDate) {
              val = entry.value;
            } else {
              break;
            }
          }
          return parseFloat(val) || 0;
        };

        // --- FEES TRENNEN ---
        const electricityFees = dbFees.filter(e => e.type === "fee");
        const meterFees = dbFees.filter(e => e.type === "meterFee");

        const costPerKwh = getValueForDate(electricityFees);
        const metercountFee = getValueForDate(meterFees);

        // --- VERBRAUCH ---
        let consumption = $(
          `#apartment${apartment}_${year}_${section}Table_electricityConsumption${col}`
        ).val();

        consumption = parseFloat(consumption) || 0;

        // --- KOSTEN ---
        cost = consumption * costPerKwh + metercountFee / 12;
        cost = parseFloat(cost.toFixed(2));

        break;
      }

      case "water":
        // kommt später
        cost = 0;
        break;

      case "heating":
        // kommt später
        cost = 0;
        break;
    }

    // --- GEMEINSAMER TEIL ---
    totalVar += cost;

    $input.val(cost);
    $total.text(`${totalVar.toFixed(2)}€`);
  }
}

function parseInputId(id) {
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


// 4.
//==========================
//===== TABLE COLLAPSE =====
//==========================
async function toggleTableCollapsed(section, year) {

  // prüfen, ob collaped DB eintrag, wenn ja
  const tableCollapsed = await DB.getValueFromDB(
    `${year}_${section}TableCollapsed`,
  );

  const container = $(`#${year}_${section}TableContainer`);
  const icon = container.find(".tableCollapseIcon");
  if (tableCollapsed === null) {
    await DB.saveValueToDB(`${year}_${section}TableCollapsed`, "false");
  }

  if (tableCollapsed == "true") {
    container.find(".tableWrapper").hide();
    container.find(".canvasWrapper").hide();
    icon.addClass("rotated");
  } else {
    container.find(".tableWrapper").show();
    container.find(".canvasWrapper").show();
    icon.removeClass("rotated");
  }
}

function calculateConsumption(oldLevel, newLevel) {
  if (newLevel === null || oldLevel === null) return 0;
  return Math.abs(newLevel - oldLevel);
}