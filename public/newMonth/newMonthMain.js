import { loadSidebar } from "../utils/sidebar.js";
import * as Helper from "../utils/helpers.js";

import { registerListeners } from "../newMonth/newMonthListeners.js";

$(async function () {
  await loadSidebar("newMonth");
  Helper.hideLoader();

  $("#date-input").val(new Date().toISOString().split("T")[0]);

  const res = await fetch("/snapshot/month/latest");
  const data = await res.json();
  console.log("LATEST", data);

  if (!res.ok) return;
  if (data.success) {
    const gebuehren = data.data.payload.gebuehren;

    // OG
    applyLock(
      gebuehren?.og?.zaehlergebuehrenStrom,
      "zaehlergebuehren-strom-og",
    );

    applyLock(gebuehren?.og?.kilowattPreis, "kilowatt-preis-og");
    applyLock(
      gebuehren?.og?.zaehlergebuehrenWasser,
      "zaehlergebuehren-wasser-og",
    );
    applyLock(gebuehren?.og?.wasserPreis, "wasser-preis-og");
    applyLock(gebuehren?.og?.abwasserPreis, "abwasser-preis-og");

    // UG
    applyLock(
      gebuehren?.ug?.zaehlergebuehrenStrom,
      "zaehlergebuehren-strom-ug",
    );
    applyLock(gebuehren?.ug?.kilowattPreis, "kilowatt-preis-ug");
    applyLock(
      gebuehren?.ug?.zaehlergebuehrenWasser,
      "zaehlergebuehren-wasser-ug",
    );
    applyLock(gebuehren?.ug?.wasserPreis, "wasser-preis-ug");
    applyLock(gebuehren?.ug?.abwasserPreis, "abwasser-preis-ug");
    applyLock(gebuehren?.ug?.miete, "miete-ug");

    // Öl
    applyLock(gebuehren?.oelPreis, "oel-preis");
    console.log("Vormonat geladen");
  } else {
    console.log("Vormonat nicht geladen");
  }

  registerListeners();
});

function applyLock(valueObj, baseId) {
  if (!valueObj) return;

  const locked = valueObj.locked === true;

  const $box = $(`#${baseId}-lock`);
  const $input = $(`#${baseId}`);

  $box.prop("checked", locked);
  $input.prop("disabled", locked);
  $input.css("background-color", locked ? "#6d6d6d" : "");
}
