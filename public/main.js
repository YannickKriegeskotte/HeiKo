import * as DB from "./database.js";
import { registerListeners } from "./indexListeners.js";
import * as Helper from "./helpers.js";

$(document).ready(async function () {
    const date = Helper.getDate();

    // HTTP Server availability check, um potentielles dauer reloading durch 1. zu vermeiden
    const serverAvailable = await DB.checkServerAvailability("/ping");
    if (!serverAvailable) {
        console.warn("⚠️ Server nicht erreichbar!");
        $('body').children().remove();
        $('body').append(`
            <div id="general" >
            <h2 class="sectionHeader">Server nicht erreicht!</h2>
            <img class="serverConnectionErrorImg" src="./assets/ConnectionError.png">
            </div>
        `);
        // alert("Der Server ist nicht erreichbar.");
        return;
    }


    // ==ThemeToggle==
    let isDarkMode = await DB.getValueFromDB('appearanceToggleInput');
    if (isDarkMode !== null) {
        if (isDarkMode) {
            $('html, body').css('transition', 'none');
            $('html').attr('data-theme', 'dark');
            void document.body.offsetHeight;
            $('html, body').css({transition: 'background-color 1s ease, color 1s ease, border-color 1s ease'});
        }
        else {
            $('html').removeAttr('data-theme');
        }
    }



    // ==Allgemein==
    // 1. Apartmentcount laden und in input schreiben
    let apartmentcount = await DB.getValueFromDB(`apartmentcount`);
    if (apartmentcount === null) {
        console.log("init apartmentcount");
        apartmentcount = 1;
        await DB.saveValueToDB('apartmentcount', apartmentcount);
        window.location.reload();
    }
    $(`#apartmentcount`).val(apartmentcount);

    // 2. Ensprechend viele Namen-Inputs erzeugen
    // 3. Server anfragen, ob in DB ein eintrag mit jeweiligem Namen-Input ist.  Wenn ja, einfügen, wenn ignorieren
    for (let i = 1; i <= apartmentcount; i++) {
        let apartmentName = await DB.getValueFromDB(`apartment${i}name`);
        if (apartmentName === null) {
            apartmentName = `Wohnung ${i}`;
            await DB.saveValueToDB(`apartment${i}name`, apartmentName);
            window.location.reload();
        }
        $(`.apartmentContainer`).append(`
            <label class="preInputLabel" for="apartment${i}name">Name der ${i}. Wohnung</label>
            <input type="text" id="apartment${i}name" name="apartment${i}name" value="${apartmentName}">
        `);
    }

    //=== Ab hier fast alles mit Zeitstempel ===

    // ==Strom==
    // 1. Entsprechende viele Wohnungssektionen erzeugen
    // 2. Bei jedem Input Server anfragen, ob in DB eintrag mit apartmendID vorhanden. Wenn ja, einfügen, wenn nein, leer lassen
    for (let i = 1; i <= apartmentcount; i++) {
        const meterFee = (await DB.getNewestValueFromDB(`apartment${i}electricityMeterFee`)) || '';
        const meterNumber = (await DB.getNewestValueFromDB(`apartment${i}electricityMeterNumber`)) || '';
        const electricityFee = (await DB.getNewestValueFromDB(`apartment${i}electricityFee`)) || '';
        const apartmentName = (await DB.getValueFromDB(`apartment${i}name`)) || `Wohnung ${i}`;

        Helper.appendApartmentEnergy(meterFee, meterNumber, electricityFee, apartmentName, i);
    }



    // ==Wasser==
    // 1. Allgemeine versiegelungs Inputs erzeugen, Server anfragen, ob in DB checkobx state gespeichert. Wenn ja, setzen, wenn nein standardmäßig aktivieren
    let generalPrecipitation = await DB.getValueFromDB('generalPrecipitation');
    generalPrecipitation = (generalPrecipitation == 1) ? true : false;
    const precipitationFee = await DB.getValueFromDB('precipitationFee') || '';
    const precipitationArea = await DB.getValueFromDB('precipitationArea') || '';
    Helper.appendGeneralWater(generalPrecipitation, precipitationFee, precipitationArea);

    const generalWaterChecked = $('#generalPrecipitation').is(':checked');
    Helper.sectionUpdate('water', generalWaterChecked);



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

        Helper.appendApartmentWater(meterFee, meterNumber, waterFee, sewageFee, precipitationArea, precipitationFee, apartmentName, i);
    }

    // ==Heizung==
    // 1. Allgemeine Einstellungs Checkbox erzeugen, Server anfragen, ob in DB checkbox state gespeichert. Wenn ja, setzen, wenn nein standardmäßig aktivieren
    let generalHeating = (await DB.getValueFromDB(`generalHeating`));
    generalHeating = (generalHeating == 1) ? true : false;
    const oilPerCm = (await DB.getNewestValueFromDB(`oilPerCm`)) || '';
    const numberOfOilTanks = (await DB.getNewestValueFromDB(`numberOfOilTanks`)) || '';

    Helper.appendGeneralHeating(generalHeating, oilPerCm, numberOfOilTanks);
    Helper.sectionUpdate('heating', generalHeating);



    // 2. Wenn Checkbox aktiv: Allgmeine Inputs erzeugen, Server anfragen, ob in DB eintrag vorhanden, wenn ja, eingügen, wenn nein, leer lassen.
    // 3. Wenn Checkbox nicht aktiv: Entsprechend viele Wohnungen mit Inputs erzeugen, bei jedem input Server anfragen, ob in DB wert vorhanden. Wenn ja, einfügen, wenn nein, leer lassen.
    if ($('#generalHeating').prop('checked')) {

        // Allgemeine Inputs – Werte aus DB laden 
        const oilPerCm = await DB.getValueFromDB('oilPerCm') || '';
        const numberOfTanks = await DB.getValueFromDB('numberOfOilTanks') || '';
        $(`#oilPerCm`).val(oilPerCm);
        $(`#numberOfOilTanks`).val(numberOfTanks);

        // Wohnungen löschen
        for (let i = 1; i <= apartmentcount; i++) {
            $(`.apartment${i}container`).remove();
            await DB.deleteKeyInDB(`apartment${i}oilPerCm`);
            await DB.deleteKeyInDB(`apartment${i}numberOfOilTanks`);
        }

    } else {
        // Pro-Wohnung Inputs erzeugen
        for (let i = 1; i <= apartmentcount; i++) {
            const oilPerCm = (await DB.getNewestValueFromDB(`apartment${i}oilPerCm`)) || '';
            const numberOfTanks = (await DB.getNewestValueFromDB(`apartment${i}numberOfOilTanks`)) || '';
            const apartmentName = (await DB.getValueFromDB(`apartment${i}name`)) || `Wohnung ${i}`;

            Helper.appendApartmentHeating(oilPerCm, numberOfTanks, apartmentName, i);
        }
    }

    // ==Datenbank==
    Helper.updateDatabaseTable();
    /*
    const dbData = await DB.getAllValuesFromDB();

    const sorted = Helper.sortDataFromDB(dbData);
    Helper.renderDatabaseTable(sorted);
*/




    registerListeners();
});