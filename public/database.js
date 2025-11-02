/**
 * 
 * @param {String} url 
 * @returns {Boolean}
 */
export async function checkServerAvailability(url) {
    try {
        const response = await fetch(url, { method: "GET" });
        return response.ok; // true, wenn HTTP-Status 200–299
    } catch (error) {
        return false; // Netzwerkfehler oder Server offline
    }
}



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
    $('tbody').append(`
         <tr>
            <td>${key}</td>
            <td>${value}</td>
            <td><input type="text" class="newKeyInput"></td>
            <td><input type="text" class=newValueInput"></td>
            <td><button class=deleteButton id="${key}_button">Löschen</button></td>
        </tr>
    `);
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
    if (!response.ok) return null;
    data = await response.json();
    return data.value;
}




/** 
 * @returns {Array} 
 */
export async function getAllValuesFromDB() {
    console.log("getAllValuesFromDB");
    let response;
    let data;
    response = await fetch(`/getAll`);
    data = await response.json();
    if (!response.ok) return [];
    return data;
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
    if (response.ok) console.log("updatedValueInDB:", key, "=>", value);

    const row = $(`tbody tr`).filter(function () {
    return $(this).find("td:first").text() === key;
});
row.find("td:nth-child(2)").text(value);

// Klasse kurz hinzufügen, dann wieder entfernen
row.addClass("highlightFade");
setTimeout(() => row.removeClass("highlightFade"), 1300);
}




/**
 * @param {String} key 
 * @returns {String} String oder Null
 */
export async function getNewestValueFromDB(key) {
    // Finde alle Einträge, die key enthalten
    let matches = await getAllKeysContaining(key);
    if (matches.length == 0) {
        console.log("getNewestValueFromDB", key, ": no matches");
        return null;
    }
    // Wenn Array nur länge 1, dann nimm die value
    if (matches.length == 1) {
        console.log("getNewestValueFromDB", key, ": one match:", matches[0]);
        return matches[0].value;
    }
    // Sonst sortiere array, sodass neustes Datum vorne und nimm die value des ersten Eintrags
    console.log("getNewestValueFromDB", key, ": matches:", matches);
    const sorted = data
        .filter(item => extractDate(item.key))
        .sort((a, b) => extractDate(b.key) - extractDate(a.key));
    return sorted[0].value;
}


/**
 * @param {String} pattern 
 * @returns {Array}
 */
export async function getAllKeysContaining(pattern) {
    console.log("getAllKeysContaining", pattern);
    const response = await fetch(`/getAllContaining?pattern=${pattern}`);
    if (!response.ok) return [];
    return await response.json();
}

/**
 * @param {String} apartmendID 
 */
export async function deleteAllValuesFromApartmentInDB(apartmendID) {
    console.log("deleteAllValuesFromApartmendInDB", apartmendID);
    const response = await fetch(`/removeApartmentEntries?apartmentID=${apartmendID}`, { method: "DELETE" });
    const result = await response.json();
    if (result.success) {
        console.log("Gelöscht!");

        // Finde alle html datenbank zeilen, die apartmendID enthalten und lösche sie
        //...
    }
}


export async function deleteKeyInDB(key) {
    console.log("deleteKeyInDB", key);
    const response = await fetch("/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key })
    });
    const result = await response.json();
    if (result.success) {
        console.log("Gelöscht!");
        /* Unnötig?
                // Finde html datenbank zeile und lösche
                 const row = $(`tbody tr`).filter(function() {
                return $(this).find("td:first").text() === key;
                 });
                 row.parent().remove();
        */
    }
}




/**
 * 
 * @param {String} key 
 * @returns {String}
 */
export async function getNewestKey(key) {
    console.log("getNewestKey", key);
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
    console.log("getTimestampOfNewestKey", key);
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
    console.log("extractDate", key);
    const match = key.match(/(\d{1,2}-\d{1,2}-\d{4})$/);
    if (!match) { return null }
    const [day, month, year] = match[1].split('-').map(Number);
    return new Date(year, month - 1, day);
}