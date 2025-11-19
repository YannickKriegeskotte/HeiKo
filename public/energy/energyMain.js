import * as DB from "../utils/database.js";
import * as Helper from "../utils/helpers.js";

$(document).ready(async function () {

    // aktuelles jahr bekommen
    let date = Helper.getDate();
    date = date.getFullYear();

    //leere tabelle mit jahres IDs erzeugen
    createTable(date);

    // suche in DB nach allen Einträgen, die mit "{aktuellem jahr}_table" beginnen und speichere sie in array
    let matches = DB.getAllKeysContaining(`${date}_table`);

    // jeden eintrag aus array in tabelle eintragen, was nicht vorhanden ist, war nicht in DB




    async function createTable(year) {
        const apartmentCount = await DB.getValueFromDB('apartmentcount');

        $('.generalAnnualTableContainer').append(`
       <div class="annualTableContainer" id="${year}_tableContainer">
        <div class="annualTableHeaderContainer" id="${year}_tableHeaderContainer">
          <img class="tableCollapseIcon" src="../assets/caret-down-solid-full.svg">
          <h2 id="${year}_tableHeaderH2">2025</h2>
          <img class="tableSettingsIcon" src="../assets/sliders-solid-full.svg">
        </div>
        <table>
          <thead>
          <tr>
          <th>Datum</th>
          </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      </div>    
    `);


        for (let apartment = 1; apartment <= apartmentCount; apartment++) {
            // Apartmentname in DB?
            // Wenn ja, dann den nehmen, ansonsten fallback Wert
            let displayname;
            let aptname = await DB.getValueFromDB(`apartment${apartment}name`);
            if (aptname === null) {
                displayname = `Wohnung ${apartment}`;
            }
            else {
                displayname = aptname;
            }

            $(`#${year}_tableContainer thead tr`).append(`
                <th>Zählerstand ${displayname}</th>
                <th>Verbrauch ${displayname}</th>
                <th>Kosten ${displayname}</th>
        `);
        }


        for (let i = 1; i <= 12; i++) {
            let rowHTML = '<tr>';
            rowHTML += `<td><input type="text" id="${year}_tableDate${i}"></td>`;

            for (let apartment = 1; apartment <= apartmentCount; apartment++) {
                let aptMeterCount;
                let aptConsumption;
                let aptCost;

                aptMeterCount = await DB.getValueFromDB(`${year}_tableMeterCount${i}_apartment${apartment}`);
                aptConsumption = await DB.getValueFromDB(`${year}_tableConsumption${i}_apartment${apartment}`);
                aptCost = await DB.getValueFromDB(`${year}_tableCost${i}_apartment${apartment}`);


                if (aptMeterCount === null) {
                    // input mit leerem value schreiben
                    aptMeterCount = "";
                }

                if (aptConsumption === null) {
                    aptConsumption = "";
                }

                if (aptCost === null) {
                    aptCost = "";
                }
                rowHTML += `<td><input type="text" id="${year}_tableMeterCount${i}_apartment${apartment}" value="${aptMeterCount}"></td>`;
                rowHTML += `<td><input type="text" id="${year}_tableConsumption${i}_apartment${apartment}" value="${aptConsumption}"></td>`;
                rowHTML += `<td><input type="text" id="${year}_tableCost${i}_apartment${apartment}" value="${aptCost}"></td>`;
            }

            rowHTML += '</tr>';
            $(`#${year}_tableContainer tbody`).append(rowHTML);
        }
    }



    /*
        function makeOverviewGraph(){
        const ctx = document.getElementById('overviewChart');
    
        // find all yearTablePrefix in db (2019_yeartable, 2020_yeartable, 2021_yeartable,...)
        // get last entry from every found yearTablePrefix
    
        new Chart(ctx, {
            type: 'line', // line, bar, pie, doughnut, radar, ...
            data: {
                labels: ['Jan', 'Feb', 'Mrz', 'Apr', 'Mai', 'Jun'],
                datasets: [{
                    label: 'OG',
                    data: [5, 10, 15, 20, 45, 70],
                    borderWidth: 5
                },
                {
                    label: 'UG',
                    data: [5, 10, 20, 30, 40, 50],
                    borderWidth: 5
                }]
            }
        });
        }
    */


});