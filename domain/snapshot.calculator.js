function calculateMonthlySnapshot(snapshot, prev) {
  console.log("domain calculateMonthlySnapshot");
  // -------------------------
  // KEIN VORMONAT
  // -------------------------
  if (prev === null) {
    snapshot.verbrauch = {
      og: {
        strom: 0,
        warmwasser: 0,
        kaltwasser: 0,
        gesamtwasser: 0,
      },
      ug: {
        strom: 0,
        gesamtwasser: 0,
      },
      oel: 0,
    };

    snapshot.produziert = {
      solarstrom: 0,
      solarwasserenergie: 0,
    };

    snapshot.laufzeit = {
      heizung: 0,
      solarpumpe: 0,
    };

    snapshot.kosten = {
      og: {
        strom: 0,
        wasser: 0,
        abwasser: 0,
      },
      ug: {
        strom: 0,
        wasser: 0,
        abwasser: 0,
      },
      oel: 0,
    };
  } else {
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
function calculateYearlySnapshot(snapshotDB, processedMonth, year) {
  console.log("domain calculateYearlySnapshot");
  
  let i=0;
  // Kein Vorjahr vorhanden
  if (snapshotDB == null) {
    snapshotDB = {
      year: year,
      ug: {
        kosten: {
          strom: 0,
          wasser: 0,
          abwasser: 0,
        },
        verbrauch: {
          strom: 0,
          wasser: 0,
        },
      },
      og: {
        kosten: {
          strom: 0,
          wasser: {
            warm: 0,
            kalt: 0,
            gesamt: 0,
          },
          abwasser: 0,
        },
        verbrauch: {
          strom: 0,
          wasser: {
            warm: 0,
            kalt: 0,
            gesamt: 0,
          },
        },
      },
      total: {
        kosten: {
          strom: 0,
          wasser: 0,
          abwasser: 0,
          oel: 0,
        },
        verbrauch: {
          strom: 0,
          wasser: 0,
          oel: 0,
        },
      },
      laufzeit: {
        heizung: 0,
        solarpumpe: 0,
      },
      produziert: {
        solarstrom: 0,
        solarwasserenergie: 0,
      },
    };
  }
  console.log(snapshotDB);
  // ===========================
  // UPDATE YEAR
  // ===========================
  i++;
  console.log(i);
  snapshotDB.ug.kosten.strom += num(processedMonth.kosten.ug.strom);
  i++;
  console.log(i);
  snapshotDB.ug.kosten.wasser += num(processedMonth.kosten.ug.wasser);
  i++;
  console.log(i);
  snapshotDB.ug.kosten.abwasser += num(processedMonth.kosten.ug.abwasser);

  i++;
  console.log(i);
  snapshotDB.ug.verbrauch.strom += num(processedMonth.verbrauch.ug.strom);
  i++;
  console.log(i);
  snapshotDB.ug.verbrauch.wasser += num(processedMonth.verbrauch.ug.gesamtwasser);

  i++;
  console.log(i);
  snapshotDB.og.kosten.strom += num(processedMonth.kosten.og.strom);
  // Später noch warm und kaltwasser trennen
  i++;
  console.log(i);
  snapshotDB.og.kosten.wasser.warm += num(processedMonth.kosten.og.wasser);
  i++;
  console.log(i);
  snapshotDB.og.kosten.wasser.kalt += num(processedMonth.kosten.og.wasser);
  i++;
  console.log(i);
  snapshotDB.og.kosten.wasser.gesamt += num(processedMonth.kosten.og.wasser);
  i++;
  console.log(i);
  snapshotDB.og.kosten.abwasser += num(processedMonth.kosten.og.abwasser);

  i++;
  console.log(i);
  snapshotDB.og.verbrauch.strom += num(processedMonth.verbrauch.og.strom);
  i++;
  console.log(i);
  snapshotDB.og.verbrauch.wasser.warm += num(processedMonth.verbrauch.og.warmwasser);
  i++;
  console.log(i);
  snapshotDB.og.verbrauch.wasser.kalt += num(processedMonth.verbrauch.og.kaltwasser);
  i++;
  console.log(i);
  snapshotDB.og.verbrauch.wasser.gesamt +=
    num(processedMonth.verbrauch.og.gesamtwasser);

  i++;
  console.log(i);
    snapshotDB.total.kosten.strom +=
    num(processedMonth.kosten.og.strom) + num(processedMonth.kosten.ug.strom);

  i++;
  console.log(i);
    snapshotDB.total.kosten.wasser +=
    num(processedMonth.kosten.og.wasser) + num(processedMonth.kosten.ug.wasser);

  i++;
  console.log(i);
    snapshotDB.total.kosten.abwasser +=
    num(processedMonth.kosten.og.abwasser) + num(processedMonth.kosten.ug.abwasser);

  i++;
  console.log(i);
    snapshotDB.total.kosten.oel += num(processedMonth.kosten.oel);

  i++;
  console.log(i);
  snapshotDB.total.verbrauch.strom +=
    num(processedMonth.verbrauch.og.strom) + num(processedMonth.verbrauch.ug.strom);

  i++;
  console.log(i);
    snapshotDB.total.verbrauch.wasser +=
    num(processedMonth.verbrauch.og.gesamtwasser) +
    num(processedMonth.verbrauch.ug.gesamtwasser);

  i++;
  console.log(i);
    snapshotDB.total.verbrauch.oel += num(processedMonth.verbrauch.oel);

  i++;
  console.log(i);
  snapshotDB.laufzeit.heizung += num(processedMonth.laufzeit.heizung);
  i++;
  console.log(i);
  snapshotDB.laufzeit.solarpumpe += num(processedMonth.laufzeit.solarpumpe);

  i++;
  console.log(i);
  snapshotDB.produziert.solarstrom += num(processedMonth.produziert.solarstrom);
  i++;
  console.log(i);
  snapshotDB.produziert.solarwasserenergie +=
    num(processedMonth.produziert.solarwasserenergie);

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
