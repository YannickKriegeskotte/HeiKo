import * as DB from "../utils/database.js";
import * as Helper from "../utils/helpers.js";
import { registerListeners } from "./energyListeners.js";

$(document).ready(async function () {


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
        console.log("energyTables:", tables);

        for (let year of tables) {
            await Helper.createEnergyTable(year);
            await Helper.createEnergyGraph(year);
        }
    }

    registerListeners();
});