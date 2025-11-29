import * as DB from "../utils/database.js";
import * as Helper from "../utils/helpers.js";
import { registerListeners } from "./energyListeners.js";

$(document).ready(async function () {


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
        console.log("energyTables:", tables);

        for (let year of tables) {
            await Helper.createHeatingTable(year);
            await Helper.createHeatingGraph(year);
        }

        // Overview graph erzeugen
        await Helper.createHeatingOverviewGraph();


    }

    registerListeners();
});