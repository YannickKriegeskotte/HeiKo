
(- Apartments werden nicht gelöscht, wenn die Checkbox in der Heizungs-Sektion Deaktiviert wird.)

- Wenn Heizung Checkbox aktiviert, laden keine Apartments in Strom,Wasser und Heizungssektion
- Wenn Heizung Checkbox switched, Inputs toggeln aber Apartments verschwinden/erscheinen nicht

- Wenn Wasser Checkbox aktiv geladen wird, werden Inputs nicht ausgegraut (wenn Checkbox deaktiviert geladen wird, dann stimmt alles)

- Appearance Toggle lädt immer nur dunkles theme aus DB
- Nach frischem laden der seite muss man 2x auf appearance toggel drücken für hellen modus


- Appearance toggle auf andere seiten als index implementieren (angefangen)

- EnergyTable Name in Settings änderbar

- Graph Einstellungen (welche datensets ausgeblendet sind) irgendwie speichern und verwenden

- Kostenberechnung für energy

- ausklappen von jahrestabellen macht graph nicht sichtbar
- datenbanktabelle alle löschen funktion => alle sichtbaren zeilen werden gelöscht

- overviewgraph durch folgendes ersetzen: layered jahresgraphen. alle jahresgraphen für alle datensets in einem graph anzeigen.


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

