import { loadSidebar } from "../utils/sidebar.js";
import * as Helper from "../utils/helpers.js";
import { registerListeners } from "../database/databaseListener.js";

$(document).ready(async function () {
         await loadSidebar("database");


    registerListeners();
});

