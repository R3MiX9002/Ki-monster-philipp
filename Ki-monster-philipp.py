import React, { useState, useRef, useEffect } from 'react';
import { Search, Image, Video, FileText, Zap, Settings, Minimize2, Square, X, RefreshCw } from 'lucide-react';

const PhilippMultimediaBot = () => {
  const [activeFunction, setActiveFunction] = useState('search');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [generatedContent, setGeneratedContent] = useState('');
  const [windowMinimized, setWindowMinimized] = useState(false);
  const chatContainerRef = useRef(null);

  const functions = {
    search: { icon: Search, name: 'Recherche-Synthesizer', color: '#4A90E2' },
    visual: { icon: Image, name: 'Visual Creator 1K+', color: '#7ED321' },
    video: { icon: Video, name: 'Video Producer', color: '#F5A623' },
    textanim: { icon: FileText, name: 'Text-Animations', color: '#9013FE' },
    bilanimate: { icon: Zap, name: 'Bild-zu-Animation', color: '#FF6B6B' }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            { 
              role: "user", 
              content: `Führe eine strukturierte Recherche zu folgendem Thema durch: "${searchQuery}". 
              
              Erstelle eine Zusammenfassung mit:
              1. Haupterkenntnisse (3-5 Punkte)
              2. Aktuelle Entwicklungen
              3. Relevante Quellen
              4. Praktische Anwendungen
              
              Format: Strukturiert und prägnant für schnelle Übersicht.`
            }
          ]
        })
      });
      
      const data = await response.json();
      setGeneratedContent(data.content[0].text);
    } catch (error) {
      console.error('Fehler bei der Recherche:', error);
      setGeneratedContent('Fehler bei der Recherche. Bitte versuchen Sie es erneut.');
    }
    setIsLoading(false);
  };

  const handleGenerate = async (functionType) => {
    setIsLoading(true);
    const prompts = {
      visual: "Erstelle ein detailliertes Konzept für ein hochwertiges 1K+ Bild mit folgenden Spezifikationen: Auflösung mindestens 1920x1080, moderne Ästhetik, und optimiert für Web-Verwendung.",
      video: "Entwickle ein Konzept für ein 1-3 Minuten Video mit Storyboard, technischen Spezifikationen und Produktions-Timeline.",
      textanim: "Entwerfe ein Text-Animations-Konzept mit kinetic typography, timing-Details und technischer Umsetzung.",
      bilanimate: "Analysiere die Möglichkeiten zur Bild-Animation und erstelle eine detaillierte Beschreibung der Bewegungsabläufe."
    };

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [
            { 
              role: "user", 
              content: `Als Philipp's ${functions[functionType].name}: ${prompts[functionType]}
              
              Basis-Anfrage: "${searchQuery || 'Allgemeines Konzept'}"
              
              Erstelle eine professionelle, detaillierte Spezifikation gemäß den technischen Standards.`
            }
          ]
        })
      });
      
      const data = await response.json();
      setGeneratedContent(data.content[0].text);
    } catch (error) {
      console.error('Fehler bei der Generierung:', error);
      setGeneratedContent('Fehler bei der Content-Generierung. Bitte versuchen Sie es erneut.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [generatedContent]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-4 font-segoe">
      {/* Vista Aero Window */}
      <div className={`mx-auto max-w-6xl transition-all duration-300 ${windowMinimized ? 'h-12' : 'h-[90vh]'}`}>
        {/* Window Title Bar */}
        <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-t-lg px-4 py-2 flex items-center justify-between border border-slate-500 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-inner"></div>
            <span className="text-white font-semibold text-sm">Philipp's Multimedia Bot - Vista Edition</span>
          </div>
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => setWindowMinimized(!windowMinimized)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <Minimize2 className="w-4 h-4 text-white" />
            </button>
            <button className="p-1 hover:bg-white/20 rounded transition-colors">
              <Square className="w-4 h-4 text-white" />
            </button>
            <button className="p-1 hover:bg-red-500/50 rounded transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {!windowMinimized && (
          <div className="bg-white/10 backdrop-blur-md border-x border-b border-slate-300/50 rounded-b-lg shadow-2xl h-full flex">
            {/* Sidebar */}
            <div className="w-64 bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-4 border-r border-slate-400/30">
              <div className="text-white mb-6">
                <h2 className="text-lg font-bold mb-2">Funktionen</h2>
                <p className="text-xs text-slate-300">Multimedia Content Creator</p>
              </div>
              
              <div className="space-y-2">
                {Object.entries(functions).map(([key, func]) => {
                  const IconComponent = func.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveFunction(key)}
                      className={`w-full p-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                        activeFunction === key
                          ? 'bg-white/20 border border-white/30 shadow-lg'
                          : 'hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" style={{ color: func.color }} />
                      <span className="text-white text-sm font-medium">{func.name}</span>
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-8 p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
                <h3 className="text-white text-sm font-semibold mb-2">Status</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-slate-300 text-xs">Online & Ready</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Search Bar */}
              <div className="p-4 bg-gradient-to-r from-white/20 to-white/10 border-b border-slate-300/30">
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Geben Sie Ihre Anfrage ein..."
                      className="w-full px-4 py-2 bg-white/20 backdrop-blur-sm border border-slate-300/50 rounded-lg 
                               text-white placeholder-slate-300 focus:outline-none focus:border-blue-400/50 
                               focus:bg-white/30 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg 
                             hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all 
                             shadow-lg border border-blue-400/50 flex items-center space-x-2"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Suchen</span>
                  </button>
                  <button
                    onClick={() => handleGenerate(activeFunction)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg 
                             hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 transition-all 
                             shadow-lg border border-purple-400/50"
                  >
                    Generate
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-4 overflow-hidden">
                <div 
                  ref={chatContainerRef}
                  className="h-full bg-white/5 backdrop-blur-sm rounded-lg border border-slate-300/30 
                           p-4 overflow-y-auto shadow-inner"
                >
                  {generatedContent ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 border border-blue-400/30">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <span className="text-white font-semibold text-sm">
                            {functions[activeFunction].name} - Ergebnis
                          </span>
                        </div>
                        <div className="text-white/90 whitespace-pre-wrap text-sm leading-relaxed">
                          {generatedContent}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-300 mt-20">
                      <div className="mb-4">
                        {React.createElement(functions[activeFunction].icon, {
                          className: "w-16 h-16 mx-auto opacity-50",
                          style: { color: functions[activeFunction].color }
                        })}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {functions[activeFunction].name}
                      </h3>
                      <p className="text-sm max-w-md mx-auto leading-relaxed">
                        Geben Sie eine Anfrage ein oder klicken Sie auf "Generate" für ein Konzept 
                        basierend auf der aktuellen Funktion.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vista Taskbar Element */}
      <div className="fixed bottom-4 left-4">
        <div className="bg-slate-800/80 backdrop-blur-md rounded-lg px-4 py-2 border border-slate-600/50 shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded shadow-inner"></div>
            <span className="text-white text-sm font-medium">Philipp Bot</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhilippMultimediaBot;