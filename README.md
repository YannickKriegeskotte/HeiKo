# Versionsverlauf (SemVer)

Das Projekt besteht aus **drei technologischen Entwicklungsphasen**:

- **Phase 0:** Reines JSON-Speichersystem  
  - Keine automatische Speicherung  
  - Jede Anzeige im Browser erfordert JSON-Import  
  - Export nur durch manuelles Schreiben der JSON
  
- **Phase 1:** IndexedDB als automatische lokale Datenbank  
  - JSON wird nur noch für Import/Export zwischen Geräten genutzt  
  - Alle Daten im Browser werden automatisch gespeichert und geladen

- **Phase 2:** „HeiKo“ – HTTP-Server + SQL + .db-Datei  
  - Alle Daten werden sofort persistent in einer SQL-Datenbank gespeichert  
  - Import/Export erfolgt durch Austausch der .db-Datei  
  - Browser liest und schreibt direkt über den lokalen Server


---

# Phase 0 – JSON-only (manuelles Import/Export)

### 0.1.0
- Initialer Commit (alles basiert auf JSON-Import/Export)

### 0.2.0
- Feature: Wohnungsnamen (Apartments können benannt werden)

### 0.3.0
- QoL: JSON wird beim Laden der Seite eingelesen

### 0.3.1
- Bugfix: Logik für das Laden/Speichern von Eingabefeldern überarbeitet

### 0.4.0
- Feature: Checkbox-Status wird in JSON gespeichert

### 0.5.0
- Feature: Einstellungen werden über JSON vollständig gespeichert und geladen

### 0.6.0
- Feature: JSON Import/Export als offizielle Funktion

### 0.6.1
- Fix: JSON-Import speichert nun korrekt in interne Struktur

### 0.7.0
- QoL: Code modularisiert, aufgeräumt, Struktur verbessert

### 0.7.1
- Fix: Key-Namen erhalten Datum/ID zur Versionssicherung

### 0.8.0-alpha
- WIP: Zeitstempelbasierte IDs für mehrere Werte


---

# Phase 1 – IndexedDB + JSON als Backup

### 1.0.0
- Umstieg auf IndexedDB als persistente Datenbank

### 1.1.0
- Feature: Daten werden automatisch aus IndexedDB geladen

### 1.2.0
- QoL: IndexedDB speichert alle Eingaben automatisch

### 1.2.1
- Bugfix: Werte werden korrekt mit IndexedDB synchronisiert

### 1.3.0
- Feature: Checkbox-Status in IndexedDB

### 1.4.0
- Feature: Einstellungsseite vollständig in IndexedDB integriert

### 1.5.0
- Feature: JSON-Import/Export synchronisiert Werte zwischen Geräten

### 1.5.1
- Fix: Import speichert korrekt in IndexedDB

### 1.6.0
- QoL: Code neu organisiert, Ordnerstruktur vorbereitet

### 1.6.1
- Fix: IndexedDB-Key-Namen erweitert (Timestamp)

### 1.7.0-alpha
- WIP: Timestamp-IDs für mehrere gespeicherte Werte


---

# Phase 2 – HeiKo (HTTP-Server + SQL + .db-Datei)

### 2.0.0
- Neustart des Projekts („HeiKo“)  
- HTTP-Server auf Port 3000  
- SQL-Datenbank angebunden  
- Seite wird dynamisch aufgebaut

### 2.1.0
- Initiale DB-Interaktion für Text-/Zahlfelder  
- Werte werden beim Fokusverlust gespeichert

### 2.2.0
- Werte werden korrekt geladen, abgeglichen und gespeichert  
- IDs aller Eingaben werden initial an die DB gesendet

### 2.3.0
- Datenbank-UI (CRUD) hinzugefügt  
- Backend-Endpunkte `/getAll` und `/delete`  
- Wasserlogik integriert  
- Apartmentcount-Fix  
- Laden und Aktualisieren optimiert

### 2.4.0
- UI überarbeitet  
- Checkbox-Toggle refaktoriert  
- Neues Stylesheet  
- Konsolenlogs bereinigt

### 2.5.0
- Frontend optimiert  
- Server-Erreichbarkeitstest eingebaut  
- (Bug: Apartments werden noch nicht entfernt beim Deaktivieren der Heizungs-Checkbox)

### 2.6.0
- Feature: DB-Backtracking  
- Feature: Timestamp-Keys

### 2.7.0
- Datenbank-Manipulationstabelle fertiggestellt

### 2.8.0
- Themenbasierte Navigation  
- Dark-Mode-Toggle (in DB & localStorage gespeichert)  
- HTML & CSS überarbeitet

### 2.9.0
- Dateien organisiert, neue main.js-Struktur

### 2.10.0
- Feature: Jahrestabelle (Grundversion)  
- Tabellen laden dynamisch basierend auf aktuellem Jahr

### 2.10.1
- Fix: Theme-Toggle deaktiviert wegen Fehlern

### 2.11.0
- Feature: Tabellen & Graphen  
  - Automatische Erstellung  
  - Laden  
  - Speichern  
  - Ein-/Ausklappbar

### 2.12.0
- Feature: Automatische Verbrauchsberechnung in Jahrestabellen

### 2.13.0
- Feature: Suchfunktion in der Datenbanktabelle

### 2.14.0
- Feature: Jahresgraphen aktualisieren sich automatisch bei neuen Eingaben

### 2.14.1
- Fix: Zählerstände aus Graphen entfernt

### 2.14.2
- Fix: Einklappbare Tabellen speichern ihren Zustand in der Datenbank

---

# Aktuelle Version
**2.14.2**
