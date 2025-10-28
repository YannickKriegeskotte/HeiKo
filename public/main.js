 import * as DB from "./database.js";
 import { registerListeners } from "./indexListeners.js";

 $(document).ready(async function () {


registerListeners();

    // ==Allgemein==
    // 1. Apartmentcount input auslesen
    const apartmentcount = $('#apartmentcount').val();

    // 2. Ensprechend viele Namen-Inputs erzeugen
    // 3. Server anfragen, ob in DB ein eintrag mit jeweiligem Namen-Input ist.  Wenn ja, einfügen, wenn ignorieren
    for(let i=1;i<=apartmentcount;i++){
        let placeholder = `Wohnung ${i}`;
        const data = await DB.getValueFromDB(`apartment${i}name`);
        if(data !== null){
            placeholder = data.value;
        }
        $(`#general`).append(`
        <label for="apartment${i}name">Name der ${i}. Wohnung</label> <input type="text" id="apartment${i}name" name="apartment${i}name" placeholder="${placeholder}">
        `);
    }
    
    
    
    // ==Strom==
    // 1. Entsprechende viele Wohnungssektionen erzeugen
    // 2. Bei jedem Input Server anfragen, ob in DB eintrag mit apartmendID vorhanden. Wenn ja, einfügen, wenn nein, leer lassen
    for(let i=1;i<=apartmentcount;i++){
        const meterFee = (await DB.getValueFromDB(`apartment${i}electricityMeterFee`)) || '';
        const meterNumber = (await DB.getValueFromDB(`apartment${i}MeterNumber`)) || '';
        const electricityFee = (await DB.getValueFromDB(`apartment${i}electricityFee`)) || '';

        $('#energy').append(`
            <div class="apartment${i}container">
                <h3 id="apartment${i}name_electricity">Wohnung ${i}</h3>
                <label for="apartment${i}meterNumber">Zählernummer</label>
                <input type="text" id="apartment${i}meterNumber" name="apartment${i}meterNumber" value="${meterNumber}">
                <br>
                <label for="apartment${i}electricityMeterFee">Zählergebühren</label>
                <input type="number" id="apartment${i}electricityMeterFee" name="apartment${i}electricityMeterFee" value="${meterFee}">
                <label for="apartment${i}electricityMeterFee">€</label>
                <br>
                <label for="apartment${i}electricityFee">Preis pro KWh</label>
                <input type="number" id="apartment${i}electricityFee" name="apartment${i}electricityFee" value="${electricityFee}">
                <label for="apartment${i}electricityFee">€</label>
            </div>
        `);
    }
    
    
    
    // ==Wasser==
    // 1. Allgemeine versiegelungs Inputs erzeugen, Server anfragen, ob in DB checkobx state gespeichert. Wenn ja, setzen, wenn nein standardmäßig aktivieren
    const generalPrecipitation = await DB.getValueFromDB('generalPrecipitation') || 'true'; // Standardwert
    const precipitationFee = await DB.getValueFromDB('precipitationFee') || '';
    const precipitationArea = await DB.getValueFromDB('precipitationArea') || '';
    $('#water').append(`
        <label for="generalPrecipitation">Allgemeine Einstellungen für Versiegelte Fläche verwenden</label>
        <input type="checkbox" id="generalPrecipitation" name="generalPrecipitation" checked>
        <br>
        <label for="precipitationFee">Allgemeine Versiegeltungsgebühr</label>
        <input type="number" id="precipitationFee" name="precipitationFee" value="${precipitationFee}">
        <label for="precipitationFee">€</label>
        <br>
        <label for="precipitationArea">Allgemeine Versiegelte Fläche</label>
        <input type="number" id="precipitationArea" name="precipitationArea" value="${precipitationArea}">
        <label for="precipitationArea">m²</label>
    `);
    $('#generalPrecipitation').prop('checked', generalPrecipitation === true || generalPrecipitation === 'true');


    // 2. Entsprechende viele Wohnungssektionen erzeugen
    // 3. Bei jedem Input Server anfragen, ob in DB eintrag mit apartmendID vorhanden. Wenn ja, einfügen, wenn nein, leer lassen. Wenn Input ? Niederschlagsgebühr erstmal checkbox state prüfen.
    for(let i=1;i<=apartmentcount;i++){
        const meterFee = (await DB.getValueFromDB(`apartment${i}waterMeterFee`)) || '';
        const meterNumber = (await DB.getValueFromDB(`apartment${i}meterNumber`)) || '';
        const waterFee = (await DB.getValueFromDB(`apartment${i}waterFee`)) || '';
        const sewageFee = (await DB.getValueFromDB(`apartment${i}sewageFee`)) || '';
        const precipitationArea = (await DB.getValueFromDB(`apartment${i}precipitationArea`)) || '';
        const precipitationFee = (await DB.getValueFromDB(`apartment${i}precipitationFee`)) || '';
        
        $('#water').append(`
             <div class="apartment${i}container">
                <h3 id="apartment${i}name_water">Wohnung ${i}</h3>
                <label for="apartment${i}meterNumber">Zählernummer</label>
                <input type="number" id="apartment${i}meterNumber" name="apartment${i}meterNumber" value="${meterNumber}">
                <br>
                <label for="apartment${i}meterFee">Zählergebühren</label>
                <input type="number" id="apartment${i}meterFee" name="apartment${i}meterFee" value="${meterFee}">
                <label for="apartment${i}meterFee">€</label>
                <br>
                <label for="apartment${i}waterFee">Preis pro m³ Wasser</label>
                <input type="number" id="apartment${i}waterFee" name="apartment${i}waterFee" value="${waterFee}">
                <label for="apartment${i}waterFee">€</label>
                <br>
                <label for="apartment${i}sewageFee">Preis pro m³ Abwasser</label>
                <input type="number" id="apartment${i}sewageFee" name="apartment${i}sewageFee" value="${sewageFee}">
                <label for="apartment${i}sewageFee">€</label>
                <br>
                <label for="apartment${i}precipitationArea" style="color: #8c8c8c;">Versiegelte Fläche</label>
                <input type="number" id="apartment${i}precipitationArea" name="apartment${i}precipitationArea" disabled value="${precipitationArea}">
                <label for="apartment${i}precipitationArea" style="color: #8c8c8c;">m²</label>
                <br>
                <label for="apartment${i}precipitationFee" style="color: #8c8c8c;">Niederschlagsgebühr</label>
                <input type="number" id="apartment${i}precipitationFee" name="apartment${i}precipitationFee" disabled value="${precipitationFee}">
                <label for="apartment${i}precipitationFee" style="color: #8c8c8c;">€</label>
             </div>
        `);
    }
    
    // ==Heizung==
    // 1. Allgemeine Einstellungs Checkbox erzeugen, Server anfragen, ob in DB checkbox state gespeichert. Wenn ja, setzen, wenn nein standardmäßig aktivieren
    const generalHeating = (await DB.getValueFromDB(`generalHeating`));
    const isGeneralHeating = (generalHeating === null || generalHeating === '' || generalHeating === 'true' || generalHeating === true);
    $('#heating').append(`
        <label for="generalHeating">Allgemeine Einstellungen für alle Wohnungen verwenden</label>
        <input type="checkbox" id="generalHeating" name="generalHeating">
        <br>
        <label for="oilPerCm">1cm Tankfüllung entsprechen</label>
        <input type="text" id="oilPerCm" name="oilPerCm">
        <label for="oilPerCm">Liter Öl</label>
        <br>
        <label for="numberOfOilTanks">Anzahl der Öltanks</label>
        <input type="text" id="numberOfOilTanks" name="numberOfOilTanks">
    `);
    $('#generalHeating').prop('checked', isGeneralHeating);
    
    
    
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
            const oilPerCm = await DB.getValueFromDB(`apartment${i}oilPerCm`) || '';
            const numberOfTanks = await DB.getValueFromDB(`apartment${i}numberOfOilTanks`) || '';
            
            $('#heating').append(`
                <div class="apartment${i}container">
                    <h3 id="apartment${i}name_heating">Wohnung ${i}</h3>
                    <label for="apartment${i}oilPerCm">1cm Tankfüllung entsprechen</label>
                    <input type="text" id="apartment${i}oilPerCm" value="${oilPerCm}">
                    <label for="apartment${i}numberOfOilTanks">Anzahl der Öltanks</label>
                    <input type="text" id="apartment${i}numberOfOilTanks" value="${numberOfTanks}">
                </div>
            `);
        }
    }
 }); 