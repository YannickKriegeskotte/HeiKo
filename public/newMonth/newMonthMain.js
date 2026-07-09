import { loadSidebar } from "../utils/sidebar.js";
import * as Helper from "../utils/helpers.js";

import { registerListeners } from "../newMonth/newMonthListeners.js";

$(async function () {
  await loadSidebar("newMonth");
  Helper.hideLoader();

  $("#readingDate").val(new Date().toISOString().split("T")[0]);

  const res = await fetch("/snapshot/month/latest");
  const data = await res.json();
  console.log("LATEST", data);

  if (!res.ok) return;
  if (data.success) {
    const gebuehren = data.data.payload.gebuehren;

    applyLocks(gebuehren);

    console.log("Vormonat geladen");
  } else {
    console.log("Vormonat nicht geladen");
  }

    $("input[type=number]").each(function () {
      $(this).val(9);
    
    });

  registerListeners();
});

function applyLocks(obj, path = []) {
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object") {
      if ("value" in value && "locked" in value) {
        const id = [...path, key].join("-");

        const $input = $(`#${id}-value`);
        const $box = $(`#${id}-locked`);

        $input.val("");

        $box.prop("checked", value.locked);
        $input.prop("disabled", value.locked);
        $input.css("background-color", value.locked ? "#6d6d6d" : "");
      }
    }
    else {
      applyLocks(value, [...path, key]);
    }
  }
}
