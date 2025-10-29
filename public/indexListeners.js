import * as DB from "./database.js";
export function registerListeners() {
$(document).on('focusout', 'input:not([type="checkbox"])', async function () {
    const id = $(this).attr('id');   // z. B. "strom"
    const value = $(this).val();     // neuer Wert

    console.log("Input:", id, "=", value);

    // Prüfe, ob es in der DB mehrere Versionen (mit Datum) gibt
    const allMatches = await DB.getAllKeysContaining(id);

    if (!allMatches || allMatches.length === 0) {
        // 🔹 Noch kein Eintrag -> neu speichern
        console.log("Kein Eintrag gefunden, speichere neu");
        await DB.saveValueToDB(id, value);
        return;
    }

    // Prüfen, ob die Keys timestamps enthalten
    const hasTimestamps = allMatches.some(k => /\d{1,2}-\d{1,2}-\d{4}$/.test(k.key));

    if (!hasTimestamps) {
        // 🔹 Kein Datum => ganz normaler Key, einfach ersetzen
        const currentValue = await DB.getValueFromDB(id);
        if (currentValue !== value) {
            console.log("Update (permanenter Key)", id);
            await DB.updateValueInDB(id, value);
        } else {
            console.log("Wert gleich, ignoriere");
        }
        return;
    }

    // 🔹 Ab hier: zeitabhängige Keys
    const newestKey = await DB.getNewestKey(id);
    const newestTimestamp = await DB.getTimestampOfNewestKey(id);

    const today = new Date();
    const todayString = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

    if (newestTimestamp === todayString) {
        console.log("Heutiger Eintrag vorhanden -> update", newestKey);
        await DB.updateValueInDB(newestKey, value);
    } else {
        const newKey = `${id}-${todayString}`;
        console.log("Neuer Tag, erstelle neuen Key:", newKey);
        await DB.saveValueToDB(newKey, value);
    }
});


    $(document).on('change', 'input[type="checkbox"]', function () {
        const id = $(this).attr('id');
        const value = $(this).val();
        const checked = $(this).is(':checked');
        console.log("checkbox", id);
        /*
        Prüfe ob state in DB
        Wenn ja, Wert auslesen und Checkbox setzen
        Wenn nein, aktuellen Wert in DB speichern
        */

        // Water Checkbox
        if (id == "generalPrecipitation") {
            // WaterSectionUpdate() ausführen um inputs zu toggeln

        }

        // Heating Checkbox
        if (id == "generalHeating") {
            // HeatingSectionUpdate() ausführen um inputs zu toggeln

        }
    });
}
