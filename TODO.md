- Appearance Toggle lädt immer nur dunkles theme aus DB
- Nach frischem laden der seite muss man 2x auf appearance toggel drücken für hellen modus
- Appearance toggle auf andere seiten als index implementieren (angefangen)

- kostenberechnung (erstmal nur energy) kaputt, hier chattgpt prompt zur erinnerung:
ich habe folgende key-namen-struktur "apartment1electricityFee_5-1-2026", wobei die 1 nach apartment dynamisch ist, das "electricity" ebenfalls eine von mehreren dynamisch erzeugten sektionen ist, und natürlich das datum hinten, bestehent aus "tag-monat-jahr". hier mal noch andere beispiele, getrennt durch ";": "apartment2coldWaterMeterFee_3-12-2025;apartment2warmWaterMeterFee_3-12-2025;apartment2electricityMeterFee_31-01-2025". jetzt habe ich hier einen etwas längeren code, der die kosten anhand von konsum und besagten key-namen berechnen soll. problem: es wird aktuell vermutlich nicht der richtige werte gelsen. bitte beachte, dass es drei sektionen (energy, water, heating) gibt, die auf unterschiedliche arten behandelt werden müssen. wir fokusieren und jetzt erstmal auf den energy teil, also lass, falls möglich, den heating und water teil unverändert. die kosten bei energy setzen sich aus verbrauch*kosten-pro-kwh + zählergebühren/12 für jeden monat zusammen. jetzt gibt es aber den fall, dass es mehrer werte für die kwh-kosten gibt. dann wird etwas schwieriger. wenn ein monat zwischen zweier solcher einträge liegt, wird der wert des ältern genommen, da der neue ja noch nicht gilt. gibt es keinen neueren wert, wird ebenfalls der "aktuellste" wert genommen, da es keinen neueren gibt. liegt ein wert vor  allen einträgen, wird trotzdem der "älteste" genommen, da wir ja mit irgendwas rechnen müssen. ist das verständlich und logisch soweit?


- Graph Einstellungen (welche datensets ausgeblendet sind) irgendwie speichern und verwenden
- bei neuen inputeingaben soll sich der der jahresgraph sowie der gesamtgraph aktuallisieren

- datenbanktabelle alle löschen funktion => alle sichtbaren zeilen werden gelöscht
- datenbanktabelle größer als viewport, irgendwie die zellen in ihrer breite limitieren und zeilenumbrüche erzeugen


- für privat unrelevant: HT & NT Stromzähler beachten (Doppeltarifzähler)

exe datei machen:
npm install -g pkg
pkg . --targets node18-win-x64 --output heiko.exe


# Grobe Übersicht
Jede wohnung hat einen Stromzähler + zählergebühr (jährlich) + kwh gebühr (pro kwh immer)

Hauptwasserzähler (jährlich zählergebühr) hat jedes haus immer (zahlt jede wohnung die dranhängt, bei 2 wohnungen zahlt jeder hälfte)
Pro wohnung dann immer warm kalt (kann bei einfamilienhaus mit nur einer wohnung aber auch weg sein) (kann zählergebühren haben, wenn gemietet, kann aber auch gebührenfrei sein, wenn zähler gekauft)

"Abwasserzähler" = Gesamtwasserzähler
Preis pro liter wasser/abwasser ist gemeindengebunden, zahlt jede wohnung, die am gesamtzähler hängt (bei 2 wohnungen zahlt jeder die hälfte)


Solarthermie nur als info eingabefenster: wieviel kwh energie?

Wasserhärte nur als info eingabefenster.

Kundendienst info eingabefenster.

Wartungs/reparaturkosten würden bei mietwohnungen geteilt werden.


Öltanks können verbunden sein, müssen aber nicht. Überwiegend heutzutage verbunden

