import * as Helper from "../utils/helpers.js";

export async function registerListeners() {
    let allEntries = await DB.getAllTimeEntries();


    // Search
    $(document).on('input', '#search-input', function () {

        const search = $(this).val().toLowerCase();
       
    });


    // Save
    $(document).on('click', '#save-button', async function () {

    });

    // Input change listener für card class Marker
    $(document).on('input', '.db-data-input, .entry-id-input', async function (event) {
      
    });


    // === Input value scroll manipulation deaktivieren  === 
    $('input[type="number"]').on('wheel', function (event) {
     
    });
}