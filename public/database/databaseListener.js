import * as DB from "../utils/database.js";
import * as Helper from "../utils/helpers.js";
import { renderEntries } from "./databaseMain.js";

export async function registerListeners() {
    let allEntries = await DB.getAllTimeEntries();


    // Search
    $(document).on('input', '#search-input', function () {

        const search = $(this).val().toLowerCase();
        // console.log("search", search);

        const filtered = allEntries.filter(entry => {

            return (
                String(entry.id ?? '').toLowerCase().includes(search) ||
                String(entry.type ?? '').toLowerCase().includes(search) ||
                String(entry.apartment_id ?? '').toLowerCase().includes(search) ||
                String(entry.metric ?? '').toLowerCase().includes(search) ||
                String(entry.value ?? '').toLowerCase().includes(search) ||
                String(entry.state ?? '').toLowerCase().includes(search) ||
                String(entry.date ?? '').toLowerCase().includes(search)
            );
        });
        $('#entry-amount').text(filtered.length + " Einträge");
        renderEntries(filtered);
    });


    // Save
    $(document).on('click', '#save-button', async function () {

        const updates = [];

        $('.entry-card.card-changed').each(function () {
            const $card = $(this);

            const data ={
                id: $card.data('id')
            };
            $card.find('input[data-field]').each(function () {
                data[$(this).data('field')] = $(this).val();
            });
            
            updates.push(data);
        });
        console.log("updates",updates);

        // Updates durchgehen und in DB speichern:
        for(const update of updates){
            await DB.saveTimeEntry(update);
        }





        // Daten neu aus DB holen
        allEntries = await DB.getAllTimeEntries();

        let filter = $('#search-input').val() || "";

        // Entries mit aktuellem Filter versehen,
        let filteredEntries = allEntries.filter(entry => {

            return (
                String(entry.id ?? '').toLowerCase().includes(filter) ||
                String(entry.type ?? '').toLowerCase().includes(filter) ||
                String(entry.apartment_id ?? '').toLowerCase().includes(filter) ||
                String(entry.metric ?? '').toLowerCase().includes(filter) ||
                String(entry.value ?? '').toLowerCase().includes(filter) ||
                String(entry.state ?? '').toLowerCase().includes(filter) ||
                String(entry.date ?? '').toLowerCase().includes(filter)
            );
        });

        // Alte cards aus html löschen
        $(".card").find(".entry-card").remove();
        // Und neu rendern
        renderEntries(filteredEntries);

        
    });

    // Input change listener für card class Marker
    $(document).on('input', '.db-data-input, .entry-id-input', async function (event) {
        if(!event.originalEvent) return;
        let $this = $(this);
        // Entry-card wird markiert
        $this.closest('.entry-card').addClass('card-changed');

        // Input bekommt visuelle markierung (gelber glow)
        $this.addClass('input-changed');

    });
}