import * as DB from "../utils/database.js";
import * as Helper from "../utils/helpers.js";
import { registerListeners } from "./heatingListeners.js";
import { registerTableListeners } from "../utils/tableListeners.js";

$(document).ready(async function () {

    // Tabellentheme laden
    document.documentElement.setAttribute("data-tableTheme", "heating");

    // aktuelles jahr bekommen
    let currentYear = Helper.getDate();
    currentYear = currentYear.getFullYear();


    let tablesRaw = await DB.getValueFromDB('heatingTables');
    let tables;
    if (tablesRaw === null) {
        // Wenn Master Registry nicht in DB, dann initial leeres Array in DB speichern
        await DB.saveValueToDB('heatingTables', JSON.stringify([]));
    }
    else {
        // Wenn Master Registry in DB vorhanden
        tables = tablesRaw ? JSON.parse(tablesRaw) : [];
        console.log("heatingTables:", tables);

        for (let year of tables) {
            await Helper.createTable("heating",year);
            // await Helper.createHeatingGraph(year);
        }

        // Overview graph erzeugen
        // await Helper.createHeatingOverviewGraph();


    }

    registerListeners();
    registerTableListeners();
});