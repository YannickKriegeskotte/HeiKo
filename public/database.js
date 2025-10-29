/**
 * 
 * @param {String} key
 * @param {String} value
 */
export async function saveValueToDB(key, value) {
    console.log("saveValueToDB:", key, value);
    const response = await fetch("/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
    });
    if (!response.ok) console.error("saveValueToDB failed", response.status);
}




/**
 * @param {String} key 
 * @returns {} String or null
 */
export async function getValueFromDB(key) {
    console.log("getValueFromDB key", key);

    let response;
    let data;

    response = await fetch(`/get?key=${key}`);
    console.log("response", response);
    data = await response.json();
    console.log("data", data);
    return data.value;

}



/**
 * @param {String} key 
 * @param {String} value 
 */
export async function updateValueInDB(key, value) {
    const response = await fetch("/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
    });
    if (!response.ok) console.error("updateValueInDB failed", response.status);
}




/**
 * @param {String} key 
 * @returns {String} String oder Null
 */
export async function getNewestValueFromDB(key) {
    // Finde alle Einträge, die key enthalten
    let matches = await getAllKeysContaining(key);
    if (matches.length == 0) {
        console.log("no matches");
        return null;
    }
    // Wenn Array nur länge 1, dann nimm die value
    if (matches.length == 1) {
        console.log("one match:",matches[0]);
        return matches[0].value;
    }
    // Sonst sortiere array, sodass neustes Datum vorne und nimm die value des ersten Eintrags
    console.log("matches:",matches);
    const sorted = data
        .filter(item => extractDate(item.key))
        .sort((a, b) => extractDate(b.key) - extractDate(a.key));
    console.log("sorted[0]", sorted[0]);
    return sorted[0].value;
}


/**
 * @param {String} pattern 
 * @returns {Array}
 */
export async function getAllKeysContaining(pattern) {
    const response = await fetch(`/getAllContaining?pattern=${pattern}`);
    if (!response.ok) return [];
    return await response.json();
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
 * 
 * @param {String} key 
 * @returns {String}
 */
export async function getNewestKey(key) {
    const response = await fetch(`/getAllContaining?pattern=${key}`);
    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) return null;

    const sorted = data
        .filter(item => extractDate(item.key))
        .sort((a, b) => extractDate(b.key) - extractDate(a.key));

    return sorted[0]?.key || null;
}


/**
 * 
 * @param {String} key 
 * @returns {Date}
 */
export async function getTimestampOfNewestKey(key) {
    const newestKey = await getNewestKey(key);
    if (!newestKey) return null;

    const match = newestKey.match(/(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (!match) return null;

    const [_, day, month, year] = match;
    return `${day}-${month}-${year}`;
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