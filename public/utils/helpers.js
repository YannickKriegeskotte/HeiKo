import * as DB from "./database.js";

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
  // Anzahl der Wohnungen
  apartmentCount = await DB.getValueFromDB("apartmentcount");

  // Tabellencontainer & Tabellenkopfzeile erzeugen
  $(".annualTablesWrapper").prepend(`
        <div class="annualTableContainer" id="${year}_${section}TableContainer">
            <div class="annualTableHeaderContainer" id="${year}_${section}TableHeaderContainer">
                <img class="tableCollapseIcon" src="../assets/caret-down-solid-full.svg">
                <input class="tableHeaderInput" type="number" id="${year}_${section}TableHeaderH2" value="${year}">
                <img class="tableSettingsIcon" src="../assets/sliders-solid-full.svg">
            </div>
            <div class="tableWrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Datum</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            </div>
        </div>    
    `);

  // Tabellenkopfzeile je nach Sektion für jede Wohnung füllen:

  // Je nach Sektion andere Überschriften
  switch (section) {
    // Strom Sektion
    case "energy":
      for (let apartment = 1; apartment <= apartmentCount; apartment++) {
        // Wohnungsname, falls in DB vorhanden, sonst Standardname
        const apartmentName =
          (await DB.getValueFromDB(`apartment${apartment}name`)) ||
          `Wohnung ${apartment}`;
        $(`#${year}_${section}TableContainer thead tr`).append(`
            <th>Zählerstand ${apartmentName}</th>
            <th>Verbrauch ${apartmentName}</th>
            <th>Kosten ${apartmentName}</th>
        `);
      }
      break;

    // Wasser Sektion
    case "water":
      for (let apartment = 1; apartment <= apartmentCount; apartment++) {
        // Wohnungsname, falls in DB vorhanden, sonst Standardname
        const apartmentName =
          (await DB.getValueFromDB(`apartment${apartment}name`)) ||
          `Wohnung ${apartment}`;
        // Hat Wohnung Warmwasserzähler?
        let hasWarmWaterMeter = await DB.getValueFromDB(`apartment${apartment}IsWarmWaterMeterExisting`);
        hasWarmWaterMeter = (hasWarmWaterMeter == "checked") ? true : false;

        // Hat Wohnung Kaltwasserzähler?
        let hasColdWaterMeter = await DB.getValueFromDB(`apartment${apartment}IsColdWaterMeterExisting`);
        hasColdWaterMeter = (hasColdWaterMeter == "checked") ? true : false;

        // Falls beides nein, was ist die Gesamtzählernummer
        let mainWaterMeterNumber;
        if (!hasWarmWaterMeter && !hasColdWaterMeter) {
          mainWaterMeterNumber = await DB.getNewestValueFromDB('mainWaterMeterNumber') || null;
        }


        // Gibt es andere Warmwasser Zählernummern, die ebenfalls auf dem Gesamtzähler laufen?
        let allExtraWaterMeters = await DB.getAllKeysContaining('IsWarmWaterMeterExisting');
        let filteredExtraWaterMeters = allExtraWaterMeters.filter(key => key !== `apartment${apartment}IsWarmWaterMeterExisting`);
        // Gibt es andere Kaltwasser Zählernummern, die ebenfalls auf dem Gesamtzähler laufen?
        //...

        // OPTIONALES:
        // Druck Heizung angeben aktiviert?
        //...
        // Druck Wasser angeben aktiviert?
        //...
        // Solarthermie aktiviert?
        //...
        // Druck Solar angeben aktiviert?
        //...
        if (apartment == 1) {
          $(`#${year}_${section}TableContainer thead tr`).append(`
          <th>Druck Heizung</th>
          <th>Druck Wasser</th>
          <th>Druck Solar</th>
          <th>Zählerstand Gesamt</th>
          <th>Verbrauch Gesamt</th>h>
        `);
        }

        if (hasWarmWaterMeter) {
          $(`#${year}_${section}TableContainer thead tr`).append(`
          <th>Zählerstand Warm ${apartmentName}</th>
          <th>Verbrauch Warm ${apartmentName}</th>
          `);
        }
        if (hasColdWaterMeter) {
          $(`#${year}_${section}TableContainer thead tr`).append(`
          <th>Zählerstand Kalt ${apartmentName}</th>
          <th>Verbrauch Kalt ${apartmentName}</th>
          `);
        }

        $(`#${year}_${section}TableContainer thead tr`).append(`
            <th>Kosten Wasser ${apartmentName}</th>
            <th>Kosten Abwasser ${apartmentName}</th>
        `);



      }
      break;

    // Heizung Sektion
    case "heating":

      // Wieviele Öltanks?
      let areTanksConnected = await DB.getValueFromDB('areOilTanksConnected');
      areTanksConnected = (areTanksConnected == "checked") ? true : false;

      if (!areTanksConnected) {
        let numberOfOilTanks = await DB.getNewestValueFromDB('numberOfOilTanks');
        if (numberOfOilTanks !== null) {
          for (let tank = 1; tank <= numberOfOilTanks; tank++) {
            $(`#${year}_${section}TableContainer thead tr`).append(`
                <th>Ölstand Tank ${tank}</th>
            `);
          }
        }
      }
      else {
        $(`#${year}_${section}TableContainer thead tr`).append(`
            <th>Ölstand</th>
        `);
      }
      $(`#${year}_${section}TableContainer thead tr`).append(`
            <th>Verbrauch Öl</th>
            <th>Öl Kosten</th>
            <th>Betriebstunden Heizung</th>
            <th>Laufzeit Heizung</th>
            <th>Betriebstunden Solarpumpe</th>
            <th>Laufzeit Solarpumpe</th>
            <th>Solar Zählerstand</th>
            <th>Erzeugte Energie</th>
        `);


      // OPTIONAL:
      // Name der Öltanks? Falls nicht vorhanden, Standardwert (Öltank 1, Öltank 2,...)
      break;
  }


  // Tabellenkörper füllen:

  // 12 Zeilen maximal
  for (let row = 1; row <= 12; row++) {

    // HTML Zeile beginnen
    let rowString = "<tr>";
    // Jede Zeile hat folgende spalten:

    // Datum
    let rowDate = (await DB.getValueFromDB(`${year}_${section}TableDate${row}`)) || "";
    rowString += `<td><input type="text" id="${year}_${section}TableDate${row}" value="${rowDate}"></td>`;

    for (let apartment = 1; apartment <= apartmentCount; apartment++) {

      // Sektionsspezifisches
      switch (section) {

        // Strom Sektion
        case "energy":
          // Zählerstand pro Wohnung

          let meterCount = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row}_meterCount`) || "";
          let consumption = 0;

          if (meterCount !== "") {
            let oldMeterCount = 0;

            if (row == 1) {
              let checkRow = 12;
              while (checkRow > 0 && oldMeterCount === 0) {
                oldMeterCount = await DB.getValueFromDB(`apartment${apartment}_${year - 1}_${section}Table${checkRow}_meterCount`) || 0;
                checkRow--;
              }
              // Wenn im Vorjahr kein Zählerstand gefunden wird, bleibt consumption = 0
              if (oldMeterCount === 0) {
                consumption = 0;
              } else {
                consumption = meterCount - oldMeterCount;
              }
            } else {
              oldMeterCount = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row - 1}_meterCount`) || 0;
              consumption = meterCount - oldMeterCount;
            }
          } else {
            consumption = 0;
          }


          // verbrauch vorhanden? ja, gut. nein, keine kosten, weil kein verbauch.
          // zählergebühren vorhanden? ja, gut. nein, mit 0 weiter rechnen
          // kwhpreis vorhanden? ja, gut. nein, keine kosten, weil kein kwh preis.
          // berechnung: (verbauch * kwhpreis) + (zählergebühren / 12) = kosten
          let cost = 0;
          if (consumption > 0) {
            let electricityFee = await DB.getNewestValueFromDB(`apartment${apartment}electricityFee`) || 0;
            if (electricityFee != 0) {
              let electricityMeterFee = await DB.getNewestValueFromDB(`apartment${apartment}electricityMeterFee`) || 0;
              cost = (consumption * electricityFee) + (electricityMeterFee / 12);
              cost = parseFloat(cost.toFixed(2));
            }
          }

          rowString += `
          <td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_meterCount" value="${meterCount}"></td>
          <td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_consumption" value="${consumption}"></td>
          <td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_cost" value="${cost}"></td>
          `;

          break;

        // Wasser Sektion
        case "water":

          if (apartment == 1) {
            // Druck Heizung
            //...
            let heatingPressure = 0;
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_heatingPressure" value="${heatingPressure}"></td>`;
            // Druck Wasser
            //...
            let waterPressure = 0;
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_waterPressure" value="${waterPressure}"></td>`;
            // Druck Solar
            //...
            let solarPressure = 0;
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_solarPressure" value="${solarPressure}"></td>`;

            // Zählerstand Gesamtwasser
            let mainWaterMeterCount = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row}_mainWaterMeterCount`) || '000';
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_mainWaterMeterCount" value="${mainWaterMeterCount}"></td>`;

            // Verbrauch Gesamtwasser
            //...
            let mainWaterConsumption = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row}_mainWaterConsumption`) || '111';
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_mainWaterConsumption" value="${mainWaterConsumption}"></td>`;
          }


          let hasWarmWaterMeter = await DB.getValueFromDB(`apartment${apartment}IsWarmWaterMeterExisting`);
          hasWarmWaterMeter = (hasWarmWaterMeter == "checked") ? true : false;

          // Hat Wohnung Kaltwasserzähler?
          let hasColdWaterMeter = await DB.getValueFromDB(`apartment${apartment}IsColdWaterMeterExisting`);
          hasColdWaterMeter = (hasColdWaterMeter == "checked") ? true : false;

          // Falls beides nein, was ist die Gesamtzählernummer
          let mainWaterMeterNumber = await DB.getNewestValueFromDB('mainWaterMeterNumber') || null;



          // Zählerstand Warmwasser pro Wohnung (falls vorhanden)
          if (hasWarmWaterMeter) {
            let warmWaterMeterCount = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row}_warmWaterMeterCount`) || '222';
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_warmWaterMeterCount" value="${warmWaterMeterCount}"></td>`;

            // Verbauch Warmwasser pro Wohnung
            //...
            let warmWaterConsumption = 333;
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_warmWaterConsumption" value="${warmWaterConsumption}"></td>`;
          }


          // Zählerstand Kaltwasser pro Wohnung (falls vorhanden)
          console.log("hasColdWaterMeter", hasColdWaterMeter);
          if (hasColdWaterMeter) {
            let coldWaterMeterCount = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row}_coldWaterMeterCount`) || '444';
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_coldWaterMeterCount" value="${coldWaterMeterCount}"></td>`;

            // Verbauch Kaltwasser pro Wohnung
            //...
            let coldWaterConsumption = 555;
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_coldWaterConsumption" value="${coldWaterConsumption}"></td>`;
          }

          // Kosten Wasser
          let waterCost = 666
          rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_waterCost" value="${waterCost}"></td>`;

          // Kosten Abwasser
          let sewageCost = 666
          rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_sewageCost" value="${sewageCost}"></td>`;



          break;

        // Heizung Sektion
        case "heating":

          if (apartment == 1) {
            // Wieviele Öltanks?
            let areTanksConnected = await DB.getValueFromDB('areOilTanksConnected');
            areTanksConnected = (areTanksConnected == "checked") ? true : false;

            if (!areTanksConnected) {
              let numberOfOilTanks = await DB.getNewestValueFromDB('numberOfOilTanks');
              if (numberOfOilTanks !== null) {
                for (let tank = 1; tank <= numberOfOilTanks; tank++) {
                  let oilLevelInTank = 777;
                  rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_oilLevelInTank${tank}" value="${oilLevelInTank}"></td>`;
                }
              }
            }
            else {
              let oilLevelInTanks = 888;
              rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_oilLevelInTanks" value="${oilLevelInTanks}"></td>`;
            }

            // Verbauch Öl
            let oilConsumption = 999;
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_oilConsumption" value="${oilConsumption}"></td>`;

            // Öl Kosten 
            //...
            let oilCost = 123;
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_oilCost" value="${oilCost}"></td>`;

            // Betriebstunden Heizung 
            //...
            let operatingHoursBoiler = 234;
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_operatingHoursBoiler" value="${operatingHoursBoiler}"></td>`;

            // Laufzeit Heizung 
            //...
            let runtimeBoiler = 345;
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_runtimeBoiler" value="${runtimeBoiler}"></td>`;

            // Betriebstunden Solarpumpe 
            //...
            let operatingHoursSolarPump = 456;
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_operatingHoursSolarPump" value="${operatingHoursSolarPump}"></td>`;

            // Laufzeit Solarpumpe 
            //...
            let runtimeSolarPump = 567;
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_runtimeSolarPump" value="${runtimeSolarPump}"></td>`;

            // Solar Zählerstand 
            //...
            let solarPumpMeterCount = 678;
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_solarPumpMeterCount" value="${solarPumpMeterCount}"></td>`;

            // Erzeugte Energie 
            //...
            let producedEnergy = 789;
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_producedEnergy" value="${producedEnergy}"></td>`;

          }
          break;
      }
    }

    // HTML Zeile beenden
    rowString += "</tr>";

    $(`#${year}_${section}TableContainer tbody`).append(rowString);
  }






  // prüfen, ob collaped DB eintrag, wenn ja
  const tableCollapsed = await DB.getValueFromDB(
    `${year}_${section}TableCollapsed`
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





// kann bleiben, hat keine DB abfragen, liest aus HTML
export function createEnergyGraphDatesArray(section, year) {
  const datesArray = [];

  // Datumswerte sammeln
  $(`#${year}_energyTableContainer tbody tr`).each(function () {
    const dateValue = $(this).find("td:first-child input").val();
    datesArray.push(dateValue);
  });

  return datesArray;
}

export async function createEnergyGraphDatasets(section, year) {
  const datasets = [];
  const apartmentCount = await DB.getValueFromDB("apartmentcount");

  for (let apartment = 1; apartment <= apartmentCount; apartment++) {
    const apartmentName =
      (await DB.getValueFromDB(`apartment${apartment}name`)) ||
      `Wohnung ${apartment}`;

    const types = ["Zählerstand", "Verbrauch", "Kosten"];

    for (let typeIndex = 0; typeIndex < types.length; typeIndex++) {
      const type = types[typeIndex];
      const dataArray = [];

      // Spaltenindex berechnen
      const columnIndex = 1 + (apartment - 1) * 3 + typeIndex;

      // Werte aller 12 Zeilen sammeln
      $(`#${year}_energyTableContainer tbody tr`).each(function () {
        const dataValue = $(this).find(`td:eq(${columnIndex}) input`).val();
        dataArray.push(Number(dataValue) || 0);
      });

      // Min/Max bestimmen
      const meta = getMinMax(dataArray);

      const label = `${type} ${apartmentName}`;

      datasets.push({
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
      });
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

export function renderEnergyGraph(section, year, datesArray, datasets) {
  const ctx = document.getElementById(`${year}_energyGraph`);

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

export async function createEnergyGraph(section, year) {
  // Canvas einfügen, falls noch nicht vorhanden
  if (!$(`#${year}_energyGraph`).length) {
    $(`#${year}_energyTableContainer table`).after(`
            <div class="canvasWrapper">
            <canvas id="${year}_energyGraph" width="400" height="200"></canvas>
            </div>
        `);
  }
  const datasets = await createEnergyGraphDatasets(section, year);
  const datesArray = createEnergyGraphDatesArray(section, year);
  renderEnergyGraph(section, year, datesArray, datasets);
}

export async function createEnergyOverviewGraph(section) {
  // Canvas einfügen, falls nicht vorhanden
  if (!$("#energyOverviewGraph").length) {
    $("#overviewContainer h2").after(`
            <div class="canvasWrapper">
                <canvas id="energyOverviewGraph" width="400" height="200"></canvas>
            </div>
        `);
  }

  const ctx = document.getElementById("energyOverviewGraph");

  // -------------------------------------------
  // 1. Alle DB-Entries holen (key + value)
  // -------------------------------------------
  const allEntries = await DB.getAllKeysContaining("_energyTable");

  // -------------------------------------------
  // 2. X-Achse bestimmen (alle Date12-Werte)
  // -------------------------------------------
  const rawDates = allEntries
    .filter((entry) => entry.key.includes("_energyTableDate12"))
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
          entry.key.startsWith(`${year}_energyTableMeterCount`)
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
          entry.key.startsWith(`${year}_energyTableConsumption`)
        )
        .sort((a, b) => {
          const aIndex = Number(a.key.match(/Consumption(\d+)_apartment/)[1]);
          const bIndex = Number(b.key.match(/Consumption(\d+)_apartment/)[1]);
          return aIndex - bIndex;
        })
        .pop();

      // Cost: dasselbe
      const costEntry = costEntries
        .filter((entry) => entry.key.startsWith(`${year}_energyTableCost`))
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
