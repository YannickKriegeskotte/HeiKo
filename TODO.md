newMonthListener:
- wasserzählergebühren (gesamtzähler haus) geteilte kosten im haus oder jeder zahlt vollpreis
- was ist solarstrom => solaranlage (strom) energie

- warmwasser + kaltwasser kosten trennen (json struktur auf inkonsitenz prüfen) und bei warmwasser noch potentielle heizkosten addieren

- json struktur so gut wie möglich auslagern um inkonsitenzen in struktur zu vermeiden.


zwischenstand:
index seite lädt aktuellen und vorherigen yearly snapshot, verwertet die jeweiligen metric werte, passt die pfeile und farben an. gibt die werte ins html ab.
newmonth ans neue json layout angepasst, lädt template und füllt dann erst mit daten. übergibt gefülltes template ans backend.


noch offen:
- yearly update überarbeiten, um das neue layout zu akzeptieren (FUNKTION: addMonthToYear)

datenbank seite:
überarbeiten


exe datei machen:
npm install -g pkg
pkg . --targets node18-win-x64 --output heiko.exe