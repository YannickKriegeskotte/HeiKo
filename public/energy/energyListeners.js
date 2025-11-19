import * as DB from "../utils/database.js";
import * as Helper from "../utils/helpers.js";

export function registerListeners() {

    // ===== ADD TABLE ICON LISTENER =====
    $(document).on('click', 'img.addTableIcon', async function () {

        // window.scrollTo({ top: 0, behavior: 'smooth' });


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
        console.log("input click", id);

        if(value == ""){
            return;
        }

        await DB.saveValueToDB(id, value);
    });

}