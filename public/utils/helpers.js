import * as DB from "./database.js";

// =======================
// ===== Main Helper =====
// =======================

export async function sectionUpdate(sectionString, checked) {
   const precFeeID = `precipitationFee`;
   const precAreaID = `precipitationArea`;
   const oilID = 'oilPerCm';
   const tanksID = 'numberOfOilTanks';

   const root = document.documentElement;
   const textColor = getComputedStyle(root).getPropertyValue('--primaryTextColor').trim();
   const disabledTextColor = getComputedStyle(root).getPropertyValue('--disabledTextColor').trim();

   let input1 = (sectionString == 'water') ? precFeeID : oilID;
   let input2 = (sectionString == 'water') ? precAreaID : tanksID;
   let color1 = (checked) ? textColor : disabledTextColor;
   let color2 = (checked) ? disabledTextColor : textColor;

   $(`#${input1}, #${input2}`).prop(`disabled`, !checked);
   $(`#${input1}, #${input2}`).css(`color`, color1);
   $(`label[for="${input1}"], label[for="${input2}"]`).css(`color`, color1);
   const apartmentcount = await DB.getValueFromDB(`apartmentcount`);
   for (let i = 1; i <= apartmentcount; i++) {
      $(`#apartment${i}${input1}, #apartment${i}${input2}`).prop(`disabled`, checked);
      $(`#apartment${i}${input1}, #apartment${i}${input2}`).css(`color`, color2);
      $(`label[for="apartment${i}${input1}"], label[for="apartment${i}${input2}"]`).css(`color`, color2);
   }
}



export function getDate() {
   const date = new Date();
   return date;
}



export function appendApartmentEnergy(meterFee, meterNumber, electricityFee, apartmentName, i) {
   $('#energy').append(`
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



export function appendGeneralWater(generalPrecipitation, precipitationFee, precipitationArea) {
   $('#water').append(`
           <div class="apartmentContainer">
           <label class="preInputLabel" for="generalPrecipitation">Allgemeine Einstellungen für Versiegelte Fläche verwenden</label>
           <input type="checkbox" id="generalPrecipitation" name="generalPrecipitation" checked>
           <label class="preInputLabel" for="precipitationFee">Allgemeine Versiegeltungsgebühr</label>
           <input type="number" id="precipitationFee" name="precipitationFee" min="0" value="${precipitationFee}">
           <label class="postInputLabel" for="precipitationFee">€/m²</label>
           <label class="preInputLabel" for="precipitationArea">Allgemeine Versiegelte Fläche</label>
           <input type="number" id="precipitationArea" name="precipitationArea" min="0" value="${precipitationArea}">
           <label class="postInputLabel" for="precipitationArea">m²</label>
           </div>
       `);
   $('#generalPrecipitation').prop('checked', generalPrecipitation === true || generalPrecipitation === 'true');
}



export function appendApartmentWater(meterFee, meterNumber, waterFee, sewageFee, precipitationArea, precipitationFee, apartmentName, i) {
   $('#water').append(`
                <div class="apartment${i}container apartmentContainer">
                   <h3 id="apartment${i}name_water" class="apartmentHeader">${apartmentName}</h3>
                   <label class="preInputLabel" for="apartment${i}waterMeterNumber">Zählernummer</label>
                   <input type="number" id="apartment${i}waterMeterNumber" name="apartment${i}waterMeterNumber" value="${meterNumber}">
                   <label class="preInputLabel" for="apartment${i}waterMeterFee">Zählergebühren</label>
                   <input type="number" id="apartment${i}waterMeterFee" name="apartment${i}waterMeterFee" min="0" value="${meterFee}">
                   <label class="postInputLabel" for="apartment${i}meterFee">€</label>
                   <label class="preInputLabel" for="apartment${i}waterFee">Preis pro m³ Wasser</label>
                   <input type="number" id="apartment${i}waterFee" name="apartment${i}waterFee" min="0" value="${waterFee}">
                   <label class="postInputLabel" for="apartment${i}waterFee">€</label>
                   <label class="preInputLabel" for="apartment${i}sewageFee">Preis pro m³ Abwasser</label>
                   <input type="number" id="apartment${i}sewageFee" name="apartment${i}sewageFee" min="0" value="${sewageFee}">
                   <label class="postInputLabel" for="apartment${i}sewageFee">€</label>
                   <label class="preInputLabel" for="apartment${i}precipitationArea">Versiegelte Fläche</label>
                   <input type="number" id="apartment${i}precipitationArea" name="apartment${i}precipitationArea" min="0" value="${precipitationArea}">
                   <label class="postInputLabel" for="apartment${i}precipitationArea">m²</label>
                   <label class="preInputLabel" for="apartment${i}precipitationFee">Niederschlagsgebühr</label>
                   <input type="number" id="apartment${i}precipitationFee" name="apartment${i}precipitationFee" min="0" value="${precipitationFee}">
                   <label class="postInputLabel" for="apartment${i}precipitationFee">€</label>
                </div>
           `);
}



export function appendGeneralHeating(generalHeating, oilPerCm, numberOfOilTanks) {
   $('#heating').append(`
           <div class="apartmentContainer">
           <label class="preInputLabel" for="generalHeating">Allgemeine Einstellungen für alle Wohnungen verwenden</label>
           <input type="checkbox" id="generalHeating" name="generalHeating">
           <label class="preInputLabel" for="oilPerCm">1cm Tankfüllung entsprechen</label>
           <input type="text" id="oilPerCm" name="oilPerCm" min="0" value="${oilPerCm}">
           <label class="postInputLabel" for="oilPerCm">Liter Öl</label>
           <label class="preInputLabel" for="numberOfOilTanks">Anzahl der Öltanks</label>
           <input type="text" id="numberOfOilTanks" name="numberOfOilTanks" min="0" value="${numberOfOilTanks}">
           </div>
       `);
   $('#generalHeating').prop('checked', generalHeating);
}



export function appendApartmentHeating(oilPerCm, numberOfTanks, apartmentName, i) {
   $('#heating').append(`
                   <div class="apartment${i}container apartmentContainer">
                       <h3 id="apartment${i}name_heating" class="apartmentHeader">${apartmentName}</h3>
                       <label class="preInputLabel" for="apartment${i}oilPerCm">1cm Tankfüllung entsprechen</label>
                       <input type="text" id="apartment${i}oilPerCm" min="0" value="${oilPerCm}">
                       <label class="preInputLabel" for="apartment${i}numberOfOilTanks">Anzahl der Öltanks</label>
                       <input type="text" id="apartment${i}numberOfOilTanks" min="0" value="${numberOfTanks}">
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
   $('#databaseTable tbody').remove();
   $('#databaseTable').append('<tbody></tbody>');

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

      if (!dateA && !dateB) return 0;     // beide ohne Datum
      if (!dateA) return 1;              // ohne Datum → älter
      if (!dateB) return -1;

      return dateB - dateA; // neueste zuerst
   });
   return sorted;
}




export function renderDatabaseTable(sortedDatabaseData) {
   for (let i = 0; i < sortedDatabaseData.length; i++) {
      const key = sortedDatabaseData[i].key;
      const value = sortedDatabaseData[i].value

      // console.log("key in main", key);

      $('#databaseTable tbody').append(`
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






// ===========================
// ===== Energy Helper =====
// ===========================

export async function createEnergyTable(year) {
    const apartmentCount = await DB.getValueFromDB('apartmentcount');

    // Container & Tabelle erstellen
    $('.annualTablesWrapper').prepend(`
        <div class="annualTableContainer" id="${year}_energyTableContainer">
            <div class="annualTableHeaderContainer" id="${year}_energyTableHeaderContainer">
                <img class="tableCollapseIcon" src="../assets/caret-down-solid-full.svg">
                <input class="tableHeaderInput" type="number" id="${year}_energyTableHeaderH2" value="${year}">
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

    // Kopfzeilen für jedes Apartment erstellen
    for (let apartment = 1; apartment <= apartmentCount; apartment++) {
        const aptName = await DB.getValueFromDB(`apartment${apartment}name`) || `Wohnung ${apartment}`;
        $(`#${year}_energyTableContainer thead tr`).append(`
            <th>Zählerstand ${aptName}</th>
            <th>Verbrauch ${aptName}</th>
            <th>Kosten ${aptName}</th>
        `);
    }

    // Tabelle Zeile für Zeile füllen (Monat 1–12)
    for (let i = 1; i <= 12; i++) {
        let rowHTML = '<tr>';

        // Datum abrufen oder leer lassen
        let date = await DB.getValueFromDB(`${year}_energyTableDate${i}`) || "";
        rowHTML += `<td><input type="text" id="${year}_energyTableDate${i}" value="${date}"></td>`;

        for (let apartment = 1; apartment <= apartmentCount; apartment++) {
            const aptName = await DB.getValueFromDB(`apartment${apartment}name`) || `Wohnung ${apartment}`;

            // Zählerstand, Verbrauch und Kosten aus DB abrufen
            let aptMeterCount = await DB.getValueFromDB(`${year}_energyTableMeterCount${i}_apartment${apartment}`);
            let aptConsumption = await DB.getValueFromDB(`${year}_energyTableConsumption${i}_apartment${apartment}`);
            let aptCost = await DB.getValueFromDB(`${year}_energyTableCost${i}_apartment${apartment}`);

            if (aptMeterCount === null) aptMeterCount = "";

            // Verbrauch automatisch berechnen, falls leer
            if (aptConsumption === null) {
                const prevMeter = i === 1 
                    ? 0 
                    : Number(await DB.getValueFromDB(`${year}_energyTableMeterCount${i-1}_apartment${apartment}`)) || 0;
                const currentMeter = Number(aptMeterCount) || 0;
                aptConsumption = Math.max(currentMeter - prevMeter, 0);
                await DB.saveValueToDB(`${year}_energyTableConsumption${i}_apartment${apartment}`, aptConsumption);
            }

            // Kosten automatisch berechnen, falls leer (hier optional auf 0)
            if (aptCost === null) {
                aptCost = 0;
                await DB.saveValueToDB(`${year}_energyTableCost${i}_apartment${apartment}`, aptCost);
            }

            // Inputs in Tabelle einfügen
            rowHTML += `<td><input type="text" id="${year}_energyTableMeterCount${i}_apartment${apartment}" value="${aptMeterCount}"></td>`;
            rowHTML += `<td><input type="text" id="${year}_energyTableConsumption${i}_apartment${apartment}" value="${aptConsumption}"></td>`;
            rowHTML += `<td><input type="text" id="${year}_energyTableCost${i}_apartment${apartment}" value="${aptCost}"></td>`;
        }

        rowHTML += '</tr>';
        $(`#${year}_energyTableContainer tbody`).append(rowHTML);
    }
}

export async function createEnergyGraph(year) {

   // Canvas einfügen, falls noch nicht vorhanden
   if (!$(`#${year}_energyGraph`).length) {
      $(`#${year}_energyTableContainer table`).after(`
            <div class="canvasWrapper">
            <canvas id="${year}_energyGraph" width="400" height="200"></canvas>
            </div>
        `);
   }

   const ctx = document.getElementById(`${year}_energyGraph`);
   const datesArray = [];

   // Datumswerte sammeln
   $(`#${year}_energyTableContainer tbody tr`).each(function () {
      const dateValue = $(this).find('td:first-child input').val();
      datesArray.push(dateValue);
   });

   // -------------------------------------------

   const datasets = [];
   const apartmentCount = await DB.getValueFromDB('apartmentcount');

   for (let apartment = 1; apartment <= apartmentCount; apartment++) {

      const apartmentName =
         await DB.getValueFromDB(`apartment${apartment}name`) || `Wohnung ${apartment}`;

      const types = ['Zählerstand', 'Verbrauch', 'Kosten'];

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
               if (i === meta.maxIndex) return 'red';
               if (i === meta.minIndex) return 'blue';
               return stableColorFor(label);
            }),
            _minIndex: meta.minIndex,
            _maxIndex: meta.maxIndex,
            _minValue: meta.minValue,
            _maxValue: meta.maxValue
         });
      }
   }

   // Chart erstellen
   new Chart(ctx, {
      type: 'line',
      data: {
         labels: datesArray,
         datasets: datasets
      },
      options: {
         responsive: true,
         interaction: {
            mode: 'index',
            intersect: false
         },
         plugins: {
            title: {
               display: true,
               text: `${year}`
            },
            tooltip: {
               mode: 'nearest',      // Tooltip folgt dem nächsten Punkt
               intersect: false,      // Tooltip erscheint nur, wenn Cursor über dem Punkt ist
               position: 'nearest',  // Tooltip direkt am Punkt
            },
            legend: {
               labels: {
                  font: {
                     size: 16 // etwas größere Schrift
                  },
                  usePointStyle: true,
                  pointStyle: "line"
               },
               onHover(event, item) {
                  event.native.target.style.cursor = "pointer";
               },
               onLeave(event, item) {
                  event.native.target.style.cursor = "default";
               }
            }
         },
         scales: {
            y: {
               beginAtZero: true
            }
         }
      }
   });
}

export async function createEnergyOverviewGraph() {

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
      .filter(entry => entry.key.includes("_energyTableDate12"))
      .map(entry => entry.value);

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
         Cost: []
      };
   }


   // -------------------------------------------
   // 4. Für jedes Apartment: alle Werte für jedes Datum holen
   // -------------------------------------------
   for (let apartment = 1; apartment <= apartmentCount; apartment++) {

      const apartmentEntries = allEntries.filter(entry =>
         entry.key.includes(`_apartment${apartment}`)
      );

      const meterCountEntries = apartmentEntries.filter(entry =>
         entry.key.includes("MeterCount")
      );
      const consumptionEntries = apartmentEntries.filter(entry =>
         entry.key.includes("Consumption")
      );
      const costEntries = apartmentEntries.filter(entry =>
         entry.key.includes("Cost")
      );

      // Für jedes Datum den passenden Key finden
      for (const date of xAxisDates) {

         // Key, der zu diesem Datum passt
         const year = date.slice(-4);
         console.log("date, year", date, year);

         const mcEntry = meterCountEntries.find(entry => entry.key.startsWith(`${year}_energyTableMeterCount`));
         const consEntry = consumptionEntries.find(entry => entry.key.startsWith(`${year}_energyTableConsumption`));
         const costEntry = costEntries.find(entry => entry.key.startsWith(`${year}_energyTableCost`));

         console.log("meterCountEntries", meterCountEntries);
         console.log("mcEntry", mcEntry);

         overviewData[apartment].MeterCount.push(mcEntry ? Number(mcEntry.value) : 0);
         overviewData[apartment].Consumption.push(consEntry ? Number(consEntry.value) : 0);
         overviewData[apartment].Cost.push(costEntry ? Number(costEntry.value) : 0);
      }
   }


   // -------------------------------------------
   // 5. Datasets bauen
   // -------------------------------------------
   const datasets = [];
   const typeLabels = {
      MeterCount: "Zählerstand",
      Consumption: "Verbrauch",
      Cost: "Kosten"
   };

   for (let apartment = 1; apartment <= apartmentCount; apartment++) {
      const apartmentName = await DB.getValueFromDB(`apartment${apartment}name`) || `Wohnung ${apartment}`;

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
               return (i === minIndex || i === maxIndex) ? 6 : 3;
            },
            pointBorderWidth(ctx) {
               const i = ctx.dataIndex;
               return (i === minIndex || i === maxIndex) ? 3 : 1;
            },
            pointBackgroundColor(ctx) {
               const i = ctx.dataIndex;
               if (i === minIndex) return "blue";
               if (i === maxIndex) return "red";
               return color;
            }
         });
      }
   }

   console.log("Overview Graph Datasets:", datasets);

   // -------------------------------------------
   // 6. Chart erstellen
   // -------------------------------------------
   new Chart(ctx, {
      type: "line",
      data: {
         labels: xAxisDates,
         datasets: datasets
      },
      options: {
         responsive: true,
         scales: {
            y: { beginAtZero: false }
         },
         interaction: {
            mode: "nearest",
            intersect: false
         },
         plugins: {
            tooltip: {
               mode: "nearest",
               intersect: false
            },
            legend: {
               labels: {
                  font: { size: 16 },
                  usePointStyle: true,
                  pointStyle: "line"
               },
               onHover(event) { event.native.target.style.cursor = "pointer"; },
               onLeave(event) { event.native.target.style.cursor = "default"; }
            }
         }
      }
   });
}






function getMinMax(data) {
   const minValue = Math.min(...data);
   const maxValue = Math.max(...data);
   return {
      minValue,
      maxValue,
      minIndex: data.indexOf(minValue),
      maxIndex: data.indexOf(maxValue)
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
   const hueIndex = hash % 12;      // 12 fest definierte Farbtöne
   const hue = hueIndex * 30;       // 0°, 30°, 60° ... 330°
   const sat = 70;
   const light = 50;
   return `hsl(${hue}, ${sat}%, ${light}%)`;
}



