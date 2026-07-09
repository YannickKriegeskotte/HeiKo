- database seite
	- html
	- css
	- js
		- main
			-  alle yearly einträge laden
			- für jeden eintrag ein element erstellen
			- element inputs durchgehen, html-id = json-pfad, daten aus json in input laden
		- listener
			- suchen input
				- kurzer delay nach tippen, dass nicht jeder buchstabe einen call auslöst
				- jede yearly json auf suchstring filtern.
				- in noch übrigen den gesuchten string farblich highlighten
			- speichern knopf
				- gelöschte jahre sammeln und verarbeiten:
				- yearly eintrag löschen
				- alle monthly einträge mit jahr im datum löschen
				- gelöschte monate in noch übrigen jahren sammeln und verarbeiten:
				- datum von monat nehmen und in db löschen
				- yearly updaten
				- noch übrige veränderte monate sammeln und verarbeiten:
					- monthly snapshot in DB überschreiben
					- yearly snapshot aus DB holen
					- monat in yearly snapshot überschreiben
					- yearly snapshot neu berechnen, falls sich kosten/verbrauch werte ändern
					- yearly snapshot in DB überschreiben
				- seite neu laden mit search url praram von vorher
			- input felder
				- wenn verändert, gelben punkt an monat und jahr machen
				- monat in array speichern
			- löschen icon bei monat
				- monat in linker spalte rot markieren
			- löschen icon bei jahr
				- alle monate in jahr rot markieren und jahr leicht rötlich färben
- backend
	- controller
		- getAllYears()
		- deletemonth(yearMonth)
		- deleteyear(year)
	- service
		- getAllYears()
		- deletemonth(yearMonth)
			- repo.deletemonth(yearMonth)
			- removeFromYearly(yearMonth)
			- saveYearly(yearly)
		- deleteyear(year)
			- repo.deleteYear(year)
			- deleteMonthsFromMonthly(year)
	- repo
		- getAllYears()
		- deletemonth(yearMonth)
		- deleteYear(year)
	- route
		- getAllYears()
		- deletemonth(yearMonth)
		- deleteyear(year)



- snapshot template aus newMonthListener z. 123 entfernen

exe datei machen:
npm install -g pkg
pkg . --targets node18-win-x64 --output heiko.exe