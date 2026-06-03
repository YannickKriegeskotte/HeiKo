import * as DB from "../utils/database.js";
import * as Helper from "../utils/helpers.js";
import { renderEntries } from "./databaseMain.js";

export async function registerListeners() {
    let allEntries = await DB.getAllValuesFromDB();


    $(document).on('input', '#search-input', function () {

        const search = $(this).val().toLowerCase();

        const filtered = allEntries.filter(entry =>
            entry.key.toLowerCase().includes(search) ||
            String(entry.value).toLowerCase().includes(search)
        );

        renderEntries(filtered);
    });


    $(document).on('click', '#save-button', async function () {

        $('.card-grid').each(async function () {

            let $card = $(this);

            // =====================
            // OLD KEY finden
            // =====================
            let oldKeyId = $card.find('label[id^="old-"][id$="-key"]').attr('id');

            let oldKey = oldKeyId
                ? oldKeyId.replace(/^old-/, '').replace(/-key$/, '')
                : null;

            // =====================
            // OLD VALUE finden
            // =====================
            let oldValue = $card
                .find('label[id^="old-"][id$="-value"]')
                .text()
                .trim();

            // =====================
            // NEW KEY + VALUE finden
            // =====================
            let newKey = $card
                .find('input[id^="new-"][id$="-key-input"]')
                .val();

            let newValue = $card
                .find('input[id^="new-"][id$="-value-input"]')
                .val();

            newKey = newKey ? newKey.trim() : "";
            newValue = newValue ? newValue.trim() : "";

            // =====================
            // Skip wenn nichts geändert
            // =====================
            if (!newKey && !newValue) return;

            // =====================
            // Situation analysieren und entsprechend Speichern
            // =====================
            if (newKey && newValue) {
                console.log("NEW KEY + NEW VALUE", newKey, newValue);
                await DB.deleteKeyInDB(oldKey);
                await DB.saveValueToDB(newKey,newValue);
                

            } else if (newKey && !newValue) {
                console.log("NEW KEY + OLD VALUE", newKey, oldValue);
                await DB.deleteKeyInDB(oldKey);
                await DB.saveValueToDB(newKey,oldValue);

            } else if (!newKey && newValue) {
                console.log("OLD KEY + NEW VALUE", oldKey, newValue);
                await DB.saveValueToDB(oldKey,newValue);

            }
        });

        // Daten neu aus DB holen
        allEntries = await DB.getAllValuesFromDB();

        let filter = $('#search-input').val() || "";

        // Entries mit aktuellem Filter versehen,
        let filterdEntries = allEntries.filter(function (entry) {
            return entry.key.includes(filter) ||
                String(entry.value).includes(filter);
        });

        // Alte cards aus html löschen
        $(".card").find(".card-grid").remove();
        // Und neu rendern
        renderEntries(filterdEntries);
    });
}