import * as DB from "./database.js";
import * as Helper from "./helpers.js";
export function registerListeners() {
    // Inputs
    $(document).on('focusout', 'input:not([type="checkbox"])', async function () {
        const id = $(this).attr('id');   // z. B. "strom"
        const value = $(this).val();     // neuer Wert
        if (value == "") {
            return;
        }




        // Wenn id = apartmentcount, vergleiche value mit db, wenn value kleiner, lösche alle höheren db einträge
        if (id == "apartmentcount") {
            let data = await DB.getValueFromDB('apartmentcount');
            while (data > value) {
                await DB.deleteAllValuesFromApartmentInDB(`apartment${data}`);
                data--;
            }
            // Speichere neuen apartmentcount value in DB
            await DB.updateValueInDB('apartmentcount', value);

            // Seite neu laden für GUI update
            window.location.reload();


        }



        // Prüfe, ob es in der DB mehrere Versionen (mit Datum) gibt
        const allMatches = await DB.getAllKeysContaining(id);

        if (!allMatches || allMatches.length === 0) {
            // Noch kein Eintrag -> neu speichern
            await DB.saveValueToDB(id, value);
            return;
        }

        // Prüfen, ob die Keys timestamps enthalten
        const hasTimestamps = allMatches.some(k => /\d{1,2}-\d{1,2}-\d{4}$/.test(k.key));

        if (!hasTimestamps) {
            // Kein Datum => ganz normaler Key, einfach ersetzen
            const currentValue = await DB.getValueFromDB(id);
            if (currentValue !== value) {
                await DB.updateValueInDB(id, value);
            } else {
            }

            // Wenn Input id beginnt mit "apartment" und endet mit "name", dann fenster neu laden, um Namen überall richtig anzuzeigen
            if (id.startsWith("apartment") && id.endsWith("name")) {
                window.location.reload();
            }
            return;
        }

        // Ab hier: zeitabhängige Keys
        const newestKey = await DB.getNewestKey(id);
        const newestTimestamp = await DB.getTimestampOfNewestKey(id);

        const today = new Date();
        const todayString = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

        if (newestTimestamp === todayString) {
            await DB.updateValueInDB(newestKey, value);
        } else {
            const newKey = `${id}-${todayString}`;
            await DB.saveValueToDB(newKey, value);
        }
    });

    // Checkboxes
    $(document).on('change', 'input[type="checkbox"]', async function () {
        const id = $(this).attr('id');
        const checked = $(this).is(':checked');
        /*
        Prüfe ob state in DB
        Wenn ja, Wert auslesen und Checkbox setzen
        Wenn nein, aktuellen Wert in DB speichern
        */

        let data = (await DB.getValueFromDB(id));
        if (data === null) {
            await DB.saveValueToDB(id, checked);
            data = checked;
        }
        else {
            await DB.updateValueInDB(id, checked);
        }

        // Water Checkbox
        if (id == "generalPrecipitation") {
            // Watersection GUI toggle
            Helper.sectionUpdate('water', checked);

        }

        // Heating Checkbox
        if (id == "generalHeating") {
            // HeatingSectionUpdate() ausführen um inputs zu toggeln
            Helper.sectionUpdate('heating', checked);
        }
    });

    // Delete Buttons
    $(document).on('click', 'button.deleteButton', async function () {
        const key = $(this).attr('id');
        console.log("key", key);
        const trimmedKey = key.replace("_button", "");
        console.log("trimmedKey", trimmedKey);
        const confirmed = confirm(`Möchten Sie ${trimmedKey} und den dazugehörigen Wert wirklich löschen?`);
        if (confirmed) {
            await DB.deleteKeyInDB(trimmedKey);
            // Finde input anhand von trimmedKey, setze value auf "", finde Parent von this und lösche
            $(`#${trimmedKey}`).val("");
            $(`#${trimmedKey}_row`).remove();
        }
    });

    // Datenbank Inputs
    $(document).on('focusout', 'input.newKeyInput, input.newValueInput', async function () {
        if (value == "") {
            return;
        }
    });
}