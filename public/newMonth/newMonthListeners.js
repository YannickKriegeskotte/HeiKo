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

        // ===== FELD-DEFINITION (Single Source of Truth) =====
        const requiredFields = [
            { key: 'date-input', selector: '#date-input', wrapper: 'body' },

            { key: 'warmwasser-input', selector: '#warmwasser-input' },
            { key: 'kaltwasser-input', selector: '#kaltwasser-input' },
            { key: 'gesamtwasser-input', selector: '#gesamtwasser-input' },
            { key: 'enthärtungsanlage-druck-input', selector: '#enthärtungsanlage-druck-input' },

            { key: 'heizung-betriebsstunden-input', selector: '#heizung-betriebsstunden-input' },
            { key: 'heizung-verbrauch-input', selector: '#heizung-verbrauch-input' },
            { key: 'heizung-druck-input', selector: '#heizung-druck-input' },

            { key: 'öl-zeiger-input', selector: '#öl-zeiger-input' },
            { key: 'öl-meter-input', selector: '#öl-meter-input' },

            { key: 'ug-stromzähler-input', selector: '#ug-stromzähler-input' },
            { key: 'og-stromzähler-input', selector: '#og-stromzähler-input' },
            { key: 'solarstrom-input', selector: '#solarstrom-input' },

            { key: 'laufzeit-solarpumpe-input', selector: '#laufzeit-solarpumpe-input' },
            { key: 'solarenergie-input', selector: '#solarenergie-input' },
            { key: 'solarpumpe-druck-input', selector: '#solarpumpe-druck-input' }
        ];


        // ===== VALIDIERUNG =====
        const missingField = requiredFields.find(field => {
            const value = $(field.selector).val();
            return value === null || value === undefined || value === '';
        });


        if (missingField) {

            console.log("Missing Field");

            const $input = $(missingField.selector);

            const $target = missingField.selector === '#date-input'
                ? $input
                : $input.closest('.input-wrapper');

            $('html, body').animate({
                scrollTop: $target.offset().top - 100
            }, 500);

            $target.addClass('input-error-animation');

            setTimeout(() => {
                $target.removeClass('input-error-animation');
            }, 1200);

            return;
        }


        // ===== SAVE Values =====
        for (const field of requiredFields) {

            const value = $(field.selector).val();

            console.log("DB Save Value", field.key, value);

            await DB.saveValueToDB(field.key, value);
        }

        // ===== SAVE Lock States =====
        $("input[type=checkbox]").each(async function () {
            let $this = $(this);
            let id = $this.attr("id");
            let isLocked = this.checked;
            if (isLocked) {
                isLocked = 1;
            }else{
                isLocked = 0;
            }
            console.log("DB Save Lock State", id, isLocked);
                await DB.saveValueToDB(id, isLocked);
        });



        console.log("Alle Werte korrekt gespeichert");
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