project-root/
│
├── server.js
│   └── Einstiegspunkt der Anwendung
│       - database.js: Datenbank initialisieren
│       - schema.js: Schema erstellen
│       - app.js: App starten
│
├── app.js
│   └── Express-Konfiguration
│       - Middleware registrieren
│       - time.routes.js einbinden
│       - snapshot.routes.js einbinden
│       - ping.routes.js einbinden
│       - Static Files bereitstellen
│
├── db/
│   │
│   ├── database.js
│   │   └── SQLite-Verbindung erstellen und zurückgeben
│   │       - wird von server.js verwendet
│   │
│   └── schema.js
│       └── CREATE TABLE Statements
│           - time_series
│           - monthly_snapshot
│           - yearly_snapshot
│           - wird von server.js verwendet
│
├── routes/
│   │
│   ├── time.routes.js
│   │   └── Alle /time/* Endpunkte
│   │       - time.controller.js
│   │       - batch.controller.js
│   │
│   ├── snapshot.routes.js
│   │   └── Alle /snapshot/* Endpunkte
│   │       - snapshot.controller.js
│   │
│   └── ping.routes.js
│       └── Healthcheck (/ping)
│
├── controllers/
│   │
│   ├── time.controller.js
│   │   └── HTTP-Schicht für Zeitreihen
│   │       - req lesen
│   │       - time.service.js aufrufen
│   │       - res zurückgeben
│   │
│   ├── snapshot.controller.js
│   │   └── HTTP-Schicht für Snapshots
│   │       - req lesen
│   │       - snapshot.service.js aufrufen
│   │       - res zurückgeben
│   │
│   └── batch.controller.js
│       └── HTTP-Schicht für /time/save-batch
│           - req lesen
│           - batch.service.js aufrufen
│           - res zurückgeben
│
├── services/
│   │
│   ├── time.service.js
│   │   └── Fachlogik für time_series
│   │       - speichern
│   │       - laden
│   │       - suchen
│   │
│   │       verwendet:
│   │       - time.repo.js
│   │       - validation.js
│   │       - date.js
│   │
│   ├── calculation.service.js
│   │   └── Berechnungen
│   │       - Stromverbrauch
│   │       - Wasserverbrauch
│   │       - Ölverbrauch
│   │       - Kosten
│   │       - Jahreswerte
│   │       - Monatswerte
│   │
│   │       verwendet:
│   │       - time.repo.js
│   │       - snapshot.repo.js
│   │       - date.js
│   │
│   ├── snapshot.service.js
│   │   └── Snapshot-Logik
│   │       - Monthly erstellen
│   │       - Yearly erstellen
│   │       - laden
│   │       - löschen
│   │
│   │       verwendet:
│   │       - snapshot.repo.js
│   │       - time.repo.js
│   │       - date.js
│   │
│   └── batch.service.js
│       └── Gesamtprozess
│           - Rohdaten speichern
│           - Berechnungen ausführen
│           - Snapshots aktualisieren
│
│           verwendet:
│           - time.service.js
│           - calculation.service.js
│           - snapshot.service.js
│
├── repositories/
│   │
│   ├── time.repo.js
│   │   └── Direkte DB-Zugriffe für time_series
│   │       - INSERT
│   │       - UPDATE
│   │       - DELETE
│   │       - SELECT
│   │
│   │       verwendet:
│   │       - database.js
│   │
│   └── snapshot.repo.js
│       └── Direkte DB-Zugriffe für Snapshots
│           - monthly_snapshot
│           - yearly_snapshot
│           - INSERT
│           - UPDATE
│           - DELETE
│           - SELECT
│
│           verwendet:
│           - database.js
│
├── utils/
│   │
│   ├── date.js
│   │   └── Datums-Hilfsfunktionen
│   │       - Jahr extrahieren
│   │       - Monat extrahieren
│   │       - Datumsvergleich
│   │       - Formatierungen
│   │
│   └── validation.js
│       └── Validierungs-Hilfsfunktionen
│           - Pflichtfelder prüfen
│           - Datumsprüfung
│           - Zahlenprüfung
│           - Eingabekontrolle
│
├── public/
│   │
│   ├── index.html
│   │   └── Einstiegspunkt des Frontends
│   │
│   │       lädt:
│   │       - ui.js
│   │       - api.js
│   │       - helper.js
│   │
│   └── js/
│       │
│       ├── api.js
│       │   └── Frontend ↔ Backend Kommunikation
│       │       - fetch()
│       │       - saveTimeEntry()
│       │       - getTimeEntry()
│       │       - getPreviousEntry()
│       │       - saveSnapshot()
│       │       - getSnapshot()
│       │       - deleteSnapshot()
│       │
│       │       kommuniziert mit:
│       │       - time.routes.js
│       │       - snapshot.routes.js
│       │
│       ├── ui.js
│       │   └── Benutzeroberfläche
│       │       - Button Listener
│       │       - DOM Manipulation
│       │       - Formulare
│       │       - Tabellen
│       │       - Diagramme
│       │
│       │       verwendet:
│       │       - api.js
│       │       - helper.js
│       │
│       └── helper.js
│           └── Frontend Hilfsfunktionen
│               - Loader anzeigen
│               - Loader verstecken
│               - Formatierungen
│               - UI Utilities
│
└── data.db
    └── SQLite Datenbankdatei