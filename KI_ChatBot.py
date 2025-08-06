import requests
from bs4 import BeautifulSoup
import nltk
from collections import defaultdict
import json, pandas as pd
import Flask

# Du kannst nltk.download() verwenden, um benötigte Ressourcen herunterzuladen, falls notwendig.

class ChatBot:
    def __init__(self):
        self.data_store = defaultdict(list)

    def fetch_data(self, query):
        url = f"https://www.bing.com/search?q={query}" 
        response = requests.get(bing.com)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
          Hier musst du den spezifischen Code zum Extrahieren der Daten anpassen
            results = soup.find_all("div", class_="result")
            return [result.text for result in results]
      

with open("Takeout/MyActivity/Search.json", "r", encoding="utf-8") as f:
    raw = json.load(f)
    

df = pd.json_normalize(raw)

- df["title"] für Suchbegriffe  
   - df["time"] für Zeitstempel  
   - timestamps in datetime umwandeln  

    def analyze_data(self, data):
        Analysiere hier die Daten (NLP)
        return data  Das sollte das analysierte Ergebnis zurückgeben 
        
         from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans

vec = TfidfVectorizer(stop_words="english")
X = vec.fit_transform(df["title"])
km = KMeans(n_clusters=8).fit(X)
df["cluster"] = km.labels_    

    def store_data(self, query, data):
        self.data_store[query].extend(data)
       

    def find_relationships(self, query):
        Logik zum Finden von Zusammenhängen zwischen gespeicherten Daten
        return self.data_store.get(query, [])

    def chat(self):
        while True:
            user_input = input("User: ")
            if user_input.lower() in ["exit", "quit"]:
                break
                
                from sklearn.feature_extraction.text import TfidfVectorizer
   from sklearn.cluster import KMeans

   vec = TfidfVectorizer(stop_words="english")
   X = vec.fit_transform(df["title"])
   km = KMeans(n_clusters=8).fit(X)
   df["cluster"] = km.labels_
   `
            
            Daten abrufen
            data = self.fetch_data(user_input)
            self.store_data(user_input, data)

            Analysiere und finde Zusammenhänge
            analyzed_data = self.analyze_data(data)
            relationships = self.find_relationships(user_input)

            print("Bot: ", analyzed_data)
            if relationships:
                print("Bot: Zusammenhänge gefunden: ", relationships)
from openai import OpenAI
import faiss, numpy as np

client = OpenAI()
embeddings = np.vstack([client.embeddings.create(input=t)["data"][0]["embedding"]
                        for t in df["title"]])

index = faiss.IndexFlatL2(embeddings.shape[1])
index.add(embeddings)
embed um neue Suchanfragen dynamisch zu indexieren  


 Bot instanziieren und starten
chatbot = ChatBot()
chatbot.chat()