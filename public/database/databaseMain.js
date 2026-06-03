import * as DB from "../utils/database.js";
import * as Helper from "../utils/helpers.js";
import { registerListeners } from "../database/databaseListener.js";

$(document).ready(async function () {

    // Alle DB Einträge holen:

    //Für jeden DB Eintrag ein neues card-grid erstellen
    let allEntries = await DB.getAllValuesFromDB();
    renderEntries(allEntries);

    registerListeners();
});


export function renderEntries(entries) {

    $('.card-grid.dynamic').remove();

    for (const entry of entries) {
        $('.card').append(`
            <div class="card-grid dynamic">
                <div class="input-group">
                    <label id="old-${entry.key}-key">${entry.key}</label>
                    <div class="input-wrapper">
                        <input type="text" id="new-${entry.key}-key-input" />
                    </div>
                </div>

                <div class="input-group">
                    <label id="old-${entry.value}-value">${entry.value}</label>
                    <div class="input-wrapper">
                        <input type="text" id="new-${entry.value}-value-input" />
                    </div>
                </div>
            </div>
        `);
    }
}