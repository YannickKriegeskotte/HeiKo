import * as DB from "../utils/database.js";
import { registerListeners } from "./indexListeners.js";
import * as Helper from "../utils/helpers.js";

$(document).ready(async function () {
  Helper.showLoader();
  const date = Helper.getDate();

  // HTTP Server availability check, um potentielles dauer reloading durch 1. zu vermeiden
  const serverAvailable = await DB.checkServerAvailability("/ping");
  if (!serverAvailable) {
    console.warn("⚠️ Server nicht erreichbar!");
    $("body").children().remove();
    $("body").append(`
            <div id="general" >
            <h2 class="sectionHeader">Server nicht erreicht!</h2>
            <img class="serverConnectionErrorImg" src="../assets/ConnectionError.png">
            </div>
        `);
    // alert("Der Server ist nicht erreichbar.");
    return;
  }

  // ==ThemeToggle==
  let isDarkMode = await DB.getValueFromDB("appearanceToggleInput");
  if (isDarkMode !== null) {
    if (isDarkMode) {
      $("html, body").css("transition", "none");
      $("html").attr("data-theme", "dark");
      void document.body.offsetHeight;
      $("html, body").css({
        transition:
          "background-color 1s ease, color 1s ease, border-color 1s ease",
      });
    } else {
      $("html").removeAttr("data-theme");
    }
  }

  //===================
  //==== ALLGEMEIN ====
  //===================

  // 1. Apartmentcount laden und in input schreiben
  let apartmentcount = await DB.getValueFromDB(`apartmentcount`);
  if (apartmentcount === null) {
    apartmentcount = 1;
    await DB.saveValueToDB("apartmentcount", apartmentcount);
    window.location.reload(); //... (update funktion bauen um reload zu vermeiden)
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

  //===============
  //==== STROM ====
  //===============

  // 1. Entsprechende viele Wohnungssektionen erzeugen
  // 2. Bei jedem Input DB fragen, ob Eintrag mit apartmendID vorhanden. Wenn ja, einfügen, wenn nein, leer lassen
  for (let i = 1; i <= apartmentcount; i++) {
    const meterFee =(await DB.getNewestValueFromDB(`apartment${i}electricityMeterFee`)) || "";
    const meterNumber =(await DB.getNewestValueFromDB(`apartment${i}electricityMeterNumber`)) ||"";
    const electricityFee =(await DB.getNewestValueFromDB(`apartment${i}electricityFee`)) || "";
    const apartmentName =(await DB.getValueFromDB(`apartment${i}name`)) || `Wohnung ${i}`;

    Helper.appendApartmentEnergy(meterFee, meterNumber, electricityFee, apartmentName, i);
  }

  //================
  //==== WASSER ====
  //================

  // GENERAL STUFF (betrifft alle Wohnungen)

  // Hauptwasserzählernummer
  // Hauptwasserzählergebühren (jährlich)
  // Preis pro Liter Wasser
  // Preis pro Liter Abwasser

let mainWaterMeterNumber = await DB.getNewestValueFromDB('mainWaterMeterNumber') || '';
let mainWaterMeterFee = await DB.getNewestValueFromDB('mainWaterMeterFee') || '';
let costPerLiterWater = await DB.getNewestValueFromDB('costPerLiterWater') || '';
let costPerLiterSewage = await DB.getNewestValueFromDB('costPerLiterSewage') || '';
let precipitationArea = await DB.getNewestValueFromDB(`precipitationArea`) || '';
let precipitationFee = await DB.getNewestValueFromDB(`precipitationFee`) || '';

  $("#water").append(`
           <div class="apartmentContainer">
           <label class="preInputLabel" for="mainWaterMeterNumber">Hauptwasserzählernummer</label>
           <input type="number" id="mainWaterMeterNumber" name="mainWaterMeterNumber" min="0" value="${mainWaterMeterNumber}">

           <label class="preInputLabel" for="mainWaterMeterFee">Hauptwasserzählergebühren</label>
           <input type="number" id="mainWaterMeterFee" name="mainWaterMeterFee" min="0" value="${mainWaterMeterFee}">
           <label class="postInputLabel" for="mainWaterMeterFee">€</label>

           <label class="preInputLabel" for="costPerLiterWater">Preis pro Liter Trinkwasser</label>
           <input type="number" id="costPerLiterWater" name="costPerLiterWater" min="0" value="${costPerLiterWater}">
           <label class="postInputLabel" for="costPerLiterWater">€</label>

           <label class="preInputLabel" for="costPerLiterSewage">Preis pro Liter Abwasser</label>
           <input type="number" id="costPerLiterSewage" name="costPerLiterSewage" min="0" value="${costPerLiterSewage}">
           <label class="postInputLabel" for="costPerLiterSewage">€</label>

           <label class="preInputLabel" for="precipitationArea">Versiegelte Fläche</label>
           <input type="number" id="precipitationArea" name="precipitationArea" min="0" value="${precipitationArea}">
           <label class="postInputLabel" for="precipitationArea">m²</label>

           <label class="preInputLabel" for="precipitationFee">Preis pro m² versiegelter Fläche</label>
           <input type="number" id="precipitationFee" name="precipitationFee" min="0" value="${precipitationFee}">
           <label class="postInputLabel" for="precipitationFee">€</label>
           </div>
       `);

  // PRO WOHNUNG

  // Kalt/Warmzähler vorhanden?
  // Wenn ja:
  //      Zählergebühren vorhanden?
  //      Wenn ja:
  //          Inputfeld
  //      Wenn nein:
  //          Kein Inputfeld
  //      Zählernummer (optional)
  // Wenn nein:
  //      Kein Inputfeld

  for (let apartment = 1; apartment <= apartmentcount; apartment++) {

    let apartmentName = await DB.getValueFromDB(`apartment${apartment}name`) || `Wohnung ${apartment}`;
    let isWarmWaterMeterExisting = await DB.getValueFromDB(`apartment${apartment}IsWarmWaterMeterExisting`);
    if(isWarmWaterMeterExisting === null){
      isWarmWaterMeterExisting = 'checked';
      await DB.saveValueToDB(`apartment${apartment}IsWarmWaterMeterExisting`,'checked');
    }
    let isColdWaterMeterExisting = await DB.getValueFromDB(`apartment${apartment}IsColdWaterMeterExisting`);
    if(isColdWaterMeterExisting === null){
      isColdWaterMeterExisting = 'checked';
      await DB.saveValueToDB(`apartment${apartment}IsColdWaterMeterExisting`,'checked');
    }
    let warmWaterMeterNumber = await DB.getNewestValueFromDB('warmWaterMeterNumber') || '';
    let coldWaterMeterNumber = await DB.getNewestValueFromDB('coldWaterMeterNumber') || '';
    let warmWaterMeterFee = await DB.getNewestValueFromDB('warmWaterMeterFee') || '';
    let coldWaterMeterFee = await DB.getNewestValueFromDB('coldWaterMeterFee') || '';

    $("#water").append(`
                <div class="apartment${apartment}container apartmentContainer">
                   <h3 id="apartment${apartment}name_water" class="apartmentHeader">${apartmentName}</h3>

                   <label class="preInputLabel" for="apartment${apartment}IsWarmWaterMeterExisting">Warmwasserzähler vorhanden?</label>
                   <input type="checkbox" id="apartment${apartment}IsWarmWaterMeterExisting" name="apartment${apartment}IsWarmWaterMeterExisting" ${isWarmWaterMeterExisting}>

                   <label class="preInputLabel" for="apartment${apartment}warmWaterMeterNumber">Zählernummer</label>
                   <input type="number" id="apartment${apartment}warmWaterMeterNumber" name="apartment${apartment}warmWaterMeterNumber" min="0" value="${warmWaterMeterNumber}">
                   
                   <label class="preInputLabel" for="apartment${apartment}warmWaterMeterFee">Zählergebühren</label>
                   <input type="number" id="apartment${apartment}warmWaterMeterFee" name="apartment${apartment}warmWaterMeterFee" min="0" value="${warmWaterMeterFee}">
                   <label class="postInputLabel" for="apartment${apartment}warmWaterMeterFee">€</label>



                   <label class="preInputLabel" for="apartment${apartment}IsColdWaterMeterExisting">Kaltwasserzähler vorhanden?</label>
                   <input type="checkbox" id="apartment${apartment}IsColdWaterMeterExisting" name="apartment${apartment}IsColdWaterMeterExisting" ${isColdWaterMeterExisting}>

                   <label class="preInputLabel" for="apartment${apartment}coldWaterMeterNumber">Zählernummer</label>
                   <input type="number" id="apartment${apartment}coldWaterMeterNumber" name="apartment${apartment}coldWaterMeterNumber" min="0" value="${coldWaterMeterNumber}">
                   
                   <label class="preInputLabel" for="apartment${apartment}coldWaterMeterFee">Zählergebühren</label>
                   <input type="number" id="apartment${apartment}coldWaterMeterFee" name="apartment${apartment}coldWaterMeterFee" min="0" value="${coldWaterMeterFee}">
                   <label class="postInputLabel" for="apartment${apartment}coldWaterMeterFee">€</label>
                </div>
           `);


      // Toggle input fields depending on checkbox state
      let id = `apartment${apartment}IsWarmWaterMeterExisting`;
      let checked = $(`#${id}`).is(':checked');
      
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

    id = `apartment${apartment}IsColdWaterMeterExisting`;
    checked = $(`#${id}`).is(':checked');
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
  }


  //=================
  //==== HEIZUNG ====
  //=================

  // Wieviele Öltanks?
  // Öltanks verbunden?
  // Wenn ja:
  //    Vermerken für krasse Berechnungen
  // Wenn nein:
  //    Vermerken für krasse Berechnungen
  //    (Öltanks Namen geben)
  // Wieviel Öl pro Cm?


let numberOfOilTanks = await DB.getValueFromDB('numberOfOilTanks') || '';
let areOilTanksConnected = await DB.getValueFromDB('areOilTanksConnected');
    if(areOilTanksConnected === null){
      areOilTanksConnected = 'checked';
      await DB.saveValueToDB('areOilTanksConnected','checked');
    }
let howMuchOilPerCm = await DB.getValueFromDB('howMuchOilPerCm') || '';


$("#heating").append(`
   <div class="apartmentContainer">
      
      <label class="preInputLabel" for="areOilTanksConnected">Sind die Öltanks verbunden?</label>
      <input type="checkbox" id="areOilTanksConnected" name="areOilTanksConnected" ${areOilTanksConnected}>

      <label class="preInputLabel" for="numberOfOilTanks">Anzahl der Öltanks</label>
      <input type="number" id="numberOfOilTanks" name="numberOfOilTanks" min="0" value="${numberOfOilTanks}">

      <label class="preInputLabel" for="howMuchOilPerCm">Liter pro cm Füllstand</label>
      <input type="number" id="howMuchOilPerCm" name="howMuchOilPerCm" min="0" value="${howMuchOilPerCm}">
      <label class="postInputLabel" for="howMuchOilPerCm">Liter</label>
    </div>
  `);

  


  //===================
  //==== DATENBANK ====
  //===================

  Helper.updateDatabaseTable();
  /*
    const dbData = await DB.getAllValuesFromDB();

    const sorted = Helper.sortDataFromDB(dbData);
    Helper.renderDatabaseTable(sorted);
*/

  registerListeners();
  Helper.hideLoader();
});
