import * as DB from "../utils/database.js";
import * as Helper from "../utils/helpers.js";
import { registerListeners } from "./waterListeners.js";
import { registerTableListeners } from "../utils/tableListeners.js";

$(document).ready(async function () {
    Helper.showLoader();

    // Tabellentheme laden
    document.documentElement.setAttribute("data-tableTheme", "water");

    // aktuelles jahr bekommen
    let currentYear = Helper.getDate();
    currentYear = currentYear.getFullYear();


    let tablesRaw = await DB.getValueFromDB('waterTables');
    let tables;
    if (tablesRaw === null) {
        // Wenn Master Registry nicht in DB, dann initial leeres Array in DB speichern
        await DB.saveValueToDB('waterTables', JSON.stringify([]));
    }
    else {
        // Wenn Master Registry in DB vorhanden
        tables = tablesRaw ? JSON.parse(tablesRaw) : [];
        console.log("waterTables:", tables);

        for (let year of tables) {
            await Helper.createTable("water",year);
            // await Helper.createHeatingGraph(year);
        }

        // Overview graph erzeugen
        // await Helper.createHeatingOverviewGraph();


    }

    registerListeners();
    registerTableListeners();
    Helper.hideLoader();
});