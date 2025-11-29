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
            await Helper.createTable("energy",currentYear);
        }
    });

    // ===== TABLE COLLAPSE ICON LISTENER =====
    $(document).on('click', 'img.tableCollapseIcon', async function () {
        const container = $(this).closest('.annualTableContainer');
        const extractedYear = container.attr('id').match(/^[0-9]{4}/)[0];

        // Tabelle und Canvas-Wrapper togglen
        container.find('.canvasWrapper').slideToggle(300);
        container.find('.tableWrapper').slideToggle(300);

        $(this).toggleClass('rotated');

        const isCollapsed = $(this).hasClass('rotated') ? 'true' : 'false';
        await DB.saveValueToDB(`${extractedYear}_tableCollapsed`, isCollapsed);
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
            const datasets = await Helper.createEnergyGraphDatasets("energy",year);
            const datesArray = Helper.createEnergyGraphDatesArray("energy",year);

            Helper.renderEnergyGraph("energy",year, datesArray, datasets);
        }
    });

}