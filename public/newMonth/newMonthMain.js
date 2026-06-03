import * as DB from "../utils/database.js";
import * as Helper from "../utils/helpers.js";
import { registerListeners } from "../newMonth/newMonthListeners.js";

$(document).ready(function () {


    // Date input mit heutigem datum füllen
    $('#date-input').val(new Date().toISOString().split('T')[0]);


    // Checkbox states aus DB laden
    $(async function () {

        const checkboxes = $("input[type=checkbox]").toArray();

        for (const el of checkboxes) {

            const $checkbox = $(el);
            const id = $checkbox.attr("id");

            const isLocked = await DB.getValueFromDB(id);

            console.log("DB Check Lock State", id, isLocked);

            if (isLocked == 1) {

                $checkbox.prop("checked", true);

                const $cell = $checkbox.closest('.cell');
                const $input = $cell.find('input[type=number]');

                $input.prop('disabled', true);
                $input.css('background-color', '#6d6d6d');
            }
        }
    });



    registerListeners();
});