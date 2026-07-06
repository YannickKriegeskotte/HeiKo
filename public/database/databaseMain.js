import { loadSidebar } from "../utils/sidebar.js";
import * as Helper from "../utils/helpers.js";
import { registerListeners } from "../database/databaseListener.js";

$(document).ready(async function () {
         await loadSidebar("database");

    // Alle DB Einträge holen:

    //Für jeden DB Eintrag ein neues card-grid erstellen
    let allEntries = await DB.getAllTimeEntries();

    $('#entry-amount').text(allEntries.length + " Einträge");
    renderEntries(allEntries);

    registerListeners();
});


export function renderEntries(entries) {
    $('.entry-card').remove();

    for (const entry of entries) {
        let htmlText = `
     <div class="entry-card" data-id="${entry.id}">

        <!-- HEADER -->
        <div class="entry-header">
            <label class="entry-id-label">ID:</label>
            <input class="entry-id-input" value="${entry.id}" />
        </div>

        <!-- ROW 1 -->
        <div class="entry-grid">
          <div class="field">
            <label>Type</label>
            <input class="db-data-input" data-field="type" value="${entry.type}" />
          </div>

          <div class="field">
            <label>Apartment</label>
            <input class="db-data-input" data-field="apartment_id" value="${entry.apartment_id}" />
          </div>

          <div class="field">
            <label>Metric</label>
            <input class="db-data-input" data-field="metric" value="${entry.metric}" />
          </div>
        </div>

        <!-- ROW 2 -->
        <div class="entry-grid">
          <div class="field">
            <label>Value</label>
            <input class="db-data-input" data-field="value" type="number" step="any" value="${entry.value}" />
          </div>
`;

        if (entry.type == "gebuehren") {
            htmlText += `
            <div class="field">
            <label>State</label>
            <input class="db-data-input" data-field="state" type="number" value="${entry.state}" />
          </div>`;
        }
        else {
            htmlText += `
            <div class="field">
            <label>State</label>
            <input class="db-data-input" data-field="state" type="number" value="${entry.state}" disabled style="background-color: #6d6d6d6d;"/>
          </div>`;

        }
        htmlText += `
          <div class="field">
            <label>Date</label>
            <input class="db-data-input" data-field="date" value="${entry.date}" />
          </div>
        </div>

      </div>
    `;

        $('.card').append(htmlText);
    }
}