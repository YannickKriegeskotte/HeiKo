import * as DB from "./database.js";

/**
 * Erzeugt eine Jahrestabelle für die passende Seite (section) und das passende Jahr (year).
 * Füllt außerdem noch die Daten Arrays für den dazugehörigen Graphen, um code Dopplung zu vermeiden.
 * @param {String} section 
 * @param {String} year 
 * @returns {HTML}
 */
export async function createSectionTable(section, year) {
  // Anzahl der Wohnungen
  let apartmentCount = await DB.getValueFromDB("apartmentcount");

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

          let mainWaterConsumption = 0;
          if (apartment == 1) {

            // Druck Heizung
            let heatingPressure = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row}_heatingPressure`) || "";
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_heatingPressure" value="${heatingPressure}"></td>`;

            // Druck Wasser
            let waterPressure = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row}_waterPressure`) || "";
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_waterPressure" value="${waterPressure}"></td>`;

            // Druck Solar
            let solarPressure = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row}_solarPressure`) || "";
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_solarPressure" value="${solarPressure}"></td>`;




            // Hauptwasserzähler
            let mainWaterMeterCount = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row}_mainWaterMeterCount`) || "";
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_mainWaterMeterCount" value="${mainWaterMeterCount}"></td>`;

            // Hauptverbrauch (nur verwendet falls keine Einzelzähler)

            if (row == 1) {
              let oldMainWaterMeterCount = await DB.getValueFromDB(`apartment${apartment}_${year - 1}_${section}Table${12}_mainWaterMeterCount`) || "";
              if (oldMainWaterMeterCount == "") {
                // Erster Zählerstand, kein verbrauch. Nix tun
              }
              else {
                if (!(mainWaterMeterCount == "")) {
                  mainWaterConsumption = mainWaterMeterCount - oldMainWaterMeterCount;
                }
              }
            }
            else {
              let oldMainWaterMeterCount = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row - 1}_mainWaterMeterCount`) || "";
              if (!(mainWaterMeterCount == "")) {
                mainWaterConsumption = mainWaterMeterCount - oldMainWaterMeterCount;
              }
            }
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_mainWaterConsumption" value="${mainWaterConsumption}"></td>`;
          }

          let hasWarmWaterMeter = (await DB.getValueFromDB(`apartment${apartment}IsWarmWaterMeterExisting`)) == "checked";
          let hasColdWaterMeter = (await DB.getValueFromDB(`apartment${apartment}IsColdWaterMeterExisting`)) == "checked";

          //
          // ====================================
          //   Verbrauchsberechnung Warmwasser
          // ====================================
          //
          let warmWaterMeterCount = "";
          let warmWaterConsumption = 0;

          if (hasWarmWaterMeter) {
            warmWaterMeterCount = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row}_warmWaterMeterCount`) || "";

            if (warmWaterMeterCount !== "") {
              let oldWarm = "";

              if (row == 1) {
                // Vorjahr suchen
                let checkRow = 12;
                while (checkRow > 0 && oldWarm === "") {
                  oldWarm = await DB.getValueFromDB(`apartment${apartment}_${year - 1}_${section}Table${checkRow}_warmWaterMeterCount`) || "";
                  checkRow--;
                }
              } else {
                oldWarm = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row - 1}_warmWaterMeterCount`) || "";
              }

              if (oldWarm !== "") {
                warmWaterConsumption = warmWaterMeterCount - oldWarm;
              } else {
                warmWaterConsumption = 0; // erster Zählerstand, kein Verbrauch
              }
            }

            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_warmWaterMeterCount" value="${warmWaterMeterCount}"></td>`;
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_warmWaterConsumption" value="${warmWaterConsumption}"></td>`;
          }

          //
          // ====================================
          //   Verbrauchsberechnung Kaltwasser
          // ====================================
          //
          let coldWaterMeterCount = "";
          let coldWaterConsumption = 0;

          if (hasColdWaterMeter) {
            coldWaterMeterCount = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row}_coldWaterMeterCount`) || "";

            if (coldWaterMeterCount !== "") {
              let oldCold = "";

              if (row == 1) {
                // Vorjahr suchen
                let checkRow = 12;
                while (checkRow > 0 && oldCold === "") {
                  oldCold = await DB.getValueFromDB(`apartment${apartment}_${year - 1}_${section}Table${checkRow}_coldWaterMeterCount`) || "";
                  checkRow--;
                }
              } else {
                oldCold = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row - 1}_coldWaterMeterCount`) || "";
              }

              if (oldCold !== "") {
                coldWaterConsumption = coldWaterMeterCount - oldCold;
              } else {
                coldWaterConsumption = 0; // erster Zählerstand, kein Verbrauch
              }
            }

            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_coldWaterMeterCount" value="${coldWaterMeterCount}"></td>`;
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_coldWaterConsumption" value="${coldWaterConsumption}"></td>`;
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
            let coldWaterMeterFee = await DB.getNewestValueFromDB(`apartment${apartment}coldWaterMeterFee`) || 0;
            let warmWaterMeterFee = await DB.getNewestValueFromDB(`apartment${apartment}warmWaterMeterFee`) || 0;
            let waterCostPerLiter = await DB.getNewestValueFromDB(`apartment${apartment}costPerLiterWater`) || 0;;
            let sewageCostPerLiter = await DB.getNewestValueFromDB(`apartment${apartment}costPerLiterSewage`) || 0;;

            let totalWaterCost = ((totalConsumption * waterCostPerLiter) + (coldWaterMeterFee / 12) + (warmWaterMeterFee / 12)).toFixed(2);
            let totalSewageCost = ((totalConsumption * sewageCostPerLiter) + (coldWaterMeterFee / 12) + (warmWaterMeterFee / 12)).toFixed(2);

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
                  otherHasColdWaterMeter = await DB.getValueFromDB(`apartment${2}IsColdWaterMeterExisting`);
                  otherHasWarmWaterMeter = await DB.getValueFromDB(`apartment${2}IsWarmWaterMeterExisting`);

                  if (otherHasColdWaterMeter && otherHasWarmWaterMeter) {
                    totalConsumption = coldWaterConsumption + warmWaterConsumption;
                    coldWaterMeterFee = await DB.getNewestValueFromDB(`apartment${2}coldWaterMeterFee`) || 0;
                    warmWaterMeterFee = await DB.getNewestValueFromDB(`apartment${2}warmWaterMeterFee`) || 0;
                    waterCostPerLiter = await DB.getNewestValueFromDB(`apartment${2}costPerLiterWater`) || 0;;
                    sewageCostPerLiter = await DB.getNewestValueFromDB(`apartment${2}costPerLiterSewage`) || 0;;

                    totalWaterCost = ((totalConsumption * waterCostPerLiter) + (coldWaterMeterFee / 12) + (warmWaterMeterFee / 12)).toFixed(2);
                    totalSewageCost = ((totalConsumption * sewageCostPerLiter) + (coldWaterMeterFee / 12) + (warmWaterMeterFee / 12)).toFixed(2);

                    waterCost = totalWaterCost;
                    sewageCost = totalSewageCost;

                    
                  }
                  break;
                case 2:
                  otherHasColdWaterMeter = await DB.getValueFromDB(`apartment${1}IsColdWaterMeterExisting`);
                  otherHasWarmWaterMeter = await DB.getValueFromDB(`apartment${1}IsWarmWaterMeterExisting`);

                  if (otherHasColdWaterMeter && otherHasWarmWaterMeter) {
                    totalConsumption = coldWaterConsumption + warmWaterConsumption;
                    coldWaterMeterFee = await DB.getNewestValueFromDB(`apartment${1}coldWaterMeterFee`) || 0;
                    warmWaterMeterFee = await DB.getNewestValueFromDB(`apartment${1}warmWaterMeterFee`) || 0;
                    waterCostPerLiter = await DB.getNewestValueFromDB(`apartment${1}costPerLiterWater`) || 0;;
                    sewageCostPerLiter = await DB.getNewestValueFromDB(`apartment${1}costPerLiterSewage`) || 0;;

                    totalWaterCost = ((totalConsumption * waterCostPerLiter) + (coldWaterMeterFee / 12) + (warmWaterMeterFee / 12)).toFixed(2);
                    totalSewageCost = ((totalConsumption * sewageCostPerLiter) + (coldWaterMeterFee / 12) + (warmWaterMeterFee / 12)).toFixed(2);

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





          rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_waterCost" value="${waterCost}"></td>`;
          rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_sewageCost" value="${sewageCost}"></td>`;

          break;


        // Heizung Sektion
        case "heating":

          if (apartment == 1) {
            console.log("heating apartment 1");
            // Wieviele Öltanks?
            let areTanksConnected = await DB.getValueFromDB('areOilTanksConnected');
            areTanksConnected = (areTanksConnected == "checked") ? true : false;

            if (!areTanksConnected) {
              console.log("tanks not connected");

              let numberOfOilTanks = await DB.getNewestValueFromDB('numberOfOilTanks');
              if (numberOfOilTanks !== null) {
                for (let tank = 1; tank <= numberOfOilTanks; tank++) {
                  let oilLevelInTank = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row}_oilLevelInTank${tank}`) || '';
                  rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_oilLevelInTank${tank}" value="${oilLevelInTank}"></td>`;
                }
              }
            }
            else {
              console.log("tanks connected");
              let oilLevelInTanks = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row}_oilLevelInTanks`) || '';
              rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_oilLevelInTanks" value="${oilLevelInTanks}"></td>`;
            }

            // Verbauch Öl
            let oilConsumption = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row}_oilConsumption`);
            console.log("oilConsumption (beginning)", oilConsumption);

            if (oilConsumption === null) {
              console.log("no oil consumption for row", row, "in DB");
              if (areTanksConnected) {

                console.log("tanks connected (again)");
                const oldLevel = row === 1
                  ? await getTankLevel(apartment, year - 1, section, 12)
                  : await getTankLevel(apartment, year, section, row - 1);

                const newLevel = await getTankLevel(year, row);

                oilConsumption = calculateConsumption(oldLevel, newLevel);

                console.log("oldLevel", oldLevel, "newLevel", newLevel, "oilConsumption", oilConsumption);
              } else {

                console.log("tanks not connected (again)");
                let combined = 0;
                let numberOfOilTanks = await DB.getNewestValueFromDB('numberOfOilTanks');

                for (let tank = 1; tank <= numberOfOilTanks; tank++) {
                  const oldLevel = row === 1
                    ? await getTankLevel(year - 1, 12, tank)
                    : await getTankLevel(year, row - 1, tank);

                  const newLevel = await getTankLevel(year, row, tank);

                  combined += calculateConsumption(oldLevel, newLevel);

                  console.log("tank", tank, "oldLevel", oldLevel, "newLevel", newLevel, "combined", combined);

                }

                oilConsumption = combined;
                console.log("oilConsumption (combined)", oilConsumption);
              }

              await DB.saveValueToDB(
                `apartment${apartment}_${year}_${section}Table${row}_oilConsumption`,
                oilConsumption
              );
            }

            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_oilConsumption" value="${oilConsumption}"></td>`;


            // Öl Kosten 
            //...
            let oilCost = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row}_oilCost`);

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



            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_oilCost" value="${oilCost}"></td>`;

            // Betriebstunden Heizung 
            //...
            let operatingHoursBoiler = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row}_operatingHoursBoiler`) || '';
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_operatingHoursBoiler" value="${operatingHoursBoiler}"></td>`;

            // Laufzeit Heizung 
            //...
            let runtimeBoiler = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row}_runtimeBoiler`);
            if (runtimeBoiler === null) {
              // Keine Laufzeit in DB, selbst berechnen und in DB speichern
              // Berechnung: Betriebstunden jetzt - betriebstunden letzter eintrag (row-1 bzw. jahr-1 row12)
            }
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_runtimeBoiler" value="${runtimeBoiler}"></td>`;

            // Betriebstunden Solarpumpe 
            //...
            let operatingHoursSolarPump = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row}_operatingHoursSolarPump`) || '';
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_operatingHoursSolarPump" value="${operatingHoursSolarPump}"></td>`;

            // Laufzeit Solarpumpe 
            //...
            let runtimeSolarPump = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row}_runtimeSolarPump`) || '';
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_runtimeSolarPump" value="${runtimeSolarPump}"></td>`;

            // Solar Zählerstand 
            //...
            let solarPumpMeterCount = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row}_solarPumpMeterCount`) || '';
            rowString += `<td><input type="text" id="apartment${apartment}_${year}_${section}Table${row}_solarPumpMeterCount" value="${solarPumpMeterCount}"></td>`;

            // Erzeugte Energie 
            //...
            let producedEnergy = await DB.getValueFromDB(`apartment${apartment}_${year}_${section}Table${row}_producedEnergy`) || '';
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



async function getTankLevel(apartment, yearVal, section, rowVal, tank = null) {
  const key = tank === null
    ? `apartment${apartment}_${yearVal}_${section}Table${rowVal}_oilLevelInTanks`
    : `apartment${apartment}_${yearVal}_${section}Table${rowVal}_oilLevelInTank${tank}`;

  return await DB.getValueFromDB(key);
}

function calculateConsumption(oldLevel, newLevel) {
  if (newLevel === null || oldLevel === null) return 0;
  return Math.abs(newLevel - oldLevel);
}
