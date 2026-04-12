import * as DB from "../utils/database.js";
import * as Helper from "../utils/helpers.js";

export function registerTableListeners() {
  // ===== ADD TABLE ICON LISTENER =====
  $(document).on("click", "img.addTableIcon", async function () {
    // aktuelles jahr bekommen
    let currentYear = Helper.getDate();
    currentYear = currentYear.getFullYear();

    let section = $(`.annualTablesWrapper`)
      .attr("id")
      .replace(/TableWrapper$/, "");
    section = section.toLowerCase();
    console.log("section", section);

    let tablesRaw = await DB.getValueFromDB(`${section}Tables`);
    let tables = tablesRaw ? JSON.parse(tablesRaw) : [];

    while (tables.includes(String(currentYear))) {
      currentYear++;
    }

    tables.push(String(currentYear));
    await DB.saveValueToDB(`${section}Tables`, JSON.stringify(tables));

    let tableExisting = false;
    $(`[id*='_${section}TableContainer']`).each(function () {
      const id = $(this).attr("id");
      const extractedYear = id.match(/^[0-9]{4}/)?.[0];
      if (extractedYear != currentYear) {
        return;
      }
      tableExisting = true;
    });

    if (!tableExisting) {
      await Helper.createTable(section, currentYear);
    }
  });

  // ===== TABLE COLLAPSE ICON LISTENER =====
  $(document).on("click", "img.tableCollapseIcon", async function () {
    const container = $(this).closest(".annualTableContainer");
    const extractedYear = container.attr("id").match(/^[0-9]{4}/)[0];
    const extractedSection = container.attr("id").match(/_(.*?)TableContainer/)[1];

    // Tabelle und Canvas-Wrapper togglen
    container.find(".canvasWrapper").slideToggle(300);
    container.find(".tableWrapper").slideToggle(300);

    $(this).toggleClass("rotated");

    const isCollapsed = $(this).hasClass("rotated") ? "true" : "false";
    await DB.saveValueToDB(`${extractedYear}_${extractedSection}TableCollapsed`, isCollapsed);

    
  });

  // ===== TABLE DELETE ICON LISTENER =====
  $(document).on("click", "img.tableDeleteIcon", async function () {
    const container = $(this).closest(".annualTableContainer");
    const extractedYear = container.attr("id").match(/^[0-9]{4}/)[0];
    const confirmed = confirm(`${extractedYear} Tabelle wirklich löschen?`);
    let section;
    if (confirmed) {
      // richtige section extrahieren
      const containerId = container.attr("id");
      if (containerId.includes("energy")) {
        section = "energy";
      } else if (containerId.includes("water")) {
        section = "water";
      } else {
        section = "heating";
      }

      // jahr aus jahresarray löschen
      let tablesArray = `${section}Tables`;
      let tablesArrayValues = await DB.getValueFromDB(tablesArray); // bekommt '["2019","2020",...]'
      console.log(tablesArrayValues);
      tablesArrayValues = JSON.parse(tablesArrayValues); // zu array datentyp konvertieren
      tablesArrayValues = tablesArrayValues.filter(
        (year) => year !== extractedYear,
      );
      console.log(tablesArrayValues);

      await DB.saveValueToDB(tablesArray, JSON.stringify(tablesArrayValues));
      // alle einträge mit section und jahr aus db löschen

      let matchingKeys = await DB.getAllKeysContaining(
        `${extractedYear}_${section}`,
      );
      matchingKeys.forEach(async (obj) => {
        await DB.deleteKeyInDB(obj.key);
      });

      // html container für jahr löschen
      container.remove();
    } else {
      //
    }
  });

  // ===== TABLE HEADER INPUT LISTENER =====
  $(document).on("focusout", "input", async function () {
    const $input = $(this);
    const id = $(this).attr("id");

    if (!id.includes("TableHeaderH2")) {
      return;
    }
    console.log("Focusout H2 Listener");

    const InputValue = $(this).val();
    const extractedYear = id.match(/^[0-9]{4}/)[0];
    // wenn InputValue keine 4 stellige zahl, abbrechen
    if (!/^[0-9]{4}$/.test(InputValue)) {
      $input.prop("disabled", true);
      alert("Falsches Eingabeformat!");
      $input.addClass("input-error");

      setTimeout(() => {
        $input.removeClass("input-error");
      }, 1500); // 1.5 Sekunden sichtbar
      console.log(`${extractedYear} wiederherstellen`);
      $input.val(extractedYear);
      $input.prop("disabled", false);
      return;
    }

    let section;

    if (id.includes("energy")) {
      section = "energy";
    } else if (id.includes("water")) {
      section = "water";
    } else {
      section = "heating";
    }

    // value schon in SectionTables vorhanden?
    let sectionTables = await DB.getValueFromDB(`${section}Tables`);
    if (sectionTables.includes(InputValue)) {
      // wenn ja, duplikat error
      $input.prop("disabled", true);
      alert("Eingabe bereits vorhanden!");
      $input.addClass("input-error");

      setTimeout(() => {
        $input.removeClass("input-error");
      }, 1500); // 1.5 Sekunden sichtbar
      console.log(`${extractedYear} wiederherstellen`);
      $input.val(extractedYear);
      $input.prop("disabled", false);
    } else {
      // wenn nein, alle werte aus tabecontainer aus db holen, duplikate mit neuem jahrespräfix erstellen, alte werte löschen,
      let confirmed = confirm(
        `${extractedYear} wirklich zu ${InputValue} ändern?`,
      );
      if (confirmed) {
        // alle dazugehörigen ID jahrespräfixe zu inputvalue ändern
        let dbValues = await DB.getAllKeysContaining(
          `${extractedYear}_${section}`,
        );

        Helper.showLoader();
        for (const obj of dbValues) {
          const oldKey = obj.key;
          const val = obj.value;
          let newKey = oldKey.replace(/[0-9]{4}/, InputValue);

          await DB.deleteKeyInDB(oldKey);
          await DB.saveValueToDB(newKey, val);
        }
        

        // altes jahr aus Tables array löschen und neues jahr hinzufügen
        console.log(extractedYear, InputValue);
        console.log(sectionTables);

        sectionTables = sectionTables.replace(extractedYear, InputValue);

        console.log(sectionTables);

        // Tables sortieren und in DB speichern
        sectionTables = JSON.parse(sectionTables);
        sectionTables.sort((a, b) => Number(a) - Number(b));
        await DB.saveValueToDB(
          `${section}Tables`,
          JSON.stringify(sectionTables),
        );
        Helper.hideLoader();

        console.log(sectionTables);

        // Seite neu laden für richtige Anzeige
        location.reload();
      } else {
        // vorherigen wert wiederherstellen
        $input.prop("disabled", true);
        console.log(`${extractedYear} wiederherstellen`);
        $input.val(extractedYear);
        $input.prop("disabled", false);
        return;
      }
    }
  });

  // ===== INPUT LISTENERS =====
  $(document).on("focusout", "input", async function () {
    const id = $(this).attr("id");

    if (id.includes("TableHeaderH2")) {
      return;
    }

    console.log("Focusout Table Inputs Listener");

    const value = $(this).val();

    const dbVal = await DB.getValueFromDB(id);
    if( value === dbVal){
      console.log("same val, ignore");
      return;
    }

    if (value === ""){
      if (dbVal === null){
        console.log("no val, no dbVal, ignore");
        return;
      }
      else{
        console.log("no val, dbVal:",dbVal,"delete!");
      await DB.deleteKeyInDB(id);  
      }
      
      } 


      await DB.saveValueToDB(id, value);

      Helper.updateGraph(id);
      Helper.updateOverviewGraph(id);
  });
}
