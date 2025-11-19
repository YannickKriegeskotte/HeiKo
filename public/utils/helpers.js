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

   $('.annualTablesWrapper').prepend(`
       <div class="annualTableContainer" id="${year}_energyTableContainer">
        <div class="annualTableHeaderContainer" id="${year}_energyTableHeaderContainer">
          <img class="tableCollapseIcon" src="../assets/caret-down-solid-full.svg">
          <h2 id="${year}_energyTableHeaderH2">${year}</h2>
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


   for (let apartment = 1; apartment <= apartmentCount; apartment++) {
      // Apartmentname in DB?
      // Wenn ja, dann den nehmen, ansonsten fallback Wert
      let displayname;
      let aptname = await DB.getValueFromDB(`apartment${apartment}name`);
      if (aptname === null) {
         displayname = `Wohnung ${apartment}`;
      }
      else {
         displayname = aptname;
      }

      $(`#${year}_energyTableContainer thead tr`).append(`
                <th>Zählerstand ${displayname}</th>
                <th>Verbrauch ${displayname}</th>
                <th>Kosten ${displayname}</th>
        `);
   }


   for (let i = 1; i <= 12; i++) {
      let rowHTML = '<tr>';

      let date = await DB.getValueFromDB(`${year}_energyTableDate${i}`);
      if (date === null) {
         date = "";
      }
      rowHTML += `<td><input type="text" id="${year}_energyTableDate${i}" value="${date}"></td>`;

      for (let apartment = 1; apartment <= apartmentCount; apartment++) {
         let aptMeterCount;
         let aptConsumption;
         let aptCost;

         aptMeterCount = await DB.getValueFromDB(`${year}_energyTableMeterCount${i}_apartment${apartment}`);
         aptConsumption = await DB.getValueFromDB(`${year}_energyTableConsumption${i}_apartment${apartment}`);
         aptCost = await DB.getValueFromDB(`${year}_energyTableCost${i}_apartment${apartment}`);


         if (aptMeterCount === null) {
            // input mit leerem value schreiben
            aptMeterCount = "";
         }

         if (aptConsumption === null) {
            aptConsumption = "";
         }

         if (aptCost === null) {
            aptCost = "";
         }
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
   // Stabile Farb-Generierung
   // -------------------------------------------
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
               text: `Energieverbrauch ${year}`
            },
            tooltip: {
               mode: 'index',      // Tooltip folgt dem nächsten Punkt
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