import * as Helper from "../utils/helpers.js";

const monthly_template = await fetch(
  "../utils/monthly_snapshot_template.json",
).then((r) => r.json());

export function registerListeners() {

  // === Buttons ===
  // Save
  $(document).on("click", "#save-button", async function () {
    console.log("Save Button");
    const dateStr = $("#readingDate").val();

    // =========================
    // Validierung
    // =========================
    let missing = false;
    let missingObj;

    $("body")
      .find("input:not([type='date']):not(:disabled)")
      .each(function () {
        if ($(this).val() === "") {
          missing = true;
          missingObj = this;
          return false;
        }
      });
    missing = false; // <------------------------------------------------------------------- ENTFERNEN
    if (missing) {
      console.log("missing input");
      
      missingObj.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

      $(missingObj).parent().addClass("input-error-animation");

      setTimeout(() => {
        $(missingObj).parent().removeClass("input-error-animation");
      }, 1200);
      return
    }

    // Helper.showLoader();

    // =========================
    // JSON template laden
    // =========================
    let snapshot = structuredClone(monthly_template);

    // =========================
    // Vormonat aus DB laden
    // =========================
    console.log("load prev");
    const yearMonth = dateStr.slice(0, 7);
    const response = await ((await fetch(`/snapshot/month/previous/${yearMonth}`)).json());
    console.log("prev", response);

    // prev not found
    if (!response.success) {

      // Aktive Checkboxen mit 0 füllen
      $("input[type=checkbox]").each(function () {
        if (!this.checked) return;
        const valueID = this.id.replace("locked", "value");
        $(`#${valueID}`).val(0);
      });
    } else {

      const prev = response.data.payload;

      // =========================
      // Aktive Checkboxen mit prev füllen
      // =========================
      $("input[type=checkbox]").each(function () {
        if (!this.checked) return;

        const valueID = this.id.replace("locked", "value");
        const path = valueID.split("-");
        const value = getNestedValue(prev, path);

        $(`#${valueId}`).val(value);
      });
    }

    // =========================
    // JSON template füllen
    // =========================

    // date input
    $("input[type=date]").each(function () {
      const path = this.id.split("-");
      const value = this.value;

      setNestedValue(snapshot, path, value);
    });


    // alle number inputfelder (auch von Gebühren, da vorher potentielle Vormonatswerte eingetragen wurden)
    $("input[type=number]").each(function () {
      const path = this.id.split("-");
      const value = Number(this.value);

      setNestedValue(snapshot, path, value);
    });

    // alle checkboxen
    $("input[type=checkbox]").each(function () {
      const path = this.id.split("-");

      setNestedValue(snapshot, path, this.checked);
    });


    // monat aus reading date extrahieren und limiter drüber laufen lassen
    snapshot.yearMonth = determineMonth(dateStr);

    console.log("NEW", snapshot);

    snapshot = {"yearMonth":"2019-01","readingDate":"2019-01-31","wasser":{"og":{"warmwasserZaehler":431,"kaltwasserZaehler":1800},"gesamtwasserZaehler":475,"enthaertungsanlageDruck":5.2},"heizung":{"betriebsstundenZaehler":4509,"oelverbrauchZaehler":5553,"druck":1.8},"strom":{"og":{"zaehler":81512},"ug":{"zaehler":124869},"solarstromZaehler":0},"oel":{"meter":4.9,"zeiger":96,"kaufmenge":0},"solarpumpe":{"druck":2.6,"energie":0,"laufzeit":2867,"ergie":13391},"gebuehren":{"og":{"zaehlergebuehrenStrom":{"value":14.8,"locked":false},"kilowattPreis":{"value":0.3,"locked":false},"wasserPreis":{"value":0.22,"locked":false},"abwasserPreis":{"value":0.25,"locked":false}},"ug":{"zaehlergebuehrenStrom":{"value":14.8,"locked":false},"kilowattPreis":{"value":0.3,"locked":false},"wasserPreis":{"value":0.22,"locked":false},"abwasserPreis":{"value":0.25,"locked":false},"miete":{"value":720,"locked":false}},"oelPreis":{"value":0,"locked":false},"zaehlergebuehrenWasser":{"value":15.6,"locked":false}},"verbrauch":{"og":{"strom":0,"warmwasser":0,"kaltwasser":0,"gesamtwasser":0},"ug":{"strom":0,"gesamtwasser":0},"oel":0},"produziert":{"solarstrom":0,"solarwasserenergie":0},"kosten":{"og":{"strom":0,"warmwasser":0,"kaltwasser":0,"gesamtwasser":0,"abwasser":0},"ug":{"strom":0,"wasser":0,"abwasser":0},"oel":0},"laufzeit":{"heizung":0,"solarpumpe":0}};
    // =========================
    // An Backend senden
    // =========================

    await fetch("/snapshot/processNewMonth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(snapshot),
    });

    // =========================
    // 3. HTML NEU HERRICHTEN
    // =========================
    Helper.hideLoader();

    $("input[type=number]").val("");
    $("#readingDate").val(new Date().toISOString().split("T")[0]);
  });

  // Reset
  $(document).on("click", "#reset-button", function () {
    $("input[type=number]").val("");

    $("#readingDate").val(new Date().toISOString().split("T")[0]);
  });

  // === Checkboxen ===
  $(document).on("change", ".lock-switch input[type=checkbox]", function () {

    const $numberInput = $(this)
      .closest(".pricing-input")
      .find("input[type=number]");

    const locked = this.checked;

    $numberInput.prop("disabled", locked);
    $numberInput.css("background-color", locked ? "#6d6d6d" : "");
  });

  // === Input value scroll manipulation deaktivieren  ===
  $('input[type="number"]').on("wheel", function (event) {
    event.preventDefault();
    $(this).blur();
  });
}

function determineMonth(isoDate) {
  const d = new Date(isoDate);

  if (d.getDate() <= 8) {
    d.setMonth(d.getMonth() - 1);
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function setNestedValue(obj, path, value) {
  let current = obj;

  for (let i = 0; i < path.length - 1; i++) {
    current = current[path[i]];
  }

  current[path[path.length - 1]] = value;
}

function getNestedValue(obj, path) {
  let current = obj;

  for (const key of path) {
    current = current[key];
  }

  return current;
}