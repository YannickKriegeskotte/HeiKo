import * as DB from "../utils/database.js";
import * as Helper from "../utils/helpers.js";
export function registerListeners() {
    const date = Helper.getDate();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const debug = true;




    // === Buttons === 
    // Save
    $(document).on('click', '#save-button', async function () {

        const dateStr = $('#date-input').val();

        // VALIDIERUNG (kann bleiben wie sie ist)
        let missing = false;

        $('body')
            .find("input:not([type='date']):not(:disabled)")
            .each(function () {
                if ($(this).val() === "") {
                    missing = true;
                    return false;
                }
            });

        if (missing) return;

        Helper.showLoader();

        // =========================
        // 1. ALLE ROHDATEN SAMMELN
        // =========================
        const entries = [];

        const fields = [
            // Wasser
            { id: "warmwasser", apartment: "og", type: "wasser", metric: "warmwasser" },
            { id: "kaltwasser", apartment: "og", type: "wasser", metric: "kaltwasser" },
            { id: "gesamtwasser", apartment: "", type: "wasser", metric: "gesamtwasser" },
            { id: "enthaertungsanlage-druck", apartment: "", type: "wasser", metric: "druck-enthaertungsanlage" },

            // Heizung
            { id: "heizung-betriebsstunden", apartment: "", type: "heizung", metric: "betriebsstunden" },
            { id: "heizung-verbrauch", apartment: "", type: "heizung", metric: "zaehlerstand-verbrauch" },
            { id: "heizung-druck", apartment: "", type: "heizung", metric: "druck" },

            // Öl
            { id: "oel-zeiger", apartment: "", type: "oel", metric: "zeiger" },
            { id: "oel-meter", apartment: "", type: "oel", metric: "meter" },

            // Strom
            { id: "stromzaehler-ug", apartment: "ug", type: "strom", metric: "zaehler" },
            { id: "stromzaehler-og", apartment: "og", type: "strom", metric: "zaehler" },
            { id: "solarstrom", apartment: "", type: "strom", metric: "solarstrom" },

            // Solar
            { id: "solarpumpe-laufzeit", apartment: "", type: "solar", metric: "laufzeit" },
            { id: "solarenergie", apartment: "", type: "solar", metric: "energie" },
            { id: "solarpumpe-druck", apartment: "", type: "solar", metric: "druck" },

            // UI

            // Zählergebühren Strom
            { id: "zaehlergebuehren-strom-og-lock", apartment: "og", type: "gebuehren", metric: "zaehlergebuehren-strom" },
            { id: "zaehlergebuehren-strom-ug-lock", apartment: "ug", type: "gebuehren", metric: "zaehlergebuehren-strom" },

            // Zählergebühren Wasser
            { id: "zaehlergebuehren-wasser-og-lock", apartment: "og", type: "gebuehren", metric: "zaehlergebuehren-wasser" },
            { id: "zaehlergebuehren-wasser-ug-lock", apartment: "ug", type: "gebuehren", metric: "zaehlergebuehren-wasser" },

            // Kilowatt Preis
            { id: "kilowatt-preis-og-lock", apartment: "og", type: "gebuehren", metric: "kilowatt-preis" },
            { id: "kilowatt-preis-ug-lock", apartment: "ug", type: "gebuehren", metric: "kilowatt-preis" },

            // Wasser Preis
            { id: "wasser-preis-og-lock", apartment: "og", type: "gebuehren", metric: "wasser-preis" },
            { id: "wasser-preis-ug-lock", apartment: "ug", type: "gebuehren", metric: "wasser-preis" },

            // Abwasser Preis
            { id: "abwasser-preis-og-lock", apartment: "og", type: "gebuehren", metric: "abwasser-preis" },
            { id: "abwasser-preis-ug-lock", apartment: "ug", type: "gebuehren", metric: "abwasser-preis" },

            // Öl Preis
            { id: "oel-preis-og-lock", apartment: "og", type: "gebuehren", metric: "oel-preis" },
            { id: "oel-preis-ug-lock", apartment: "ug", type: "gebuehren", metric: "oel-preis" },

            // Miete (nur UG)
            { id: "miete-ug-lock", apartment: "ug", type: "gebuehren", metric: "miete" }
        ];

        for (const field of fields) {

            const $el = $("#" + field.id);

            let value = null;
            let state = null;

            if ($el.attr("type") === "checkbox") {
                state = $el.is(":checked") ? 1 : 0;

                if (state === 0) {
                    value = $("#" + field.id.replace(/-lock$/, "")).val();
                } else {
                    const previous = await DB.getPreviousEntry(
                        field.type,
                        field.metric,
                        field.apartment,
                        dateStr
                    );
                    value = previous?.value ?? null;
                }
            } else {
                value = $el.val();
            }

            entries.push({
                type: field.type,
                apartment_id: field.apartment,
                metric: field.metric,
                value,
                state,
                date: dateStr
            });
        }

        // =========================
        // 2. EINMAL AN BACKEND SENDEN
        // =========================
        await fetch("/time/save-batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entries })
        });


        // =========================
        // 3. HTML NEU HERRICHTEN
        // =========================
        Helper.hideLoader();

        $('input[type=number]').val('');
        $('#date-input').val(new Date().toISOString().split('T')[0]);
    });






    // Reset
    $(document).on('click', '#reset-button', function () {
        $('input[type=number]').val('');

        $('#date-input').val(new Date().toISOString().split('T')[0]);
    });

    // === Checkboxen === 
    $(document).on('change', '.cell input[type=checkbox]', function () {
        let $this = $(this);
        let $input = $this.next('input[type=number]');

        let isLocked = this.checked;

        $input.prop('disabled', isLocked);

        $input.css('background-color', isLocked ? '#6d6d6d' : '');
    });

    // === Input value scroll manipulation deaktivieren  === 
    $('input[type="number"]').on('wheel', function (event) {
        event.preventDefault();
        $(this).blur();
    });


}