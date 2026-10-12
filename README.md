# Habit-Tracker API

Der Habit-Tracker ist eine REST-API, mit der registrierte Nutzer:innen eigene Gewohnheiten (Habits) anlegen, jeden Tag abhaken (Check-ins) und ihren Fortschritt über Streaks und eine Statistik verfolgen können.

Zielgruppe sind Einzelpersonen, die ihre Gewohnheiten digital verfolgen wollen. Die API wird von einem React-Frontend genutzt.


## Live-URL



- **Backend (API):** https://habit-tracker-api-z8ic.onrender.com
- **Frontend:** https://habit-tracker-api-main.onrender.com


## Datenmodell (ERD)

```mermaid
erDiagram
    USER ||--o{ HABIT : "besitzt"
    HABIT ||--o{ CHECKIN : "hat"

    USER {
        int id PK
        string email UK
        string passwordHash
        datetime createdAt
    }
    HABIT {
        int id PK
        string name
        string description
        string color
        int userId FK
        datetime createdAt
    }
    CHECKIN {
        int id PK
        date date
        int habitId FK
    }
```
## Beziehungen

Ein User hat viele Habits, jedes Habit gehört genau einem User (1:n).
Ein Habit hat viele Check-ins, jeder Check-in gehört genau einem Habit (1:n).

Regeln

Die E-Mail-Adresse eines Users ist eindeutig.
Pro Habit und Datum gibt es höchstens einen Check-in (Unique-Bedingung auf habitId und date).
Wird ein Habit gelöscht, werden auch seine Check-ins gelöscht (Cascade). Wird ein User gelöscht, werden auch seine Habits gelöscht.
Das Passwort wird nie im Klartext gespeichert, nur als bcrypt-Hash.
Ein Check-in ist ein reiner Kalendertag (ohne Uhrzeit), damit Zeitzonen das Datum nicht verschieben.
Die Streak wird nicht gespeichert, sondern aus den Check-ins berechnet. So gibt es keine widersprüchlichen Daten.


## Endpunkte

| Methode | Pfad | Zweck | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Konto erstellen | nein |
| POST | `/api/auth/login` | Einloggen, JWT erhalten | nein |
| GET | `/api/auth/me` | Eigene Daten abrufen | ja |
| GET | `/api/habits` | Eigene Habits mit aktueller Streak (`?search=`, `?page=`, `?limit=`) | ja |
| POST | `/api/habits` | Habit anlegen | ja |
| GET | `/api/habits/:id` | Ein Habit ansehen | ja |
| PATCH | `/api/habits/:id` | Habit ändern (Name, Beschreibung, Farbe) | ja |
| DELETE | `/api/habits/:id` | Habit löschen | ja |
| POST | `/api/habits/:id/checkins` | Für ein Datum abhaken | ja |
| GET | `/api/habits/:id/checkins` | Check-ins ansehen (`?from=&to=`) | ja |
| DELETE | `/api/habits/:id/checkins/:checkInId` | Check-in zurücknehmen | ja |
| GET | `/api/stats` |  Statistik für alle eigenen Habits (Check-ins gesamt, aktuelle und längste Streak) | ja |
| GET | `/api/health` | Prüfen, ob der Server läuft | nein |
| GET | `/api/stats/daily` | Tagesfortschritt in Prozent für die letzten Tage (?days=, ?to=) | ja |

## Beispiele für Anfragen und Antworten

### Registrieren

`POST /api/auth/register`

```json
{ "email": "anna@example.com", "password": "geheim1234" }
```

Antwort `201 Created`:

```json
{ "id": 1, "email": "anna@example.com" }
```

### Einloggen

`POST /api/auth/login`

```json
{ "email": "anna@example.com", "password": "geheim1234" }
```

Antwort `200 OK`:

```json
{ "token": "<JWT>" }
```

### Habit anlegen

`POST /api/habits` mit Header `Authorization: Bearer <JWT>`

```json
{ "name": "10 Minuten lesen", "description": "Vor dem Schlafen", "color": "#4F46E5" }
```

Antwort `201 Created`:

```json
{
  "id": 4,
  "name": "10 Minuten lesen",
  "description": "Vor dem Schlafen",
  "color": "#4F46E5",
  "streak": 0,
  "createdAt": "2026-09-30T09:15:00.000Z",
  "lastCheckIn": null
}
```

### Habits auflisten

`GET /api/habits?search=lesen&page=1&limit=10`

`limit` ist höchstens 50 (Standard 10). `search` sucht im Namen ohne Beachtung der Groß- und Kleinschreibung.

Antwort `200 OK`:

```json
{
  "items": [
    {
      "id": 4,
      "name": "10 Minuten lesen",
      "description": "Vor dem Schlafen",
      "color": "#4F46E5",
      "createdAt": "2026-10-05T09:15:00.000Z",
      "streak": 3,
      "lastCheckIn": "2026-10-07"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 1,
  "totalPages": 1
}
```

`streak` ist die Anzahl aufeinanderfolgender Tage mit Check-in bis heute. Ein Check-in von gestern hält die Streak am Leben.

### Statistik

`GET /api/stats`

Antwort `200 OK`:

```json
{
  "totalHabits": 1,
  "totalCheckIns": 5,
  "habits": [
    {
      "id": 4,
      "name": "10 Minuten lesen",
      "color": "#4F46E5",
      "totalCheckIns": 5,
      "currentStreak": 3,
      "longestStreak": 4
    }
  ]
}
```

### Tagesfortschritt

`GET /api/stats/daily?days=7`

`days` ist 1 bis 90 (Standard 7), `to` (optional, Format `JJJJ-MM-TT`) ist der letzte Tag. Ein Habit zählt ab seinem Erstellungstag. Tage ohne aktive Habits haben `percent: null` und gehen nicht in den Durchschnitt ein.

Antwort `200 OK` (gekürzt):

```json
{
  "days": 7,
  "averagePercent": 50,
  "items": [
    { "date": "2026-10-11", "completed": 1, "total": 2, "percent": 50 },
    { "date": "2026-10-12", "completed": 2, "total": 2, "percent": 100 }
  ]
}
```

### Abhaken

`POST /api/habits/4/checkins`

```json
{ "date": "2026-09-30" }
```

Antwort `201 Created`:

```json
{ "id": 12, "date": "2026-09-30", "habitId": 4 }
```

### Fehlerfälle

**400 Bad Request** (ungültige Eingabe, z. B. Name fehlt)

```json
{
  "error": "Validierungsfehler",
  "details": [{ "field": "name", "message": "Name ist erforderlich" }]
}
```

**401 Unauthorized** (Token fehlt, ungültig oder abgelaufen; auch bei falschem Login)

```json
{ "error": "Nicht authentifiziert" }
```

**404 Not Found** (Habit existiert nicht oder gehört einem anderen User)

```json
{ "error": "Habit nicht gefunden" }
```

**409 Conflict** (Check-in für dieses Datum existiert bereits, oder E-Mail bereits registriert)

```json
{ "error": "Für dieses Datum existiert bereits ein Check-in" }
```

**429 Too Many Requests** (Rate Limit bei Login oder Registrierung überschritten)

```json
{ "error": "Zu viele Anfragen. Bitte später erneut versuchen." }
{ "error": "Anfrage zu groß" }
```
**500 Internal Server Error** (unerwarteter Fehler, ohne interne Details)

```json
{ "error": "Interner Serverfehler" }
```


## Authentifizierung und Autorisierung

**Authentifizierung (Wer bist du?)**

- Beim Registrieren wird das Passwort mit bcrypt gehasht und nur der Hash gespeichert.
- Beim Login wird das Passwort gegen den Hash geprüft. Bei Erfolg erhält der Client ein JWT, das die User-ID enthält und nach begrenzter Zeit abläuft.
- Der Client schickt das Token bei jeder geschützten Anfrage im Header `Authorization: Bearer <Token>`.
- Eine Auth-Middleware prüft Signatur und Ablaufzeit des Tokens und stellt die User-ID für die Controller bereit.

**Autorisierung (Was darfst du?)**

- Jeder User darf nur seine eigenen Habits und deren Check-ins sehen und ändern.
- Jede Datenbankabfrage filtert zusätzlich nach der `userId` aus dem Token.
- Fremde oder nicht vorhandene Ressourcen führen zu `404`, damit nicht erkennbar ist, welche IDs existieren.

## Tech-Stack

| Technologie | Wofür | Begründung |
|---|---|---|
| Node.js + Express | Webserver und Routing | Im Kurs gelernt, schlank, große Community, passt gut zu einem React-Frontend (beides JavaScript) |
| PostgreSQL | Datenbank | Relationale Datenbank passt zu den klaren Beziehungen User, Habit, CheckIn; Fremdschlüssel und Unique-Bedingungen sichern die Datenintegrität |
| Prisma | ORM | Typsichere Abfragen, Migrationen, das Schema dient zugleich als Dokumentation des Datenmodells |
| JWT + bcrypt | Authentifizierung | Zustandslos, gut für eine API mit getrenntem Frontend; bcrypt speichert Passwörter sicher als Hash |
| Zod | Validierung | Schemas beschreiben erlaubte Eingaben klar und liefern verständliche Fehlermeldungen |
| helmet, cors, express-rate-limit | Sicherheit | Sichere HTTP-Header, gezielte Freigabe für das Frontend, Schutz vor Missbrauch bei Login und Registrierung |
| Jest + Supertest | Tests | Integrationstests gegen die echten Endpunkte, ohne einen Port zu öffnen |
| React (Vite),React Router, Axios, Tailwind CSS | Frontend | Komponentenbasiert, schnell einzurichten,Axios-Interceptor hängt das Token automatisch an |
| Render | Deployment | Backend, Datenbank und Frontend an einem Ort bereitstellbar |


## Sicherheit

**Umgesetzt**

- Validierung aller Eingaben mit Zod, E-Mail-Adressen werden bereinigt
- Geschützte Routen nur mit gültigem JWT, Besitzer-Prüfung in jeder Abfrage
- CORS nur für die Adressen aus `CORS_ORIGIN`
- Rate Limiting: Login und Registrierung höchstens 10 Anfragen pro 15 Minuten und IP, übrige API höchstens 300
- Zentrale Fehlerbehandlung ohne Stacktraces oder interne Details, Größenlimit von 10 KB für Anfragen
- `helmet` für sichere HTTP-Header, HTTPS im Deployment, Geheimnisse nur in Umgebungsvariablen

**Nicht relevant**

- CSRF-Schutz: Das Token wird im `Authorization`-Header gesendet und nicht in einem Cookie.
- Datei-Uploads: Die API nimmt keine Dateien entgegen.

**Bekannte Einschränkungen**

- Das Frontend speichert das Token im `localStorage`. Bei einer XSS-Lücke wäre es auslesbar. Eine Alternative wären HttpOnly-Cookies mit CSRF-Schutz.
- Der Zähler des Rate Limiters liegt im Arbeitsspeicher und gilt pro Instanz.

## Deployment

Das Projekt läuft auf Render als drei getrennte Dienste: PostgreSQL-Datenbank, Backend (Web Service, Root Directory `backend`) und Frontend (Static Site, Root Directory `frontend`). Zugangsdaten stehen nur als Umgebungsvariablen im Render-Dashboard. Beim Build des Backends werden die Migrationen mit `prisma migrate deploy` angewendet. Die kostenlose Datenbank ist befristet.

## Installation und Start

Voraussetzungen: Node.js (aktuelle LTS-Version) und eine lokal laufende PostgreSQL-Datenbank.

### Backend

1. Datenbank `habit_tracker` in PostgreSQL anlegen.
2. In den Ordner `backend/` wechseln und Pakete installieren:
```bash
   cd backend
   npm install
```
3. `backend/.env.example` nach `backend/.env` kopieren und die Werte eintragen (siehe Abschnitt Konfiguration).
4. Migrationen auf die Datenbank anwenden:
```bash
   npx prisma migrate dev
```
5. Server starten:
```bash
   npm run dev
```
   Die API läuft auf `http://localhost:3000`. Zum Prüfen: `http://localhost:3000/api/health`.

### Frontend

1. In den Ordner `frontend/` wechseln und Pakete installieren:
```bash
   cd frontend
   npm install
```
2. `frontend/.env.example` nach `frontend/.env` kopieren.
3. Starten:
```bash
   npm run dev
```
   Das Frontend läuft auf `http://localhost:5173`. Das Backend muss dabei laufen.

## Konfiguration


### Backend (`backend/.env`)

| Variable | Bedeutung | Beispiel |
|---|---|---|
| `PORT` | Port des Servers | `3000` |
| `DATABASE_URL` | Verbindung zur PostgreSQL-Datenbank | `postgresql://BENUTZER:PASSWORT@localhost:5432/habit_tracker?schema=public` |
| `JWT_SECRET` | Geheimer Schlüssel zum Signieren der Tokens (lang und zufällig) | `ein_langer_zufaelliger_wert` |
| `JWT_EXPIRES_IN` | Gültigkeit der Tokens | `1h` |
| `CORS_ORIGIN` | Erlaubte Frontend-Adressen, mit Komma getrennt, ohne Schrägstrich am Ende | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Bedeutung | Beispiel |
|---|---|---|
| `VITE_API_URL` | Adresse der API inklusive `/api` | `http://localhost:3000/api` |

Echte Zugangsdaten gehören nur in die `.env`-Dateien, die nicht im Repository liegen. Im Repository stehen nur die Vorlagen `.env.example`.

## Tests


Die Integrationstests laufen gegen eine eigene Datenbank.

1. Datenbank `habit_tracker_test` in PostgreSQL anlegen.
2. `backend/.env.test.example` nach `backend/.env.test` kopieren und die Zugangsdaten eintragen.
3. Im Ordner `backend/` ausführen:
```bash
   npm test
```

Vor dem Testlauf werden die Migrationen automatisch auf die Testdatenbank angewendet, vor jedem Test wird die Datenbank geleert. Der Testlauf bricht ab, wenn der Datenbankname nicht auf `_test` endet.

Getestet werden Erfolgsfälle, ungültige Eingaben, Authentifizierung, die Besitzer-Prüfung (ein Nutzer kann Daten eines anderen weder lesen, ändern noch löschen), Check-ins, Streak-Berechnung und Statistik.