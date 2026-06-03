import * as DB from "../utils/database.js";
import * as Helper from "../utils/helpers.js";
export function registerListeners() {
    const date = Helper.getDate();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();





    // === Buttons === 
    $(document).on('click', '#save-button', async function () {

        console.log("Save Button");

        // Datum holen (ISO Format: YYYY-MM-DD)
        const dateStr = $('#date-input').val();

        // VALIDIERUNG
        let missing = false;

        $('body')
            .find("input:not([type='date']):not(:disabled)")
            .each(function () {

                if ($(this).val() === "") {
                    missing = true;

                    const $target = $(this).closest('.input-wrapper').length
                        ? $(this).closest('.input-wrapper')
                        : $(this);

                    $('html, body').animate({
                        scrollTop: $target.offset().top - 100
                    }, 500);

                    $target.addClass('input-error-animation');

                    setTimeout(() => {
                        $target.removeClass('input-error-animation');
                    }, 1200);

                    return false;
                }
            });

        // Abbruch, wenn leerer Input
        if (missing) return;

        // VALUE holen
        const fields = [
            // Wasser
            { id: "warmwasser", apartment: "og", type: "wasser", metric: "warmwasser" },
            { id: "kaltwasser", apartment: "og", type: "wasser", metric: "kaltwasser" },
            { id: "gesamtwasser", apartment: "", type: "wasser", metric: "gesamtwasser" },
            { id: "enthaertungsanlage-druck", apartment: "", type: "wasser", metric: "druck-enthaertungsanlage" },

            // Heizung
            { id: "heizung-betriebsstunden", apartment: "", type: "heizung", metric: "betriebsstunden" },
            { id: "heizung-verbrauch", apartment: "", type: "heizung", metric: "verbrauch" },
            { id: "heizung-druck", apartment: "", type: "heizung", metric: "druck" },

            // Öl
            { id: "oel-zeiger", apartment: "", type: "oel", metric: "zeiger" },
            { id: "oel-meter", apartment: "", type: "oel", metric: "meter" },

            // Strom
            { id: "stromzaehler-ug", apartment: "ug", type: "strom", metric: "zaehler-ug" },
            { id: "stromzaehler-og", apartment: "og", type: "strom", metric: "zaehler-og" },
            { id: "solarstrom", apartment: "", type: "strom", metric: "solarstrom" },

            // Solar
            { id: "solarpumpe-laufzeit", apartment: "", type: "solar", metric: "laufzeit" },
            { id: "solarenergie", apartment: "", type: "solar", metric: "energie" },
            { id: "solarpumpe-druck", apartment: "", type: "solar", metric: "druck" },

            // UI

            // Zählergebühren Strom
            { id: "zaehlergebuehren-strom-og-lock", apartment: "og", type: "kosten", metric: "zaehlergebuehren-strom" },
            { id: "zaehlergebuehren-strom-ug-lock", apartment: "ug", type: "kosten", metric: "zaehlergebuehren-strom" },

            // Zählergebühren Wasser
            { id: "zaehlergebuehren-wasser-og-lock", apartment: "og", type: "kosten", metric: "zaehlergebuehren-wasser" },
            { id: "zaehlergebuehren-wasser-ug-lock", apartment: "ug", type: "kosten", metric: "zaehlergebuehren-wasser" },

            // Kilowatt Preis
            { id: "kilowatt-preis-og-lock", apartment: "og", type: "kosten", metric: "kilowatt-preis" },
            { id: "kilowatt-preis-ug-lock", apartment: "ug", type: "kosten", metric: "kilowatt-preis" },

            // Wasser Preis
            { id: "wasser-preis-og-lock", apartment: "og", type: "kosten", metric: "wasser-preis" },
            { id: "wasser-preis-ug-lock", apartment: "ug", type: "kosten", metric: "wasser-preis" },

            // Abwasser Preis
            { id: "abwasser-preis-og-lock", apartment: "og", type: "kosten", metric: "abwasser-preis" },
            { id: "abwasser-preis-ug-lock", apartment: "ug", type: "kosten", metric: "abwasser-preis" },

            // Öl Preis
            { id: "oel-preis-og-lock", apartment: "og", type: "kosten", metric: "oel-preis" },
            { id: "oel-preis-ug-lock", apartment: "ug", type: "kosten", metric: "oel-preis" },

            // Miete (nur UG)
            { id: "miete-ug-lock", apartment: "ug", type: "kosten", metric: "miete" }
        ];


        // ===============================
        // AUTO SAVE LOOP
        // ===============================
        for (const field of fields) {

            const $el = $("#" + field.id);

            let value;

            // Checkbox → state speichern
            if ($el.attr("type") === "checkbox") {
                let state = $el.is(":checked") ? 1 : 0;
                let val = null;
                if(!state){
                    val = $("#" + field.id.replace(/-lock$/, "")).val();
                }
                
                await DB.saveTimeEntry({
                    type: field.type,
                    apartment_id: field.apartment, // jetzt aus field
                    metric: field.metric,
                    state: state,
                    value: val,
                    date: dateStr
                });

            }
            // normale Inputs → value speichern
            else {
                let val = $el.val();
                await DB.saveTimeEntry({
                    type: field.type,
                    apartment_id: field.apartment, // jetzt aus field
                    metric: field.metric,
                    value: val,
                    date: dateStr
                });

            }
        }

        console.log("Alle Werte gespeichert");



    });

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


}