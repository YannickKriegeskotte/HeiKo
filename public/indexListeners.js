import * as DB from "./database.js";
export function registerListeners() {
    $(document).on('focusout', 'input:not([type="checkbox"])', async function () {
        const id = $(this).attr('id');
        const value = $(this).val();
        console.log("input", id);

        // Prüfe ob key(id) bereits in DB, wenn ja, speichere neuste value in "data"
        const data = await DB.getValueFromDB(id);
        if(data === null){
            // Wenn value noch nicht in DB, in DB speichern
            await DB.saveValueToDB(id,value);
        }
        else{
            // Wenn data und value gleich, ignorieren.
            if(data == value){
                // ignorieren
            }
            // Wenn value von data abweichent, Datum von data key(id) prüfen
            else{
                // Wenn Eintragsdatum = heutigem Datum
                const keyTimestamp = DB.getTimestampOfNewestKey(id);
                const currentDate = new Date(`${year}-${month}-${day}`);

                if(keyTimestamp = currentDate){
                   // Dann nur value aktuallisieren.
                const newestKey = DB.getNewestKey(id);
                DB.updateValueInDB(newestKey, value);

                }
                else{
                    // Wenn Eintragsdatum älter, dann neuen Eintrag erstellen
                    await DB.saveValueToDB(id,value);
                }
                
            }
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
