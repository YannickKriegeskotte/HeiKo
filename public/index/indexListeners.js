import * as DB from "../utils/database.js";
import * as Helper from "../utils/helpers.js";
export function registerListeners() {
    const date = Helper.getDate();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    // === Theme Toggle Listener
    $(document).on('change', '#appearanceToggleInput', async function () {
        const isDark = $(this).is(':checked');

        // Transition kurz deaktivieren, damit das Umschalten flüssiger wirkt
        $('html, body').css('transition', 'none');

        // Theme toggeln
        if (isDark) {
            $('html').attr('data-theme', 'dark');
        } else {
            $('html').removeAttr('data-theme');
        }

        // Force reflow, damit die Transition korrekt angewendet wird
        void document.body.offsetHeight;

        // Transition wieder aktivieren
        $('html, body').css({
            transition: 'background-color 1s ease, color 1s ease, border-color 1s ease'
        });

        // LocalStorage speichern
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        // Optional: In DB speichern
        await DB.saveValueToDB('appearanceToggleInput', isDark);
    });



    // === Inputs (außer Checkboxen und Datenbank Sektion Inputs) === 
    $(document).on('focusout', 'input:not([type="checkbox"]):not(#database input)', async function () {
        const id = $(this).attr('id');   // z. B. "strom"
        const value = $(this).val();     // neuer Wert
        if (value == "") {
            return;
        }


        // Wenn id = apartmentcount, vergleiche value mit db, wenn value kleiner, lösche alle höheren DB Einträge
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
            if (id.startsWith("apartment") && id.endsWith("name")) {
                await DB.saveValueToDB(id, value);
            }
            else {
                await DB.saveValueToDB(`${id}_${day}-${month}-${year}`, value);
            }

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

        const today = date;
        const todayString = `${day}-${month}-${year}`;

        if (newestTimestamp === todayString) {
            await DB.updateValueInDB(newestKey, value);
        } else {
            const newKey = `${id}_${todayString}`;
            await DB.saveValueToDB(newKey, value);
        }
    });

// === Checkboxes ===
$(document).on('change', 'input[type="checkbox"]', async function () {
    const id = $(this).attr('id');         // z.B. "apartment1IsWarmWaterMeterExisting"
    const checked = $(this).is(':checked');

    // ----------------------
    // Wert in DB speichern
    // ----------------------
    if (checked) {
        await DB.updateValueInDB(id, 'checked');
    } else {
        await DB.updateValueInDB(id, '');
    }

    // ----------------------
    // Warmwasser / Kaltwasser Inputs toggeln
    // ----------------------
    if (id.includes('IsWarmWaterMeterExisting')) {
        const apartment = id.match(/\d+/)?.[0]; // Nummer der Wohnung extrahieren
        if (apartment) {
            const selector = `.apartment${apartment}container`;
            $(`${selector} #apartment${apartment}warmWaterMeterNumber`).toggle(checked);
            $(`${selector} label[for="apartment${apartment}warmWaterMeterNumber"]`).toggle(checked);
            $(`${selector} #apartment${apartment}warmWaterMeterFee`).toggle(checked);
            $(`${selector} label[for="apartment${apartment}warmWaterMeterFee"]`).toggle(checked);
        }
    }

    if (id.includes('IsColdWaterMeterExisting')) {
        const apartment = id.match(/\d+/)?.[0]; // Nummer der Wohnung extrahieren
        if (apartment) {
            const selector = `.apartment${apartment}container`;
            $(`${selector} #apartment${apartment}coldWaterMeterNumber`).toggle(checked);
            $(`${selector} label[for="apartment${apartment}coldWaterMeterNumber"]`).toggle(checked);
            $(`${selector} #apartment${apartment}coldWaterMeterFee`).toggle(checked);
            $(`${selector} label[for="apartment${apartment}coldWaterMeterFee"]`).toggle(checked);
        }
    }

    // ----------------------
    // Öltanks Checkbox (Grundkonstrukt)
    // ----------------------
    if (id === 'areOilTanksConnected') {
        // Hier kommt später die Logik
        console.log('areOilTanksConnected changed, checked:', checked);
    }
});



    // === Delete Buttons === 
    $(document).on('click', 'button.deleteButton', async function () {
        const key = $(this).attr('id');
        console.log("key", key);
        const trimmedKey = key.replace("_button", "");
        console.log("trimmedKey", trimmedKey);
        //const confirmed = confirm(`Möchten Sie ${trimmedKey} und den dazugehörigen Wert wirklich löschen?`);
        //if (confirmed) {
            await DB.deleteKeyInDB(trimmedKey);
            // Finde input anhand von trimmedKey, setze value auf "", finde Parent von this und lösche
            $(`#${trimmedKey}`).val("");
            $(`#${trimmedKey}_row`).remove();
        //}
    });

    // === Datenbank Inputs === 
    $(document).on('focusout', 'input.newKeyInput, input.newValueInput', async function () {
        console.log("Dtatabasetable Input focus update");
        const value = $(this).val();
        const inputClass = $(this).attr('class');

        // Kein Wert eingegeben => ignorieren
        if (value == "") {
            return;
        }
        // Neuer Key Name => renameKey
        if (inputClass == "newKeyInput") {
            console.log("newKeyInput");
            const oldKey = $(this).closest("tr").children("td:first").text();
            const newKey = value;
            await DB.renameKeyInDB(oldKey, newKey);
            Helper.updateDatabaseTable();
        }
        // Neue Value => updateValue
        else {
            console.log("newVlueInput");
            const key = $(this).closest("tr").children("td:first").text();
            await DB.updateValueInDB(key, value);
            Helper.updateDatabaseTable();
        }
    });

    // === Datenbank Suchen Input === 
    $(document).on('focusout keydown', 'input#searchInput', async function (event) {
        if(event.type === 'keydown' && event.key !== "Enter") return
        const inputPattern = $('#searchInput').val();
        if(inputPattern == ""){
            // alles sichtbar machen
            $(this).closest(".databaseHeader").next("table").find('tbody tr').each(function () {
                $(this).show();
            });
            return
        }
        const pattern = inputPattern.toLowerCase();

        //durchsuche jede tr auf inputvalue, wenn nicht gefunden, tr invisible machen
        $(this).closest(".databaseHeader").next("table").find('tbody tr').each(function () {
            let match = false;

            $(this).find('td').each(function () {
                const input = $(this).find('input');
                const text = input.length ? input.val().toLowerCase() : $(this).text().toLowerCase();

                if (text.includes(pattern)) {
                    match = true;
                    return false; // Abbruch der inneren each-Schleife
                }
            });

            if (match) {
                $(this).show();
            } else {
                $(this).hide(); // oder slideUp() für sanftes Ausblenden
            }
        });
        // wenn value = "", dann alles visible
    });




    // ===  "+" Icon === 
    $(document).on('click', 'svg.addIcon', async function () {
        let newElement;
        if ($('#addToDatabaseTable').length == 0) {
            newElement = $(`
            <h2 class="sectionHeader">Rückwirkend in Datenbank eintragen</h2>
            <table id="addToDatabaseTable">
                <thead>
                    <tr>
                    <th>Name</th>
                    <th>Wert</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><input type="text" class="keyInput"></td>
                        <td><input type="text" class="valueInput"></td>
                    </tr>
                </tbody>
            </table>
            <button class="addButton">Hinzufügen</button>
            `);
            $('#database .addIcon').before(newElement);
        }
        else {
            newElement = $(`
                <tr>
                    <td><input type="text" class="keyInput"></td>
                    <td><input type="text" class="valueInput"></td>
                </tr>
                `);
            $('#addToDatabaseTable tbody').append(newElement);
        }



    });


    // === Add Button === 
    $(document).on('click', 'button.addButton', async function () {
        let errorRows = [];

        const confirmed = confirm(`Möchten Sie obige Werte wirklich in die Datenbank speichern?`);
        if (confirmed) {

            const rows = $('#addToDatabaseTable tbody tr').toArray();

            for (const row of rows) {
                const $row = $(row);
                const key = $row.find('.keyInput').val();
                const value = $row.find('.valueInput').val();
                console.log("key,value", key, value);

                if (key === '' || value === '') {
                    errorRows.push(key);
                    continue;
                }

                await DB.saveValueToDB(key, value);

                $row.remove();
            }

            // Wenn tbody leer, dann tabelle löschen
            if ($('#addToDatabaseTable tbody tr').length == 0) {
                $('#addToDatabaseTable').prev('h2').remove();
                $('#addToDatabaseTable').next('button').remove();
                $('#addToDatabaseTable').remove();
            }



            // Wenn fehlerhafte Zeilen vorhanden waren, dann Nutzer darauf hinweisen
            if (errorRows.length != 0) {
                console.log("Fehlerhafte Zeile(n)");
                //...
            }
        }
    });
}