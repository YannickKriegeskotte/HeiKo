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
        "strom",
        apartment,
        "gesamt-verbrauch",
        "kWh"
    );

    await updateStatBox(
        `#${apartment}-water-box`,
        "wasser",
        apartment,
        "gesamt-verbrauch",
        "L"
    );

    await updateStatBox(
        `#${apartment}-oil-box`,
        "heizung",
        apartment,
        "gesamt-verbrauch",
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