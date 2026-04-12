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

  // -----------------------------
  // 1. DB VALUES LADEN
  // -----------------------------
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

  // -----------------------------
  // 2. VERBRAUCH BERECHNEN
  // -----------------------------
  const consumptionInputs = allInputs.filter(function () {
    return this.id.toLowerCase().includes("consumption");
  });

  for (const element of consumptionInputs.toArray()) {
    const $input = $(element);
    const id = $input.attr("id");

    const { section } = Helper.parseInputId(id);

    const totalID = id.replace(/\d+$/, 13);
    const $total = $(`#${totalID}`);

    let totalVar = parseFloat($total.text()) || 0;

    // ausgelagerte Funktion
    const consumption = await Helper.calculateConsumptionForInput(id);

    totalVar += consumption;

    $input.val(consumption);
    $total.text(`${totalVar.toFixed(2)}${Helper.getMeasuringUnit(section)}`);
  }

  // -----------------------------
  // 3. KOSTEN BERECHNEN
  // -----------------------------
  const costInputs = allInputs.filter(function () {
    return this.id.toLowerCase().includes("cost");
  });

  for (const element of costInputs.toArray()) {
    const $input = $(element);
    const id = $input.attr("id");

    const totalID = id.replace(/\d+$/, 13);
    const $total = $(`#${totalID}`);

    let totalVar = parseFloat($total.text()) || 0;

    // ausgelagerte Funktion
    const cost = await Helper.calculateCostForInput(id);

    totalVar += cost;

    $input.val(cost);
    $total.text(`${totalVar.toFixed(2)}€`);
  }
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