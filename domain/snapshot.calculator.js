
function calculateMonthlySnapshot(snapshot, prev) {
  console.log("domain calculateMonthlySnapshot");

  // Gibt es einen Vormonat, werden die Werte berechnet.
  // Andernfalls bleiben die Template-Werte (0) erhalten.
  if (prev !== null) {
    calculateMonthlyConsumption(snapshot, prev);
    calculateMonthlyCost(snapshot);
  }

  return snapshot;
}

function calculateMonthlyConsumption(snapshot, prev) {
  console.log("domain calculateMonthlyConsumption");
  let i=0;
  // -------------------------
  // VERBRAUCH
  // -------------------------
  
  i++;
  console.log(i);
  snapshot.verbrauch.og.strom =
    num(snapshot.strom.og.zaehler) - num(prev.strom.og.zaehler);

  i++;
  console.log(i);
    snapshot.verbrauch.og.warmwasser =
    num(snapshot.wasser.og.warmwasserZaehler) -
    num(prev.wasser.og.warmwasserZaehler);

  i++;
  console.log(i);
    snapshot.verbrauch.og.kaltwasser =
    num(snapshot.wasser.og.kaltwasserZaehler) -
    num(prev.wasser.og.kaltwasserZaehler);

  i++;
  console.log(i);
    snapshot.verbrauch.og.gesamtwasser =
    snapshot.verbrauch.og.warmwasser + snapshot.verbrauch.og.kaltwasser;

  i++;
  console.log(i);
    snapshot.verbrauch.ug.strom =
    num(snapshot.strom.ug.zaehler) - num(prev.strom.ug.zaehler);

  i++;
  console.log(i);
    snapshot.verbrauch.ug.gesamtwasser =
    num(snapshot.wasser.gesamtwasserZaehler) -
    snapshot.verbrauch.og.gesamtwasser;

  i++;
  console.log(i);
    snapshot.verbrauch.oel =
    num(prev.oel.meter) + num(snapshot.oel.kaufmenge) - num(snapshot.oel.meter);

  // -------------------------
  // PRODUKTION
  // -------------------------

  i++;
  console.log(i);
  snapshot.produziert.solarstrom =
    num(snapshot.strom.solarstromZaehler) - num(prev.strom.solarstromZaehler);

  i++;
  console.log(i);
    snapshot.produziert.solarwasserenergie =
    num(snapshot.solarpumpe.energie) - num(prev.solarpumpe.energie);

  // -------------------------
  // LAUFZEIT
  // -------------------------

  i++;
  console.log(i);
  snapshot.laufzeit.heizung =
    num(snapshot.heizung.betriebsstundenZaehler) -
    num(prev.heizung.betriebsstundenZaehler);

  i++;
  console.log(i);
    snapshot.laufzeit.solarpumpe =
    num(snapshot.solarpumpe.laufzeit) - num(prev.solarpumpe.laufzeit);

  
}
function calculateMonthlyCost(snapshot) {
  console.log("domain calculateMonthlyCost");
  // -------------------------
  // KOSTEN (LOCKED SAFE)
  // -------------------------

  const g = snapshot.gebuehren;

  const stromPreisOG = getValue(g.og.kilowattPreis);
  const stromGebOG = getValue(g.og.zaehlergebuehrenStrom);

  const stromPreisUG = getValue(g.ug.kilowattPreis);
  const stromGebUG = getValue(g.ug.zaehlergebuehrenStrom);

  const wasserPreisOG = getValue(g.og.wasserPreis);
  const wasserPreisUG = getValue(g.ug.wasserPreis);

  const abwasserPreisOG = getValue(g.og.abwasserPreis);
  const abwasserPreisUG = getValue(g.ug.abwasserPreis);

  const wasserGebOG = getValue(g.og.zaehlergebuehrenWasser);
  const wasserGebUG = getValue(g.ug.zaehlergebuehrenWasser);

  const oelPreis = getValue(g.oelPreis);

  snapshot.kosten.og.strom = round2(
    snapshot.verbrauch.og.strom * stromPreisOG + stromGebOG / 12,
  );

  snapshot.kosten.ug.strom = round2(
    snapshot.verbrauch.ug.strom * stromPreisUG + stromGebUG / 12,
  );

  snapshot.kosten.og.wasser = round2(
    snapshot.verbrauch.og.gesamtwasser * wasserPreisOG + wasserGebOG / 12,
  );

  snapshot.kosten.ug.wasser = round2(
    snapshot.verbrauch.ug.gesamtwasser * wasserPreisUG + wasserGebUG / 12,
  );

  snapshot.kosten.og.abwasser = round2(
    snapshot.verbrauch.og.gesamtwasser * abwasserPreisOG + wasserGebOG / 12,
  );

  snapshot.kosten.ug.abwasser = round2(
    snapshot.verbrauch.ug.gesamtwasser * abwasserPreisUG + wasserGebUG / 12,
  );

  snapshot.kosten.oel = round2(snapshot.verbrauch.oel * oelPreis);
}

/**
 * 
 * @pjson snapshotDB 
 * @json processedMonth 
 * @returns json 
 */
async function calculateYearlySnapshot(snapshotDB, processedMonth, year) {
  console.log("domain calculateYearlySnapshot");

  const fs = require("fs").promises;

const yearlyTemplate = JSON.parse(
  await fs.readFile("../public/utils/yearly_snapshot_template.json", "utf8")
);

  // Neues Jahresobjekt wurde bereits anhand des Templates erzeugt
  // Falls keines vorhanden ist, muss lediglich year gesetzt werden.
  if (snapshotDB == null) {
    snapshotDB = yearlyTemplate;
  }

  // Monat aus YYYY-MM bestimmen
  const month = String(Number(processedMonth.yearMonth.split("-")[1]));

  // Metadaten aktualisieren
  snapshotDB.year = year;
  snapshotDB.lastAddedMonth = month;

  // Berechneten Monat übernehmen
  snapshotDB.months[month] = {
    ug: processedMonth.ug,
    og: processedMonth.og,
    total: processedMonth.total,
    laufzeit: processedMonth.laufzeit,
    produziert: processedMonth.produziert,
  };

  console.log("done");
  return snapshotDB;
}

// -------------------------
// HELPERS
// -------------------------
function num(v) {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

// locked-aware value reader
function getValue(field) {
  if (!field) return 0;
  return num(field.value);
}

function round2(v) {
  Math.round(v * 100) / 100;
}

module.exports = {
  calculateMonthlySnapshot,
  calculateYearlySnapshot,
};
