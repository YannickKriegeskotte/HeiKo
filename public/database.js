/**
 * 
 * @param {String} key
 * @param {String} value
 */
export async function saveValueToDB(key, value) {
    await fetch("/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key, value: value }),
    });
}

/**
 * 
 * @param {String} key 
 * @returns {String}
 */
export async function getNewestKey(key) {
    let response;
    let data;

    // Suche nach allen keys, die "key" enthalten und nimm den neusten
    response = await fetch(`/getAllContaining?pattern=${key}`);
    data = await response.json();

    // Suche im array den neusten Eintrag anhand der Daten in den keys
    const sorted = data
        .filter(item => extractDate(item.key))
        .sort((a, b) => extractDate(b.key) - extractDate(a.key));
    return sorted[0].key; 
}


/**
 * 
 * @param {String} key 
 * @returns {Date}
 */
export async function getTimestampOfNewestKey(key) {

    const match = (getNewestKey(key)).match(/([0-9]{1,2})-([0-9]{1,2})-([0-9]{4})$/);
    return [_, day, month, year] = match; 
}

export async function updateValueInDB(key, value){
     await fetch("/update", {
        method: "POST",
        headers: { "Conten-Type": "application/json" },
        body: JSON.stringify({ key: key, value: value }),
    });
}


/**
 * @param {String} key 
 * @returns {} String or null
 */
export async function getValueFromDB(key) {
    let response;
    let data;

    const keyHasTimestamp = /[0-9]{1,2}-[0-9]{1,2}-[0-9]{4}$/.test(key);

    // Wenn input key ein Datum hat, suche nach genau diesem Eintrag.
    if (keyHasTimestamp) {
        response = await fetch(`/get?key=${key}`);
        data = await response.json();

        // Wenn kein Eintrag mit genau diesem Datum gefunden, trimme das Datum, suche erneut in der DB und nimm den neusten eintrag.
        if (!data.value) {
            const trimmedKey = key.replace(/[0-9]{1,2}-[0-9]{1,2}-[0-9]{4}$/, "");
            response = await fetch(`/getAllContaining?pattern=${key}`);
            data = await response.json();

            // Wenn wieder kein Eintrag gefunden, dann gibt es keinen Eintag in DB
            if (data.length == 0) {
                return null;
            }

            // Wenn Einträge gefunden, suche im array den neusten Eintrag anhand der Daten in den keys
            const sorted = data
                .filter(item => extractDate(item.key))
                .sort((a, b) => extractDate(b.key) - extractDate(a.key));
            return sorted[0].value;
        }
        else {
            // Ein Eintrag mit genau dem Datum wurde gefunden, gib die value zurück
            return data.value;
        }
    }
    // Wenn input key kein Datum hat, suche nach allen keys und nimm den neusten
    else {
        response = await fetch(`/getAllContaining?pattern=${key}`);
        data = await response.json();
        // Wenn kein Eintrag gefunden, dann gibt es keinen Eintag in DB
        if (data.length == 0) {
            return null;
        }

        // Suche im array den neusten Eintrag anhand der Daten in den keys
        const sorted = data
            .filter(item => extractDate(item.key))
            .sort((a, b) => extractDate(b.key) - extractDate(a.key));
        return sorted[0].value;
    }
}

/**
 * @param {String} apartmendID 
 */
export async function deleteAllValuesFromApartmentInDB(apartmendID) {
    const response = await fetch(`/removeApartmentEntries?apartmentID=${apartmendID}`, { method: "DELETE" });
    const result = await response.json();
    if (result.success) {
        console.log("Gelöscht!");
    }
}

/**
 * @param {String} key 
 * @returns {String}
 */
function extractDate(key) {
    const match = key.match(/(\d{1,2}-\d{1,2}-\d{4})$/);
    if (!match) { return null }
    const [day, month, year] = match[1].split('-').map(Number);
    return new Date(year, month - 1, day);
}