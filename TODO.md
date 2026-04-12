- Appearance Toggle lädt immer nur dunkles theme aus DB (erstmal weggelassen)
- Nach frischem laden der seite muss man 2x auf appearance toggel drücken für hellen modus (erstmal weggelassen)
- Appearance toggle auf andere seiten als index implementieren (angefangen) (erstmal weggelassen)

WICHTIG für Energy deploy version:



Nice to have, aber nicht relevant:


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

