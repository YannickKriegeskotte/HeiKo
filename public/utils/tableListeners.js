import * as DB from "../utils/database.js";
import * as Helper from "../utils/helpers.js";

export function registerTableListeners() {

    // ===== ADD TABLE ICON LISTENER =====
    $(document).on('click', 'img.addTableIcon', async function () {

        // aktuelles jahr bekommen
        let currentYear = Helper.getDate();
        currentYear = currentYear.getFullYear();

        let section = $(`.annualTablesWrapper`).attr('id').replace(/TableWrapper$/, "");
        section = section.toLowerCase();
        console.log("section",section);        

        let tablesRaw = await DB.getValueFromDB(`${section}Tables`);
        let tables = tablesRaw ? JSON.parse(tablesRaw) : [];

        while (tables.includes(String(currentYear))) {
            currentYear++;
        }

        tables.push(String(currentYear));
        await DB.saveValueToDB(`${section}Tables`, JSON.stringify(tables));

        let tableExisting = false;
        $(`[id*='_${section}TableContainer']`).each(function () {
            const id = $(this).attr('id');
            const extractedYear = id.match(/^[0-9]{4}/)?.[0];
            if (extractedYear != currentYear) {
                return;
            }
            tableExisting = true;
        });

        if (!tableExisting) {
            await Helper.createTable(section,currentYear);
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

    // ===== TABLE DELETE ICON LISTENER =====
    $(document).on('click', 'img.tableDeleteIcon', async function () {
        const container = $(this).closest('.annualTableContainer');
        const extractedYear = container.attr('id').match(/^[0-9]{4}/)[0];
        const confirmed = confirm(`${extractedYear} Tabelle wirklich löschen?`);
        let section;
        if(confirmed){
            // richtige section extrahieren
            const containerId = container.attr("id");
            if(containerId.includes("energy")){
                section = "energy";
            }
            else if(containerId.includes("water")){
                section = "water";
            }
            else{
                section = "heating";
            }

            // jahr aus jahresarray löschen
            let tablesArray = `${section}Tables`;
            let tablesArrayValues= await DB.getValueFromDB(tablesArray); // bekommt '["2019","2020",...]'
            console.log(tablesArrayValues);
            tablesArrayValues = JSON.parse(tablesArrayValues); // zu array datentyp konvertieren
            tablesArrayValues = tablesArrayValues.filter(year => year !== extractedYear);
            console.log(tablesArrayValues);

             await DB.saveValueToDB(tablesArray, JSON.stringify(tablesArrayValues));
            // alle einträge mit section und jahr aus db löschen

            let matchingKeys = await DB.getAllKeysContaining(`${extractedYear}_${section}`);
            matchingKeys.forEach(async obj =>{
                await DB.deleteKeyInDB(obj.key);
            });

            // html container für jahr löschen
            container.remove();
        }
        else{
            //
        }
    });

    // ===== INPUT LISTENERS =====
    $(document).on('focusout', 'input', async function () {
        console.log("Focusout Listener");
        const id = $(this).attr('id');
        const value = $(this).val();

        if (value === "") return;

        if ($(this).hasClass("tableHeaderInput")) {
            //... input value = db wert?

        } else {
            await DB.saveValueToDB(id, value);

            /*
            const year = id.substring(0, 4); // z.B. '2024_energyTableMeterCount1_apartment1'
            const datasets = await Helper.createEnergyGraphDatasets("energy",year);
            const datesArray = Helper.createEnergyGraphDatesArray("energy",year);

            Helper.renderEnergyGraph("energy",year, datesArray, datasets);
            */
        }
    });

}