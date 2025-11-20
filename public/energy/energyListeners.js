import * as DB from "../utils/database.js";
import * as Helper from "../utils/helpers.js";

export function registerListeners() {

    // ===== ADD TABLE ICON LISTENER =====
    $(document).on('click', 'img.addTableIcon', async function () {

        // aktuelles jahr bekommen
        let currentYear = Helper.getDate();
        currentYear = currentYear.getFullYear();

        let tablesRaw = await DB.getValueFromDB('energyTables');
        let tables = tablesRaw ? JSON.parse(tablesRaw) : [];

        while (tables.includes(String(currentYear))) {
            currentYear++;
        }

        tables.push(String(currentYear));
        await DB.saveValueToDB('energyTables', JSON.stringify(tables));

        let tableExisting = false;
        $(`[id*='_energyTableContainer']`).each(function () {
            const id = $(this).attr('id');
            const extractedYear = id.match(/^[0-9]{4}/)?.[0];
            if (extractedYear != currentYear) {
                return;
            }
            tableExisting = true;
        });

        if (!tableExisting) {
            await Helper.createEnergyTable(currentYear);
        }
    });

    // ===== TABLE SETTINGS ICON LISTENER =====
    $(document).on('click', 'img.tableCollapseIcon', async function () {
        const container = $(this).closest('.annualTableContainer');

        // Tabelle und Canvas-Wrapper togglen
        await container.find('.canvasWrapper').slideToggle(300);
        await container.find('.tableWrapper').slideToggle(300);


        // Optional: Icon rotieren, wenn collapsed
        $(this).toggleClass('rotated');
    });




    // ===== INPUT LISTENERS =====
    $(document).on('focusout', 'input', async function () {
        const id = $(this).attr('id');
        const value = $(this).val();

        if (value === "") return;

        if ($(this).hasClass("tableHeaderInput")) {
            //... input value = db wert?

        } else {
            await DB.saveValueToDB(id, value);

            const year = id.substring(0, 4); // z.B. '2024_energyTableMeterCount1_apartment1'
            const datasets = await Helper.createEnergyGraphDatasets(year);
            const datesArray = Helper.createEnergyGraphDatesArray(year);

             Helper.renderEnergyGraph(year, datesArray, datasets);
        }
    });

}