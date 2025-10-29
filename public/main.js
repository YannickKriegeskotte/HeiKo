import * as DB from "./database.js";
import { registerListeners } from "./indexListeners.js";
import * as Helper from "./helpers.js";

$(document).ready(async function () {




    // ==Allgemein==
    // 1. Apartmentcount laden und in input schreiben
    const apartmentcount = (await DB.getValueFromDB(`apartmentcount`)) || 1;
    $(`#apartmentcount`).val(apartmentcount);

    // 2. Ensprechend viele Namen-Inputs erzeugen
    // 3. Server anfragen, ob in DB ein eintrag mit jeweiligem Namen-Input ist.  Wenn ja, einfügen, wenn ignorieren
    for (let i = 1; i <= apartmentcount; i++) {
        const apartmentName = (await DB.getValueFromDB(`apartment${i}name`)) || `Wohnung ${i}`;
        $(`#general`).append(`
        <label for="apartment${i}name">Name der ${i}. Wohnung</label> <input type="text" id="apartment${i}name" name="apartment${i}name" value="${apartmentName}"><br>
        `);
    }



    // ==Strom==
    // 1. Entsprechende viele Wohnungssektionen erzeugen
    // 2. Bei jedem Input Server anfragen, ob in DB eintrag mit apartmendID vorhanden. Wenn ja, einfügen, wenn nein, leer lassen
    for (let i = 1; i <= apartmentcount; i++) {
        const meterFee = (await DB.getNewestValueFromDB(`apartment${i}electricityMeterFee`)) || '';
        const meterNumber = (await DB.getNewestValueFromDB(`apartment${i}electricityMeterNumber`)) || '';
        const electricityFee = (await DB.getNewestValueFromDB(`apartment${i}electricityFee`)) || '';
        const apartmentName = (await DB.getValueFromDB(`apartment${i}name`)) || `Wohnung ${i}`;

        $('#energy').append(`
            <div class="apartment${i}container">
                <h3 id="apartment${i}name_electricity">${apartmentName}</h3>
                <label for="apartment${i}electricityMeterNumber">Zählernummer</label>
                <input type="text" id="apartment${i}electricityMeterNumber" name="apartment${i}electricityMeterNumber" value="${meterNumber}">
                <br>
                <label for="apartment${i}electricityMeterFee">Zählergebühren</label>
                <input type="number" id="apartment${i}electricityMeterFee" name="apartment${i}electricityMeterFee" min="0" value="${meterFee}">
                <label for="apartment${i}electricityMeterFee">€</label>
                <br>
                <label for="apartment${i}electricityFee">Preis pro KWh</label>
                <input type="number" id="apartment${i}electricityFee" name="apartment${i}electricityFee" min="0" value="${electricityFee}">
                <label for="apartment${i}electricityFee">€</label>
            </div>
        `);
    }



    // ==Wasser==
    // 1. Allgemeine versiegelungs Inputs erzeugen, Server anfragen, ob in DB checkobx state gespeichert. Wenn ja, setzen, wenn nein standardmäßig aktivieren
    let generalPrecipitation = await DB.getValueFromDB('generalPrecipitation');
    generalPrecipitation = (generalPrecipitation == 1) ? true : false;
    const precipitationFee = await DB.getValueFromDB('precipitationFee') || '';
    const precipitationArea = await DB.getValueFromDB('precipitationArea') || '';
    $('#water').append(`
        <label for="generalPrecipitation">Allgemeine Einstellungen für Versiegelte Fläche verwenden</label>
        <input type="checkbox" id="generalPrecipitation" name="generalPrecipitation" checked>
        <br>
        <label for="precipitationFee">Allgemeine Versiegeltungsgebühr</label>
        <input type="number" id="precipitationFee" name="precipitationFee" min="0" value="${precipitationFee}">
        <label for="precipitationFee">€/m²</label>
        <br>
        <label for="precipitationArea">Allgemeine Versiegelte Fläche</label>
        <input type="number" id="precipitationArea" name="precipitationArea" min="0" value="${precipitationArea}">
        <label for="precipitationArea">m²</label>
    `);
    $('#generalPrecipitation').prop('checked', generalPrecipitation === true || generalPrecipitation === 'true');
    const generalWaterChecked = $('#generalPrecipitation').is(':checked');
    console.log("pre water check section update");
    Helper.waterSectionUpdate(generalWaterChecked);



    // 2. Entsprechende viele Wohnungssektionen erzeugen
    // 3. Bei jedem Input Server anfragen, ob in DB eintrag mit apartmendID vorhanden. Wenn ja, einfügen, wenn nein, leer lassen. Wenn Input ? Niederschlagsgebühr erstmal checkbox state prüfen.
    for (let i = 1; i <= apartmentcount; i++) {
        const meterFee = (await DB.getNewestValueFromDB(`apartment${i}waterMeterFee`)) || '';
        const meterNumber = (await DB.getNewestValueFromDB(`apartment${i}waterMeterNumber`)) || '';
        const waterFee = (await DB.getNewestValueFromDB(`apartment${i}waterFee`)) || '';
        const sewageFee = (await DB.getNewestValueFromDB(`apartment${i}sewageFee`)) || '';
        const precipitationArea = (await DB.getNewestValueFromDB(`apartment${i}precipitationArea`)) || '';
        const precipitationFee = (await DB.getNewestValueFromDB(`apartment${i}precipitationFee`)) || '';
        const apartmentName = (await DB.getValueFromDB(`apartment${i}name`)) || `Wohnung ${i}`;

        $('#water').append(`
             <div class="apartment${i}container">
                <h3 id="apartment${i}name_water">${apartmentName}</h3>
                <label for="apartment${i}waterMeterNumber">Zählernummer</label>
                <input type="number" id="apartment${i}waterMeterNumber" name="apartment${i}waterMeterNumber" value="${meterNumber}">
                <br>
                <label for="apartment${i}waterMeterFee">Zählergebühren</label>
                <input type="number" id="apartment${i}waterMeterFee" name="apartment${i}waterMeterFee" min="0" value="${meterFee}">
                <label for="apartment${i}meterFee">€</label>
                <br>
                <label for="apartment${i}waterFee">Preis pro m³ Wasser</label>
                <input type="number" id="apartment${i}waterFee" name="apartment${i}waterFee" min="0" value="${waterFee}">
                <label for="apartment${i}waterFee">€</label>
                <br>
                <label for="apartment${i}sewageFee">Preis pro m³ Abwasser</label>
                <input type="number" id="apartment${i}sewageFee" name="apartment${i}sewageFee" min="0" value="${sewageFee}">
                <label for="apartment${i}sewageFee">€</label>
                <br>
                <label for="apartment${i}precipitationArea">Versiegelte Fläche</label>
                <input type="number" id="apartment${i}precipitationArea" name="apartment${i}precipitationArea" min="0" value="${precipitationArea}">
                <label for="apartment${i}precipitationArea">m²</label>
                <br>
                <label for="apartment${i}precipitationFee">Niederschlagsgebühr</label>
                <input type="number" id="apartment${i}precipitationFee" name="apartment${i}precipitationFee" min="0" value="${precipitationFee}">
                <label for="apartment${i}precipitationFee">€</label>
             </div>
        `);  
    }

    // ==Heizung==
    // 1. Allgemeine Einstellungs Checkbox erzeugen, Server anfragen, ob in DB checkbox state gespeichert. Wenn ja, setzen, wenn nein standardmäßig aktivieren
    let generalHeating = (await DB.getValueFromDB(`generalHeating`));
    generalHeating = (generalHeating == 1) ? true : false;
    const oilPerCm = (await DB.getNewestValueFromDB(`oilPerCm`)) || '';
    const numberOfOilTanks = (await DB.getNewestValueFromDB(`numberOfOilTanks`)) || '';
    $('#heating').append(`
        <label for="generalHeating">Allgemeine Einstellungen für alle Wohnungen verwenden</label>
        <input type="checkbox" id="generalHeating" name="generalHeating">
        <br>
        <label for="oilPerCm">1cm Tankfüllung entsprechen</label>
        <input type="text" id="oilPerCm" name="oilPerCm" min="0" value=${oilPerCm}>
        <label for="oilPerCm">Liter Öl</label>
        <br>
        <label for="numberOfOilTanks">Anzahl der Öltanks</label>
        <input type="text" id="numberOfOilTanks" name="numberOfOilTanks" min="0" value=${numberOfOilTanks}>
    `);
    $('#generalHeating').prop('checked', generalHeating);



    // 2. Wenn Checkbox aktiv: Allgmeine Inputs erzeugen, Server anfragen, ob in DB eintrag vorhanden, wenn ja, eingügen, wenn nein, leer lassen.
    // 3. Wenn Checkbox nicht aktiv: Entsprechend viele Wohnungen mit Inputs erzeugen, bei jedem input Server anfragen, ob in DB wert vorhanden. Wenn ja, einfügen, wenn nein, leer lassen.
    if ($('#generalHeating').prop('checked')) {
        /*
         // Allgemeine Inputs – hier Werte aus DB laden ?
         const oilPerCm = await DB.getValueFromDB('oilPerCm') || '';
         const numberOfTanks = await DB.getValueFromDB('numberOfOilTanks') || '';
         $('#oilPerCm_' + day + '-' + month + '-' + year).val(oilPerCm);
         $('#numberOfOilTanks_' + day + '-' + month + '-' + year).val(numberOfTanks);
         */
    } else {
        // Pro-Wohnung Inputs erzeugen
        for (let i = 1; i <= apartmentcount; i++) {
            const oilPerCm = (await DB.getNewestValueFromDB(`apartment${i}oilPerCm`)) || '';
            const numberOfTanks = (await DB.getNewestValueFromDB(`apartment${i}numberOfOilTanks`)) || '';
            const apartmentName = (await DB.getValueFromDB(`apartment${i}name`)) || `Wohnung ${i}`;

            $('#heating').append(`
                <div class="apartment${i}container">
                    <h3 id="apartment${i}name_heating">${apartmentName}</h3>
                    <label for="apartment${i}oilPerCm">1cm Tankfüllung entsprechen</label>
                    <input type="text" id="apartment${i}oilPerCm" min="0" value="${oilPerCm}">
                    <br>
                    <label for="apartment${i}numberOfOilTanks">Anzahl der Öltanks</label>
                    <input type="text" id="apartment${i}numberOfOilTanks" min="0" value="${numberOfTanks}">
                </div>
            `);
        }
    }


    const dbdata = await DB.getAllValuesFromDB();

    // Sortiere dbdata zuerst alphabetisch und dann nochmal nach datum
    const sorted = dbdata.sort((a, b) => {
        const baseA = extractBaseKey(a.key);
        const baseB = extractBaseKey(b.key);

        // 1️⃣ Alphabetisch nach Präfix
        const alphaCompare = baseA.localeCompare(baseB);
        if (alphaCompare !== 0) return alphaCompare;

        // 2️⃣ Wenn gleich, nach Datum (neu → alt)
        const dateA = extractDate(a.key);
        const dateB = extractDate(b.key);

        if (!dateA && !dateB) return 0;     // beide ohne Datum
        if (!dateA) return 1;              // ohne Datum → älter
        if (!dateB) return -1;

        return dateB - dateA; // neueste zuerst
    });

    for (let i = 0; i < sorted.length; i++) {
        const key = sorted[i].key;
        const value = sorted[i].value
        console.log(key, value);

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



    registerListeners();
});






function extractBaseKey(key) {
    return key.replace(/[0-9]{1,2}-[0-9]{1,2}-[0-9]{4}$/, "").trim();
}

function extractDate(key) {
    const match = key.match(/([0-9]{1,2})-([0-9]{1,2})-([0-9]{4})$/);
    if (!match) return null;
    const [_, day, month, year] = match.map(Number);
    return new Date(year, month - 1, day);
}