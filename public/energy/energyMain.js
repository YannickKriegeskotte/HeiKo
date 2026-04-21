import * as DB from "../utils/database.js";
import * as Helper from "../utils/helpers.js";
import { registerListeners } from "./energyListeners.js";
import { registerTableListeners } from "../utils/tableListeners.js";

$(document).ready(async function () {
  Helper.showLoader();

  // Tabellentheme laden
  document.documentElement.setAttribute("data-tableTheme", "electricity");

  // aktuelles jahr bekommen
  let currentYear = Helper.getDate();
  currentYear = currentYear.getFullYear();


  let tablesRaw = await DB.getValueFromDB('energyTables');

  let tables;
  if (tablesRaw === null) {
    // Wenn Master Registry nicht in DB, dann initial leeres Array in DB speichern
    await DB.saveValueToDB('energyTables', JSON.stringify([]));
  }
  else {
    // Wenn Master Registry in DB vorhanden
    tables = tablesRaw ? JSON.parse(tablesRaw) : [];
    tables.sort((a, b) => Number(a) - Number(b));
    await DB.saveValueToDB('energyTables', JSON.stringify(tables));
    console.log("energyTables:", tables);

    for (let year of tables) {
      await Helper.createTable("energy", year);
      await Helper.createGraph("energy", year);
    }

    // Overview graph erzeugen
    await Helper.createOverviewGraph("energy");

    Helper.hideLoader();
  }

  registerListeners();
  registerTableListeners();
});





/*
Anzahl Wohnungen holen
Leere Tabelle mit section & year in ID
Tabellenkopfzeile:
  Für jede Wohnung:
    Switch section:
      - energy:
        - Zählerstand
        - Verbrauch
        - Kosten
      - water:
        - Zählerstand Warmwasser OG
        - Zählerstand Kaltwasser OG
        - Wasser UG (Gesamtwasser - [Warm OG + Kalt OG] )
        - Gesamtwasser (Extra Zähler, da ist OG + UG)
        - Abwasser (= Geamtwasser)
        - Druck Heizung (Bar)
        - Druck Wasser (Bar)
        - Druck Solar (Bar)
        - Laufzeit Solarpumpe
        - Solarenergie (KWh)
      - heating:
        - Ölstand Tanks
        - Verbrauch (Differenz Öltankstände)
        - Laufzeit Heizung
        - (Kosten)
Tabellenbody füllen
  12 Zeilen:
    Datum aus DB holen
    Switch section:
      - energy:
        - getMeterData("energy",year,Zeile)
        - daten im dataArray speichern (für jahres graph)
      
      - water:
        -
      - heating:
        -
    - Daten in dataArray speichern
    - Zeile an HTML table body anhängen
*/