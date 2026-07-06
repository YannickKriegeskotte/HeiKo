import * as Helper from "../utils/helpers.js";

const monthly_template = await fetch(
  "../utils/monthly_snapshot_template.json",
).then((r) => r.json());

export function registerListeners() {
  const date = Helper.getDate();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const debug = true;

  // === Buttons ===
  // Save
  $(document).on("click", "#save-button", async function () {
    console.log("Klick");
    const dateStr = $("#date-input").val();

    // =========================
    // Validierung
    // =========================
    let missing = false;

    $("body")
      .find("input:not([type='date']):not(:disabled)")
      .each(function () {
        if ($(this).val() === "") {
          missing = true;
          return false;
        }
      });
    missing = false; // <------------------------------------------------------------------- ENTFERNEN
    if (missing) return;

    // Helper.showLoader();

    // =========================
    // JSON template laden
    // =========================
    let snapshot = structuredClone(monthly_template);

    // =========================
    // JSON template füllen
    // =========================
    snapshot.yearMonth = determineMonth(dateStr);
    snapshot.readingDate = dateStr;

    // -------------------------
    // Wasser
    // -------------------------
    snapshot.wasser.og.warmwasserZaehler = $("#warmwasser").val();
    snapshot.wasser.og.kaltwasserZaehler = $("#kaltwasser").val();

    snapshot.wasser.gesamtwasserZaehler = $("#gesamtwasser").val();
    snapshot.wasser.enthaertungsanlageDruck = $(
      "#enthaertungsanlage-druck",
    ).val();

    // -------------------------
    // Heizung
    // -------------------------
    snapshot.heizung.betriebsstundenZaehler = $(
      "#heizung-betriebsstunden",
    ).val();
    snapshot.heizung.oelverbrauchZaehler = $("#heizung-verbrauch").val();
    snapshot.heizung.druck = $("#heizung-druck").val();

    // -------------------------
    // Strom
    // -------------------------
    snapshot.strom.og.zaehler = $("#stromzaehler-og").val();
    snapshot.strom.ug.zaehler = $("#stromzaehler-ug").val();
    snapshot.strom.solarstromZaehler = $("#solarstrom").val();

    // -------------------------
    // Öl
    // -------------------------
    snapshot.oel.meter = $("#oel-meter").val();
    snapshot.oel.zeiger = $("#oel-zeiger").val();
    snapshot.oel.kaufmenge = $("#oel-kaufmenge").val();

    // -------------------------
    // Solarpumpe
    // -------------------------
    snapshot.solarpumpe.druck = $("#solarpumpe-druck").val();
    snapshot.solarpumpe.energie = $("#solarenergie").val();
    snapshot.solarpumpe.laufzeit = $("#solarpumpe-laufzeit").val();

    // -------------------------
    // Gebühren OG
    // -------------------------
    snapshot.gebuehren.og.zaehlergebuehrenStrom.value = $(
      "#zaehlergebuehren-strom-og",
    ).val();
    snapshot.gebuehren.og.zaehlergebuehrenStrom.locked = $(
      "#zaehlergebuehren-strom-og-lock",
    ).is(":checked");

    snapshot.gebuehren.og.kilowattPreis.value = $("#kilowatt-preis-og").val();
    snapshot.gebuehren.og.kilowattPreis.locked = $(
      "#kilowatt-preis-og-lock",
    ).is(":checked");

    snapshot.gebuehren.og.wasserPreis.value = $("#wasser-preis-og").val();
    snapshot.gebuehren.og.wasserPreis.locked = $("#wasser-preis-og-lock").is(
      ":checked",
    );

    snapshot.gebuehren.og.abwasserPreis.value = $("#abwasser-preis-og").val();
    snapshot.gebuehren.og.abwasserPreis.locked = $(
      "#abwasser-preis-og-lock",
    ).is(":checked");

    // -------------------------
    // Gebühren UG
    // -------------------------
    snapshot.gebuehren.ug.zaehlergebuehrenStrom.value = $(
      "#zaehlergebuehren-strom-ug",
    ).val();
    snapshot.gebuehren.ug.zaehlergebuehrenStrom.locked = $(
      "#zaehlergebuehren-strom-ug-lock",
    ).is(":checked");

    snapshot.gebuehren.ug.kilowattPreis.value = $("#kilowatt-preis-ug").val();
    snapshot.gebuehren.ug.kilowattPreis.locked = $(
      "#kilowatt-preis-ug-lock",
    ).is(":checked");

    snapshot.gebuehren.ug.wasserPreis.value = $("#wasser-preis-ug").val();
    snapshot.gebuehren.ug.wasserPreis.locked = $("#wasser-preis-ug-lock").is(
      ":checked",
    );

    snapshot.gebuehren.ug.abwasserPreis.value = $("#abwasser-preis-ug").val();
    snapshot.gebuehren.ug.abwasserPreis.locked = $(
      "#abwasser-preis-ug-lock",
    ).is(":checked");

    snapshot.gebuehren.ug.miete.value = $("#miete-ug").val();
    snapshot.gebuehren.ug.miete.locked = $("#miete-ug-lock").is(":checked");

    // -------------------------
    // Gebühren global
    // -------------------------
    snapshot.gebuehren.oelPreis.value = $("#oel-preis").val();
    snapshot.gebuehren.oelPreis.locked = $("#oel-preis-lock").is(":checked");

    snapshot.gebuehren.zaehlergebuehrenWasser.value = $(
      "#zaehlergebuehren-wasser",
    ).val();
    snapshot.gebuehren.zaehlergebuehrenWasser.locked = $(
      "#zaehlergebuehren-wasse-lock",
    ).is(":checked");

    // -------------------------
    // Verbrauch (initial)
    // -------------------------
    snapshot.verbrauch.og.strom = 0;
    snapshot.verbrauch.og.warmwasser = 0;
    snapshot.verbrauch.og.kaltwasser = 0;
    snapshot.verbrauch.og.gesamtwasser = 0;

    snapshot.verbrauch.ug.strom = 0;
    snapshot.verbrauch.ug.gesamtwasser = 0;

    snapshot.verbrauch.oel = 0;

    // -------------------------
    // Produktion (initial)
    // -------------------------
    snapshot.produziert.solarstrom = 0;
    snapshot.produziert.solarwasserenergie = 0;

    // -------------------------
    // Kosten (initial)
    // -------------------------
    snapshot.kosten.og.strom = 0;
    snapshot.kosten.og.warmwasser = 0;
    snapshot.kosten.og.kaltasser = 0;
    snapshot.kosten.og.gesamtwasser = 0;
    snapshot.kosten.og.abwasser = 0;

    snapshot.kosten.ug.strom = 0;
    snapshot.kosten.ug.wasser = 0;
    snapshot.kosten.ug.abwasser = 0;

    snapshot.kosten.oel = 0;

    // -------------------------
    // Laufzeit (initial)
    // -------------------------
    snapshot.laufzeit.heizung = 0;
    snapshot.laufzeit.solarpumpe = 0;

    console.log("NEW", snapshot);
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
    $("#date-input").val(new Date().toISOString().split("T")[0]);
  });

  // Reset
  $(document).on("click", "#reset-button", function () {
    $("input[type=number]").val("");

    $("#date-input").val(new Date().toISOString().split("T")[0]);
  });

  // === Checkboxen ===
  $(document).on("change", ".cell input[type=checkbox]", function () {
    let $this = $(this);
    let $input = $this.next("input[type=number]");

    let isLocked = this.checked;

    $input.prop("disabled", isLocked);

    $input.css("background-color", isLocked ? "#6d6d6d" : "");
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
