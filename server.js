require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { google } = require('googleapis');
const opn = require('open');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;
app.use(cors());

// --- ICD-11 API Setup ---
const TOKEN_URL = 'https://icdaccessmanagement.who.int/connect/token';
const clientId = process.env.ICD11_CLIENT_ID;
const clientSecret = process.env.ICD11_CLIENT_SECRET;

if (!clientId || !clientSecret) {
    console.error("FATALER FEHLER: ICD11_CLIENT_ID oder ICD11_CLIENT_SECRET nicht gefunden.");
    process.exit(1);
}

let accessToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
    if (accessToken && Date.now() < tokenExpiresAt) {
        return accessToken;
    }
    console.log('Fordere neues ICD-11 Access Token an...');
    try {
        const response = await axios.post(TOKEN_URL, new URLSearchParams({
            'grant_type': 'client_credentials', 'client_id': clientId,
            'client_secret': clientSecret, 'scope': 'icdapi_access'
        }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
        
        accessToken = response.data.access_token;
        tokenExpiresAt = Date.now() + (response.data.expires_in - 300) * 1000; 
        console.log('ICD-11 Token erfolgreich erhalten.');
        return accessToken;
    } catch (error) {
        console.error('Fehler beim Abrufen des ICD-11 Access Tokens:', error.response?.data || error.message);
        throw new Error('Authentifizierung mit der ICD-11 API fehlgeschlagen.');
    }
}

const getApiHeaders = (token) => ({
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Accept-Language': 'de',
    'API-Version': 'v2'
});

app.get('/api/icd11-info', async (req, res) => {
    const { uri } = req.query;
    if (!uri) {
        return res.status(400).json({ message: 'URI query parameter is required.' });
    }
    try {
        const token = await getAccessToken();
        console.log(`Rufe Details für URI ab: ${uri}`);
        const response = await axios.get(uri, { headers: getApiHeaders(token) });
        res.json(response.data);
    } catch (error) {
        console.error(`Fehler bei URI ${uri}:`, error.message);
        res.status(error.response?.status || 500).json({ 
            message: `Konnte Daten für URI nicht abrufen: ${uri}.`,
            details: error.response?.data || 'Serverfehler'
        });
    }
});

// --- Google Calendar API Setup ---
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = 'http://localhost:3001/auth/google/callback';
const GOOGLE_TOKEN_PATH = path.join(__dirname, 'google-token.json');

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// **NEU**: Event-Listener, um aktualisierte Tokens automatisch zu speichern
oauth2Client.on('tokens', (tokens) => {
  try {
    let currentTokens = {};
    // Lese bestehende Tokens, um den Refresh-Token nicht zu verlieren
    if (fs.existsSync(GOOGLE_TOKEN_PATH)) {
      const existingTokenData = fs.readFileSync(GOOGLE_TOKEN_PATH, 'utf8');
      currentTokens = JSON.parse(existingTokenData);
    }
    // Update mit neuen Werten
    currentTokens.access_token = tokens.access_token;
    currentTokens.expiry_date = tokens.expiry_date;
    // Speichere den Refresh-Token nur, wenn er neu ist
    if (tokens.refresh_token) {
      currentTokens.refresh_token = tokens.refresh_token;
      console.log('Neuen Refresh-Token erhalten.');
    }
    fs.writeFileSync(GOOGLE_TOKEN_PATH, JSON.stringify(currentTokens));
    console.log('Google-Token in Datei aktualisiert.');
  } catch (err) {
    console.error("Konnte erneuerten Google-Token nicht speichern:", err);
  }
});


// Lade Tokens beim Start, wenn sie existieren
try {
  if (fs.existsSync(GOOGLE_TOKEN_PATH)) {
    const tokenData = fs.readFileSync(GOOGLE_TOKEN_PATH, 'utf8');
    if (tokenData) {
      const tokens = JSON.parse(tokenData);
      oauth2Client.setCredentials(tokens);
      console.log('Google-Token erfolgreich aus Datei geladen.');
    }
  }
} catch (err) {
  console.error('Fehler beim Laden/Parsen der google-token.json. Datei wird ignoriert.', err);
  // Optional: Datei bei Fehler löschen, um einen sauberen Neustart zu erzwingen
  // fs.unlinkSync(GOOGLE_TOKEN_PATH); 
}

// Endpunkt 1: Startet den Authentifizierungsprozess
app.get('/auth/google', (req, res) => {
  const scopes = ['https://www.googleapis.com/auth/calendar.readonly'];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });
  opn(url);
  res.send('Authentifizierung gestartet. Bitte prüfen Sie Ihren Browser.');
});

// Endpunkt 2: Callback nach der Google-Zustimmung
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens); // Dies löst den 'tokens'-Listener aus
    res.send('Authentifizierung erfolgreich! Sie können dieses Fenster schließen.');
  } catch (error) {
    console.error('Fehler bei der Google-Authentifizierung:', error);
    res.status(500).send('Authentifizierung fehlgeschlagen.');
  }
});

// Funktion, um zu prüfen, ob der Client authentifiziert ist
async function ensureAuthenticated(req, res, next) {
    if (!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
        return res.status(401).json({ 
            message: 'Nicht bei Google authentifiziert.',
            reauthUrl: 'http://localhost:3001/auth/google'
        });
    }
    // Die Logik hier ist vereinfacht, da der 'tokens' Event-Listener und die interne Logik
    // der `googleapis` Bibliothek das meiste Token-Management übernehmen.
    next();
}


// Endpunkt 3: Sucht den nächsten Termin für eine Chiffre
app.get('/api/calendar/nextevent', ensureAuthenticated, async (req, res) => {
  const { chiffre } = req.query;
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      q: chiffre,
      timeMin: new Date().toISOString(),
      maxResults: 1,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const event = response.data.items[0];
    if (event) {
      res.json({
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        summary: event.summary,
      });
    } else {
      res.status(404).json({ message: 'Kein zukünftiger Termin für diese Chiffre gefunden.' });
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Kalender-Events:', error.message);
    res.status(500).json({ message: 'Fehler beim Abrufen der Kalenderdaten.', details: error.message });
  }
});

// Endpunkt 4: Holt vergangene Termine zur Abrechnung
app.get('/api/calendar/past-events', ensureAuthenticated, async (req, res) => {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: sixtyDaysAgo.toISOString(),
      timeMax: new Date().toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });
    res.json(response.data.items || []);
  } catch (error) {
    console.error('Fehler beim Abrufen vergangener Kalender-Events:', error.message);
    res.status(500).json({ message: 'Fehler beim Abrufen der Kalenderdaten.', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
  if (!fs.existsSync(GOOGLE_TOKEN_PATH)) {
      console.log('WICHTIG: Um den Kalender zu verbinden, rufen Sie im Browser auf: http://localhost:3001/auth/google');
  }
});
