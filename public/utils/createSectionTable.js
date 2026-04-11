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

    // auf initial sortierte dbFees zugreifen
    //alle meterFee und Fee werte aus DB holen
    let dbFees;
    switch (section) {
      case "energy":
        dbFees = [
          ...(await DB.getAllKeysContaining("electricityFee")),
          ...(await DB.getAllKeysContaining("electricityMeterFee")),
        ];
        break;
      case "water":
        dbFees = [
          ...(await DB.getAllKeysContaining("coldWaterMeterFee")),
          ...(await DB.getAllKeysContaining("warmWaterMeterFee")),
          ...(await DB.getAllKeysContaining("mainWaterMeterFee")),
          ...(await DB.getAllKeysContaining("precipitationFee")),
        ];
        break;
      case "heating":
        dbFees = [];
        break;
    }

    // dbFees nach datum sortieren, älteste zuerst
    dbFees = dbFees
      .map((obj) => {
        const parsed = Helper.parseDBKey(obj.key);
        return {
          ...obj,
          date: Helper.extractDate(obj.key),
          type: parsed.type,
          apartment: parsed.apartment,
        };
      })
      .filter((obj) => obj.date)
      .sort((a, b) => a.date - b.date);

    const electricityFees = dbFees.filter((e) => e.type === "fee");
    const meterFees = dbFees.filter((e) => e.type === "meterFee");

    const totalID = id.replace(/\d+$/, 13);
    const $total = $(`#${totalID}`);

    // eigenes Total nur für COST
    let totalVar = parseFloat($total.text()) || 0;

    let consumption = $(
      `#apartment${apartment}_${year}_${section}Table_electricityConsumption${col}`,
    ).val();
    let costPerKwh = await DB.getNewestValueFromDB(
      `apartment${apartment}electricityFee`,
    );
    let metercountFee = await DB.getNewestValueFromDB(
      `apartment${apartment}electricityMeterFee`,
    );

    consumption = parseFloat(consumption) || 0;
    costPerKwh = parseFloat(costPerKwh) || 0;
    metercountFee = parseFloat(metercountFee) || 0;

    let cost = consumption * costPerKwh + metercountFee / 12;
    cost = parseFloat(cost.toFixed(2));

    //console.log(`(${consumption} * ${costPerKwh}) + (${metercountFee} / 12) = ${cost}`);

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

// 3.1
//----------------------
//----- Energy Row -----
//----------------------
async function makeEnergyBody(section, year) {
  const key = (y, r) =>
    `apartment${apartment}_${y}_${section}Table${r}_meterCount`;

  const rawMeter = await DB.getValueFromDB(key(year, row));
  const meterCount =
    rawMeter === "" || rawMeter === null ? "" : Number(rawMeter);

  // Wenn kein Zählerstand: NICHTS berechnen
  if (meterCount === "") {
    return `
            <td><input type="text" id="${key(year, row)}" value=""></td>
            <td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_consumption" value="" disabled></td>
            <td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_cost" value="" disabled></td>
        `;
  }

  // ----- Verbrauch berechnen -----
  let oldMeterCount = 0;

  if (row === 1) {
    for (let r = 12; r > 0 && oldMeterCount === 0; r--) {
      oldMeterCount = Number(await DB.getValueFromDB(key(year - 1, r))) || 0;
    }
  } else {
    oldMeterCount = Number(await DB.getValueFromDB(key(year, row - 1))) || 0;
  }

  const consumption = oldMeterCount > 0 ? meterCount - oldMeterCount : 0;

  // ----- Kosten berechnen -----
  let cost = "";
  if (consumption > 0) {
    const price =
      Number(
        await DB.getNewestValueFromDB(`apartment${apartment}electricityFee`),
      ) || 0;
    if (price > 0) {
      const meterFee =
        Number(
          await DB.getNewestValueFromDB(
            `apartment${apartment}electricityMeterFee`,
          ),
        ) || 0;
      cost = (consumption * price + meterFee / 12).toFixed(2);
    }
  }

  return `
        <td><input type="text" id="${key(year, row)}" value="${meterCount}"></td>
        <td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_consumption" value="${consumption || ""}" disabled></td>
        <td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_cost" value="${cost}" disabled></td>
    `;
}

// 3.2
//----------------------
//----- Water Body -----
//----------------------
async function makeWaterBody(section, year) {
  const $tbody = $(`#${year}_${section}TableContainer tbody`);
  const tableRows = $($tbody).find("tr").length;

  let apartmentCount = await DB.getValueFromDB("apartmentcount");

  let heatingPressure;
  let waterPressure;
  let solarPressure;
  let mainMeterCount;
  let mainConsumption;
  let mainWaterCost;
  let mainSewageCost;

  //~~~~~~~~~~~~~~~~~
  //~~~ Allgemein ~~~
  //~~~~~~~~~~~~~~~~~

  let rowString = "";
  let mainWaterConsumption = 0;
  if (apartment == 1) {
    // Druck Heizung

    let heatingPressure =
      (await DB.getValueFromDB(
        `apartment${apartment}_${year}_${section}Table${row}_heatingPressure`,
      )) || "";
    rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_heatingPressure" value="${heatingPressure}"></td>`;

    // Druck Wasser
    let waterPressure =
      (await DB.getValueFromDB(
        `apartment${apartment}_${year}_${section}Table${row}_waterPressure`,
      )) || "";
    rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_waterPressure" value="${waterPressure}"></td>`;

    // Druck Solar
    let solarPressure =
      (await DB.getValueFromDB(
        `apartment${apartment}_${year}_${section}Table${row}_solarPressure`,
      )) || "";
    rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_solarPressure" value="${solarPressure}"></td>`;

    // Hauptwasserzähler
    let mainWaterMeterCount =
      (await DB.getValueFromDB(
        `apartment${apartment}_${year}_${section}Table${row}_mainWaterMeterCount`,
      )) || "";
    rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_mainWaterMeterCount" value="${mainWaterMeterCount}"></td>`;

    // Hauptverbrauch (nur verwendet falls keine Einzelzähler)

    if (row == 1) {
      let oldMainWaterMeterCount =
        (await DB.getValueFromDB(
          `apartment${apartment}_${year - 1}_${section}Table${12}_mainWaterMeterCount`,
        )) || "";
      if (oldMainWaterMeterCount == "") {
        // Erster Zählerstand, kein verbrauch. Nix tun
      } else {
        if (!(mainWaterMeterCount == "")) {
          mainWaterConsumption = mainWaterMeterCount - oldMainWaterMeterCount;
        }
      }
    } else {
      let oldMainWaterMeterCount =
        (await DB.getValueFromDB(
          `apartment${apartment}_${year}_${section}Table${row - 1}_mainWaterMeterCount`,
        )) || "";
      if (!(mainWaterMeterCount == "")) {
        mainWaterConsumption = mainWaterMeterCount - oldMainWaterMeterCount;
      }
    }
    rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_mainWaterConsumption" value="${mainWaterConsumption}" disabled></td>`;

    // Hauptwasser / Hauptabwasser Kosten
    let mainWaterCost;
    let mainSewageCost;

    let mainCostPerLiter = (await DB.getValueFromDB(`costPerLiterWater`)) || 0;
    let mainCostPerLiterSewage =
      (await DB.getValueFromDB(`costPerLiterSewage`)) || 0;

    let mainWaterMeterFee = (await DB.getValueFromDB(`mainWaterMeterFee`)) || 0;

    // MainWasserVerbrauch * mainWasserkosten + mainZählergebühr
    mainWaterCost = mainWaterConsumption * mainCostPerLiter + mainWaterMeterFee;
    // MainWasserVerbrauch * mainSewagekosten + mainZählergebühr
    mainSewageCost =
      mainWaterConsumption * mainCostPerLiterSewage + mainWaterMeterFee;

    rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_mainWaterCost" value="${mainWaterCost}" disabled></td>`;
    rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_mainSewageCost" value="${mainSewageCost}" disabled></td>`;
  }

  let hasWarmWaterMeter =
    (await DB.getValueFromDB(
      `apartment${apartment}IsWarmWaterMeterExisting`,
    )) == "checked";
  let hasColdWaterMeter =
    (await DB.getValueFromDB(
      `apartment${apartment}IsColdWaterMeterExisting`,
    )) == "checked";

  //
  // ====================================
  //   Verbrauchsberechnung Warmwasser
  // ====================================
  //
  let warmWaterMeterCount = "";
  let warmWaterConsumption = 0;

  if (hasWarmWaterMeter) {
    warmWaterMeterCount =
      (await DB.getValueFromDB(
        `apartment${apartment}_${year}_${section}Table${row}_warmWaterMeterCount`,
      )) || "";

    if (warmWaterMeterCount !== "") {
      let oldWarm = "";

      if (row == 1) {
        // Vorjahr suchen
        let checkRow = 12;
        while (checkRow > 0 && oldWarm === "") {
          oldWarm =
            (await DB.getValueFromDB(
              `apartment${apartment}_${year - 1}_${section}Table${checkRow}_warmWaterMeterCount`,
            )) || "";
          checkRow--;
        }
      } else {
        oldWarm =
          (await DB.getValueFromDB(
            `apartment${apartment}_${year}_${section}Table${row - 1}_warmWaterMeterCount`,
          )) || "";
      }

      if (oldWarm !== "") {
        warmWaterConsumption = warmWaterMeterCount - oldWarm;
      } else {
        warmWaterConsumption = 0; // erster Zählerstand, kein Verbrauch
      }
    }

    rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_warmWaterMeterCount" value="${warmWaterMeterCount}"></td>`;
    rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_warmWaterConsumption" value="${warmWaterConsumption}" disabled></td>`;
  }

  //
  // ====================================
  //   Verbrauchsberechnung Kaltwasser
  // ====================================
  //
  let coldWaterMeterCount = "";
  let coldWaterConsumption = 0;

  if (hasColdWaterMeter) {
    coldWaterMeterCount =
      (await DB.getValueFromDB(
        `apartment${apartment}_${year}_${section}Table${row}_coldWaterMeterCount`,
      )) || "";

    if (coldWaterMeterCount !== "") {
      let oldCold = "";

      if (row == 1) {
        // Vorjahr suchen
        let checkRow = 12;
        while (checkRow > 0 && oldCold === "") {
          oldCold =
            (await DB.getValueFromDB(
              `apartment${apartment}_${year - 1}_${section}Table${checkRow}_coldWaterMeterCount`,
            )) || "";
          checkRow--;
        }
      } else {
        oldCold =
          (await DB.getValueFromDB(
            `apartment${apartment}_${year}_${section}Table${row - 1}_coldWaterMeterCount`,
          )) || "";
      }

      if (oldCold !== "") {
        coldWaterConsumption = coldWaterMeterCount - oldCold;
      } else {
        coldWaterConsumption = 0; // erster Zählerstand, kein Verbrauch
      }
    }

    rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_coldWaterMeterCount" value="${coldWaterMeterCount}"></td>`;
    rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_coldWaterConsumption" value="${coldWaterConsumption}" disabled></td>`;
  }

  //
  // ====================================
  //   Kostenberechnung
  // ====================================

  let waterCost;
  let sewageCost;

  // hat wohnung warm- & kaltwasserzähler?
  // Fall 1: verbrauch beider zähler addieren, wasser&abwasserkosten pro liter dazuholen, zählergebühren/12 addieren
  if (hasColdWaterMeter && hasWarmWaterMeter) {
    let totalConsumption = coldWaterConsumption + warmWaterConsumption;
    let coldWaterMeterFee =
      (await DB.getNewestValueFromDB(
        `apartment${apartment}coldWaterMeterFee`,
      )) || 0;
    let warmWaterMeterFee =
      (await DB.getNewestValueFromDB(
        `apartment${apartment}warmWaterMeterFee`,
      )) || 0;
    let waterCostPerLiter =
      (await DB.getNewestValueFromDB(`costPerLiterWater`)) || 0;
    let sewageCostPerLiter =
      (await DB.getNewestValueFromDB(`costPerLiterSewage`)) || 0;

    //console.log(totalConsumption, waterCostPerLiter, coldWaterMeterFee, warmWaterMeterFee);

    let totalWaterCost = (
      totalConsumption * waterCostPerLiter +
      coldWaterMeterFee / 12 +
      warmWaterMeterFee / 12
    ).toFixed(2);
    let totalSewageCost = (
      totalConsumption * sewageCostPerLiter +
      coldWaterMeterFee / 12 +
      warmWaterMeterFee / 12
    ).toFixed(2);

    waterCost = totalWaterCost;
    sewageCost = totalSewageCost;
    //...
  }

  // Wohnung hat nicht beide Zähler
  // Fall 2:
  // wenn apartmentcount 2:
  // wenn apartment == 1, prüfe ob apartment 2 zähler hat
  // wenn apartment == 2, prüfe ob apartment 1 zähler hat
  // wenn anderes apartment zähler hat, dessen kosten von gesamtkosten abziehen. ergebnis sind apartmentkosten
  else {
    if (apartmentCount == 2) {
      let otherHasColdWaterMeter;
      let otherHasWarmWaterMeter;

      let totalConsumption;
      let coldWaterMeterFee;
      let warmWaterMeterFee;
      let waterCostPerLiter;
      let sewageCostPerLiter;

      let totalWaterCost;
      let totalSewageCost;

      let mainWaterCost;

      switch (apartment) {
        case 1:
          otherHasColdWaterMeter = await DB.getValueFromDB(
            `apartment${2}IsColdWaterMeterExisting`,
          );
          otherHasWarmWaterMeter = await DB.getValueFromDB(
            `apartment${2}IsWarmWaterMeterExisting`,
          );

          if (otherHasColdWaterMeter && otherHasWarmWaterMeter) {
            totalConsumption = coldWaterConsumption + warmWaterConsumption;
            coldWaterMeterFee =
              (await DB.getNewestValueFromDB(
                `apartment${2}coldWaterMeterFee`,
              )) || 0;
            warmWaterMeterFee =
              (await DB.getNewestValueFromDB(
                `apartment${2}warmWaterMeterFee`,
              )) || 0;
            waterCostPerLiter =
              (await DB.getNewestValueFromDB(
                `apartment${2}costPerLiterWater`,
              )) || 0;
            sewageCostPerLiter =
              (await DB.getNewestValueFromDB(
                `apartment${2}costPerLiterSewage`,
              )) || 0;

            totalWaterCost = (
              totalConsumption * waterCostPerLiter +
              coldWaterMeterFee / 12 +
              warmWaterMeterFee / 12
            ).toFixed(2);
            totalSewageCost = (
              totalConsumption * sewageCostPerLiter +
              coldWaterMeterFee / 12 +
              warmWaterMeterFee / 12
            ).toFixed(2);

            waterCost = totalWaterCost;
            sewageCost = totalSewageCost;
          }
          break;
        case 2:
          otherHasColdWaterMeter = await DB.getValueFromDB(
            `apartment${1}IsColdWaterMeterExisting`,
          );
          otherHasWarmWaterMeter = await DB.getValueFromDB(
            `apartment${1}IsWarmWaterMeterExisting`,
          );

          if (otherHasColdWaterMeter && otherHasWarmWaterMeter) {
            totalConsumption = coldWaterConsumption + warmWaterConsumption;
            coldWaterMeterFee =
              (await DB.getNewestValueFromDB(
                `apartment${1}coldWaterMeterFee`,
              )) || 0;
            warmWaterMeterFee =
              (await DB.getNewestValueFromDB(
                `apartment${1}warmWaterMeterFee`,
              )) || 0;
            waterCostPerLiter =
              (await DB.getNewestValueFromDB(
                `apartment${1}costPerLiterWater`,
              )) || 0;
            sewageCostPerLiter =
              (await DB.getNewestValueFromDB(
                `apartment${1}costPerLiterSewage`,
              )) || 0;

            totalWaterCost = (
              totalConsumption * waterCostPerLiter +
              coldWaterMeterFee / 12 +
              warmWaterMeterFee / 12
            ).toFixed(2);
            totalSewageCost = (
              totalConsumption * sewageCostPerLiter +
              coldWaterMeterFee / 12 +
              warmWaterMeterFee / 12
            ).toFixed(2);

            waterCost = totalWaterCost;
            sewageCost = totalSewageCost;
          }
          break;
      }
    }
  }
  // sonst:

  /*
    // Wohnung hat nur Warmwasserzähler
    else if(!hasColdWaterMeter && hasWarmWaterMeter){
      //...
    }
 
    // Wohnung hat nur Kaltwasserzähler
    else if(hasColdWaterMeter && !hasWarmWaterMeter){
      //...
    }
 
    // Wohnung hat keine eigenen Zähler
    else if(!hasColdWaterMeter && !hasWarmWaterMeter){
      //...
    }
    */

  rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_waterCost" value="${waterCost}" disabled></td>`;
  rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_sewageCost" value="${sewageCost}" disabled></td>`;

  return rowString;
}

// 3.3
//-----------------------
//----- Heating Row -----
//-----------------------
async function makeHeatingBody(section, year) {
  let rowString = "";

  //console.log("heating apartment 1");
  // Wieviele Öltanks?
  let areTanksConnected = await DB.getValueFromDB("areOilTanksConnected");
  areTanksConnected = areTanksConnected == "checked" ? true : false;

  if (!areTanksConnected) {
    //console.log("tanks not connected");

    let numberOfOilTanks = await DB.getNewestValueFromDB("numberOfOilTanks");
    if (numberOfOilTanks !== null) {
      for (let tank = 1; tank <= numberOfOilTanks; tank++) {
        let oilLevelInTank =
          (await DB.getValueFromDB(
            `apartment${apartment}_${year}_${section}Table${row}_oilLevelInTank${tank}`,
          )) || "";
        rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_oilLevelInTank${tank}" value="${oilLevelInTank}"></td>`;
      }
    }
  } else {
    //console.log("tanks connected");
    let oilLevelInTanks =
      (await DB.getValueFromDB(
        `apartment${apartment}_${year}_${section}Table${row}_oilLevelInTanks`,
      )) || "";
    rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_oilLevelInTanks" value="${oilLevelInTanks}"></td>`;
  }

  // Verbauch Öl
  let oilConsumption = await DB.getValueFromDB(
    `apartment${apartment}_${year}_${section}Table${row}_oilConsumption`,
  );
  //console.log("oilConsumption (beginning)", oilConsumption);

  if (oilConsumption === null) {
    //console.log("no oil consumption for row", row, "in DB");
    if (areTanksConnected) {
      //console.log("tanks connected (again)");
      const oldLevel =
        row === 1
          ? await getTankLevel(apartment, year - 1, section, 12)
          : await getTankLevel(apartment, year, section, row - 1);

      const newLevel = await getTankLevel(year, row);

      oilConsumption = calculateConsumption(oldLevel, newLevel);

      //console.log("oldLevel", oldLevel, "newLevel", newLevel, "oilConsumption", oilConsumption);
    } else {
      //console.log("tanks not connected (again)");
      let combined = 0;
      let numberOfOilTanks = await DB.getNewestValueFromDB("numberOfOilTanks");

      for (let tank = 1; tank <= numberOfOilTanks; tank++) {
        const oldLevel =
          row === 1
            ? await getTankLevel(year - 1, 12, tank)
            : await getTankLevel(year, row - 1, tank);

        const newLevel = await getTankLevel(year, row, tank);

        combined += calculateConsumption(oldLevel, newLevel);

        //console.log("tank", tank, "oldLevel", oldLevel, "newLevel", newLevel, "combined", combined);
      }

      oilConsumption = combined;
      //console.log("oilConsumption (combined)", oilConsumption);
    }

    await DB.saveValueToDB(
      `apartment${apartment}_${year}_${section}Table${row}_oilConsumption`,
      oilConsumption,
    );
  }

  rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_oilConsumption" value="${oilConsumption}" disabled></td>`;

  // Öl Kosten
  //...
  let oilCost = await DB.getValueFromDB(
    `apartment${apartment}_${year}_${section}Table${row}_oilCost`,
  );

  if (oilCost === null) {
    oilCost = 999;
    // Wenn keine Ölkosten in DB, selbst berechnen und in DB speichern

    // Berechnung:
    /*
        Beispiel:
        1.1.2020 wird z.b. 100 Liter Öl gekauft. Bedeutet Füllstand ist höher als vorher. Preis pro liter z.B. 1€.
        Datum kann aber von Zählerstandmessung Variieren.
        Es werden theoretisch 20 Liter verbraucht. heißt wir haben Dreisatzrechung:
        100 Liter = 100€
        1 Liter = 1€
        20 Liter = 20€ 
 
        Vermerk: Restbestand = 80 Liter mit Wert = 80€
 
        15.10.2020 wieder Tanken, diesmal 30 Liter für 2€ pro Liter.
 
        Heißt im Tank sind jetzt 110 Liter, wobei 30 Liter davon 60€ wert sind und 80 davon sind 80€wert. 
        Bei verbrauch wird der einfachheit halber immer der ältere restbestand aufgebraucht um rekursion zu vermeiden.
 
        Es werden also jetzt theoretisch 90 Liter verbraucht. Heißt wir haben komplizierteren Dreisatz:
        90 Liter > 80 Liter restbestand, heißt Restbestand = 0, restwert = 0, kosten = restbestandwert = 80€
        Differenz: 10 Liter.
        30 Liter = 60€
        1 Liter = 2€
        10 Liter = 20€
 
        kosten + 20€
 
        neuer restbestand = 20 Liter, restbestandwert = 20*2 = 40€
 
 
        usw.
        */
  }

  rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_oilCost" value="${oilCost}" disabled></td>`;

  // Betriebstunden Heizung
  //...
  let operatingHoursBoiler =
    (await DB.getValueFromDB(
      `apartment${apartment}_${year}_${section}Table${row}_operatingHoursBoiler`,
    )) || "";
  rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_operatingHoursBoiler" value="${operatingHoursBoiler}"></td>`;

  // Laufzeit Heizung
  //...
  let runtimeBoiler = await DB.getValueFromDB(
    `apartment${apartment}_${year}_${section}Table${row}_runtimeBoiler`,
  );
  if (runtimeBoiler === null) {
    // Keine Laufzeit in DB, selbst berechnen und in DB speichern
    // Berechnung: Betriebstunden jetzt - betriebstunden letzter eintrag (row-1 bzw. jahr-1 row12)
  }
  rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_runtimeBoiler" value="${runtimeBoiler}" disabled></td>`;

  // Betriebstunden Solarpumpe
  //...
  let operatingHoursSolarPump =
    (await DB.getValueFromDB(
      `apartment${apartment}_${year}_${section}Table${row}_operatingHoursSolarPump`,
    )) || "";
  rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_operatingHoursSolarPump" value="${operatingHoursSolarPump}"></td>`;

  // Laufzeit Solarpumpe
  //...
  let runtimeSolarPump =
    (await DB.getValueFromDB(
      `apartment${apartment}_${year}_${section}Table${row}_runtimeSolarPump`,
    )) || "";
  rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_runtimeSolarPump" value="${runtimeSolarPump}" disabled></td>`;

  // Solar Zählerstand
  //...
  let solarPumpMeterCount =
    (await DB.getValueFromDB(
      `apartment${apartment}_${year}_${section}Table${row}_solarPumpMeterCount`,
    )) || "";
  rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_solarPumpMeterCount" value="${solarPumpMeterCount}"></td>`;

  // Erzeugte Energie
  //...
  let producedEnergy =
    (await DB.getValueFromDB(
      `apartment${apartment}_${year}_${section}Table${row}_producedEnergy`,
    )) || "";
  rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_producedEnergy" value="${producedEnergy}" disabled></td>`;

  return rowString;
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
    // Tabelle und Canvas-Wrapper togglen
    await container.find(".tableWrapper").slideUp(300);
    icon.addClass("rotated");
  } else {
    await container.find(".tableWrapper").slideDown(300);
    icon.removeClass("rotated");
  }
}

async function getTankLevel(apartment, year, section, row, tank = null) {
  const key =
    tank === null
      ? `apartment${apartment}_${year}_${section}Table${row} _oilLevelInTanks`
      : `apartment${apartment}_${year}_${section}Table${row}_oilLevelInTank${tank} `;

  return await DB.getValueFromDB(key);
}

function calculateConsumption(oldLevel, newLevel) {
  if (newLevel === null || oldLevel === null) return 0;
  return Math.abs(newLevel - oldLevel);
}

/**
 *
 * @param {number} consumption
 * @param {number} fee
 * @param {number} meterFee
 * @returns {number} cost
 */
function calculateCost(consumption, fee, meterFee) {
  return consumption * fee + meterFee;
}
