import * as DB from "../utils/database.js";
import * as Helper from "../utils/helpers.js";
export function registerListeners() {
    const date = Helper.getDate();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();





    // === Buttons === 
    $(document).on('click', 'button.save-button', async function () {
       console.log("Klick");
    });
}