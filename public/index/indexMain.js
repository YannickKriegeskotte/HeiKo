import * as DB from "../utils/database.js";
import { registerListeners } from "./indexListeners.js";

$(document).ready(async function () {








    await createFloorSection("og", "Obergeschoss");
    await createFloorSection("ug", "Untergeschoss");

    registerListeners();
});

async function createFloorSection(apartment, title) {

    $("#floor-sections").append(`
        <div class="floor-section" id="${apartment}-section">
            <div class="floor-header">
                <h2>${title}</h2>
                <span>Aktuelle Verbrauchsübersicht</span>
            </div>

            <div class="box-summaries">

                <div class="energy-box" id="${apartment}-energy-box">
                    <div class="top">
                        <img
                            class="bolt-icon"
                            src="../assets/bolt-solid-full.svg"
                            alt=""
                        />
                        <span>Strom</span>
                    </div>

                    <div class="value">
                        <strong>0</strong> kWh
                    </div>

                    <div class="bottom"></div>
                </div>

                <div class="water-box" id="${apartment}-water-box">
                    <div class="top">
                        <img
                            class="droplet-icon"
                            src="../assets/droplet-solid-full.svg"
                            alt=""
                        />
                        <span>Wasser</span>
                    </div>

                    <div class="value">
                        <strong>0</strong> L
                    </div>

                    <div class="bottom"></div>
                </div>

                <div class="oil-box" id="${apartment}-oil-box">
                    <div class="top">
                        <img
                            class="fire-icon"
                            src="../assets/fire-solid-full.svg"
                            alt=""
                        />
                        <span>Heizung</span>
                    </div>

                    <div class="value">
                        <strong>0</strong> L
                    </div>

                    <div class="bottom"></div>
                </div>

                <div class="cost-box" id="${apartment}-cost-box">
                    <div class="top">
                        <img
                            class="euro-icon"
                            src="../assets/euro.svg"
                            alt=""
                        />
                        <span>Kosten</span>
                    </div>

                    <div class="value">
                        <strong>0</strong> €
                    </div>

                    <div class="bottom"></div>
                </div>

            </div>
        </div>
    `);

    await updateStatBox(
        `#${apartment}-energy-box`,
        "verbrauch",
        apartment,
        "stromverbrauch-jahr",
        "kWh"
    );

    await updateStatBox(
        `#${apartment}-water-box`,
        "verbrauch",
        apartment,
        "wasserverbrauch-jahr",
        "L"
    );

    await updateStatBox(
        `#${apartment}-oil-box`,
        "verbrauch",
        apartment,
        "oelverbrauch-jahr",
        "L"
    );

    await updateStatBox(
        `#${apartment}-cost-box`,
        "kosten",
        apartment,
        "gesamt-kosten",
        "€"
    );
}

async function getYearComparison(type, apartment, metric) {

    const currentYearEntry =
        await DB.getLatestTimeEntry(type, apartment, metric);

    const currentYear =
        new Date(currentYearEntry.date).getFullYear();

    const lastYearEntry =
        await DB.getLatestTimeEntryByYear(
            type,
            apartment,
            metric,
            currentYear - 1
        );

    const currentYearData = currentYearEntry.value;
    const lastYearData = lastYearEntry.value;

    const changePercent =
        ((currentYearData - lastYearData) / lastYearData) * 100;

    return {
        currentData: currentYearData,
        previousData: lastYearData,
        change: changePercent
    };
}

async function updateStatBox(
    selector,
    type,
    apartment,
    metric,
    unit
) {

    const stats =
        await getYearComparison(
            type,
            apartment,
            metric
        );

    $(selector)
        .find(".value")
        .html(`<strong>${stats.currentData}</strong> ${unit}`);

    const cssClass =
        stats.change < 0
            ? "better-result"
            : "worse-result";

    const arrow =
        stats.change < 0
            ? "↘"
            : "↗";

    $(selector)
        .find(".bottom")
        .html(`
            <span class="comparison ${cssClass}">
                <strong>${arrow}</strong>
                ${stats.change.toFixed(1)}%
            </span>
            zum Vorjahr
            <div class="tooltip"></div>
        `);

    $(selector)
        .find(".comparison")
        .html(`
        <span class="${cssClass}">
            <strong>${arrow}</strong>
            ${stats.change.toFixed(1)}%
        </span>
    `);

    $(selector)
        .find(".tooltip")
        .text(`Vorjahr: ${stats.previousData}`);
}


/*

    let currentYear = null;
    let yearlyConsumption = 0;

    for (let i = 1; i < ogStromEntries.length; i++) {

        const currentEntry = ogStromEntries[i];
        const previousEntry = ogStromEntries[i - 1];

        const difference =
            Number(currentEntry.value) -
            Number(previousEntry.value);

        const year = new Date(currentEntry.date).getFullYear();

        if (currentYear === null) {
            currentYear = year;
        }

        // Jahr gewechselt → Vorjahr speichern
        if (year !== currentYear) {

            await DB.saveTimeEntry({
                type: "verbrauch",
                apartment_id: "og",
                metric: "stromverbrauch-jahr",
                value: yearlyConsumption,
                date: `${currentYear}-12-31`
            });

            currentYear = year;
            yearlyConsumption = 0;
        }

        yearlyConsumption += difference;

        await DB.saveTimeEntry({
            type: "verbrauch",
            apartment_id: "og",
            metric: "stromverbrauch-monat",
            value: difference,
            date: currentEntry.date
        });
        console.log("saved og month",currentEntry.date);
    }

    // letztes Jahr speichern
    if (currentYear !== null) {
        await DB.saveTimeEntry({
            type: "verbrauch",
            apartment_id: "og",
            metric: "stromverbrauch-jahr",
            value: yearlyConsumption,
            date: `${currentYear}-12-31`
        });
        console.log("saved og year",`${currentYear}-12-31`);
    }


    // UG
    currentYear = null;
    yearlyConsumption = 0;

    for (let i = 1; i < ugStromEntries.length; i++) {

        const currentEntry = ugStromEntries[i];
        const previousEntry = ugStromEntries[i - 1];

        const difference =
            Number(currentEntry.value) -
            Number(previousEntry.value);

        const year = new Date(currentEntry.date).getFullYear();

        if (currentYear === null) {
            currentYear = year;
        }

        // Jahr gewechselt → Vorjahr speichern
        if (year !== currentYear) {

            await DB.saveTimeEntry({
                type: "verbrauch",
                apartment_id: "ug",
                metric: "stromverbrauch-jahr",
                value: yearlyConsumption,
                date: `${currentYear}-12-31`
            });

            currentYear = year;
            yearlyConsumption = 0;
        }

        yearlyConsumption += difference;

        await DB.saveTimeEntry({
            type: "verbrauch",
            apartment_id: "ug",
            metric: "stromverbrauch-monat",
            value: difference,
            date: currentEntry.date
        });
        console.log("saved ug month",currentEntry.date);
    }

    // letztes Jahr speichern
    if (currentYear !== null) {
        await DB.saveTimeEntry({
            type: "verbrauch",
            apartment_id: "ug",
            metric: "stromverbrauch-jahr",
            value: yearlyConsumption,
            date: `${currentYear}-12-31`
        });
        console.log("saved ug year",`${currentYear}-12-31`);
    }

    */