import * as DB from "../utils/database.js";
import * as Helper from "../utils/helpers.js";
import { registerListeners } from "../newMonth/newMonthListeners.js";

$(document).ready(function () {


    // Date input mit heutigem datum füllen
    $('#date-input').val(new Date().toISOString().split('T')[0]);


    // Checkbox states aus DB laden
    $(async function () {
        const entries = await DB.getLatestTimeByType("kosten");
        for(const entry of entries){
            const boxID = entry.metric + "-" + entry.apartment_id + "-lock";
            $(`#${boxID}`).prop("checked", entry.state === 1);
            if(entry.state){
                const inputID = entry.metric + "-" + entry.apartment_id;
                $(`#${inputID}`).prop('disabled', entry.state === 1);
                $(`#${inputID}`).css('background-color', entry.state === 1 ? '#6d6d6d' : '');
            }
        }
    });


    registerListeners();
});