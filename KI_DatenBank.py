import sqlite3
import pandas as pd
def chatbot(user_input):
    Datei 'KI_Datenbank.db' wird erstellt unter storage/emulated/0/Datenbank/
    -- Datenbank öffnen:
sqlite3 KI_Datenbank.db

-- Tabellen anzeigen:
.tables

-- Struktur einer Tabelle anzeigen:
.schema tabellenname

-- Datensatz einfügen:
INSERT INTO tabellenname (spalte1, spalte2) VALUES ('wert1', 'wert2');

-- Datensätze abfragen:
SELECT * FROM tabellenname;

-- Tabelle exportieren:
.mode csv
.output export.csv
SELECT * FROM tabellenname;
.output stdout

conn = sqlite3.connect('ki_datenbank.db')
cursor = conn.cursor()
    response = get_response(user_input)
    if response:
        return response
    else:
         Sonst Internet-Recherche
        response = internet_search(user_input)
        save_interaction(user_input, response)
        return response
        
        Verbindung zur Datenbank herstellen
conn = sqlite3.connect('KI_Datenbank.db')
cursor = conn.cursor()

Tabelle für TTS-Stimmen anlegen
cursor.execute('
CREATE TABLE IF NOT EXISTS tts_voices (
    voice_id TEXT PRIMARY KEY,
    language_code TEXT,
    gender TEXT,
    voice_type TEXT,
    pitch_range INTEGER,
    speaking_rate_range FLOAT,
    volume_gain_db FLOAT,
    audio_formats TEXT,
    ssml_support BOOLEAN,
    long_audio_support BOOLEAN,
    audio_profiles TEXT,
    custom_voice BOOLEAN,
    last_updated DATETIME
))

Beispiel: Einfügen eines Datensatzes
cursor.execute(
INSERT INTO tts_voices (voice_id, language_code, gender, voice_type, pitch_range, speaking_rate_range, volume_gain_db, audio_formats, ssml_support, long_audio_support, audio_profiles, custom_voice, last_updated)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
', ('de-DE-Wavenet-F', 'de-DE', 'FEMALE', 'WaveNet', 20, 1.0, 0.0, 'MP3,OGG,Linear16', True, True, 'headphones,speakers', True))
        
         Daten auslesen und als DataFrame für KI verwenden
df = pd.read_sql_query('conn)
print(df)
 
 Beispiel-Dialog
frage = input("Du: ")
antwort = chatbot(frage)
print("Bot:", antwort)

def save_interaction(user_input, bot_response):
    cursor.execute("INSERT INTO chat_memory (user_input, bot_response) VALUES (?, ?)", (user_input, bot_response))
    conn.commit()

def get_response(user_input):
    cursor.execute("SELECT bot_response FROM chat_memory WHERE user_input = ?", (user_input,))
    result = cursor.fetchone()
    if result:
        return result[0]
    else:
        return None

db = {KI_Datenbank}
print('Welcome to the simplest key-value database')
while True:
    print('What do you want to do?')
    print('Enter P to [P]ut, G to [G]et or L to [L]ist')
    print('Or enter Q to [Q]uit')
    action = input()
    if action == 'P':
        k = input('Enter key: ')
        d = input('Enter data: ')
        db[k] = d
    elif action == 'G':
        k = input('Enter key: ')
        if not k in db:
            print('No such key')
        else:
            print('Your data: %s' % db[k])
    elif action == 'L':
        print('DB contents:')
        print(db)
    elif action == 'Q':
        print('Bye')
        break



conn.commit()
conn.close
