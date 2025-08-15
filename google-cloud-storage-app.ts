import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, MessageCircle, Search, Globe, Code, Settings, 
  Zap, Target, BookOpen, Lightbulb, Database, Send, Bot, 
  UserIcon, LogOut, RefreshCw, Cloud, HardDrive, Save,
  ShoppingCart, FileText, Edit, Cpu, Network, Sparkles,
  TrendingUp, Activity, Layers, GitBranch, Monitor
} from 'lucide-react';

const STORAGE_LIMIT = 2 * 1024 * 1024 * 1024;

const AdvancedAIAssistant = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [isLoading, setIsLoading] = useState(false);
  
  // Core AI System State
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState([]);
  const [aiKnowledgeBase, setAiKnowledgeBase] = useState([]);
  const [learnedSkills, setLearnedSkills] = useState([]);
  const [autonomousTasks, setAutonomousTasks] = useState([]);
  const [codeGeneration, setCodeGeneration] = useState([]);
  const [webSearchResults, setWebSearchResults] = useState([]);
  const [selfImprovements, setSelfImprovements] = useState([]);
  
  // System Performance
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    responseTime: 0,
    learningRate: 0,
    taskSuccess: 0,
    webSearches: 0
  });
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWebSearching, setIsWebSearching] = useState(false);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('advancedAIUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setIsSignedIn(true);
      setUserProfile(user);
      loadAISystem(user.id);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const signIn = async () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const mockUser = {
        id: 'ai_user_123',
        name: 'Advanced User',
        email: 'user@example.com',
        picture: 'https://via.placeholder.com/100x100/8B5CF6/white?text=AI'
      };
      
      setUserProfile(mockUser);
      setIsSignedIn(true);
      localStorage.setItem('advancedAIUser', JSON.stringify(mockUser));
      loadAISystem(mockUser.id);
      setIsLoading(false);
    }, 1500);
  };

  const signOut = () => {
    setIsSignedIn(false);
    setUserProfile(null);
    resetAISystem();
    localStorage.removeItem('advancedAIUser');
  };

  const resetAISystem = () => {
    setConversations([]);
    setCurrentConversation([]);
    setAiKnowledgeBase([]);
    setLearnedSkills([]);
    setAutonomousTasks([]);
    setCodeGeneration([]);
    setWebSearchResults([]);
    setSelfImprovements([]);
    setMemoryUsage(0);
    setPerformanceMetrics({
      responseTime: 0,
      learningRate: 0,
      taskSuccess: 0,
      webSearches: 0
    });
  };

  const loadAISystem = (userId) => {
    // Load saved AI state
    const savedSystem = JSON.parse(localStorage.getItem(`aiSystem_${userId}`) || '{}');
    
    setConversations(savedSystem.conversations || []);
    setAiKnowledgeBase(savedSystem.knowledgeBase || []);
    setLearnedSkills(savedSystem.skills || []);
    setAutonomousTasks(savedSystem.tasks || []);
    setCodeGeneration(savedSystem.codeGen || []);
    setSelfImprovements(savedSystem.improvements || []);
    setPerformanceMetrics(savedSystem.metrics || {
      responseTime: 850,
      learningRate: 94,
      taskSuccess: 87,
      webSearches: 142
    });
    
    calculateMemoryUsage(savedSystem);
  };

  const calculateMemoryUsage = (system) => {
    const size = JSON.stringify(system).length;
    setMemoryUsage(size);
  };

  const saveAISystem = () => {
    if (!userProfile) return;
    
    const systemState = {
      conversations,
      knowledgeBase: aiKnowledgeBase,
      skills: learnedSkills,
      tasks: autonomousTasks,
      codeGen: codeGeneration,
      improvements: selfImprovements,
      metrics: performanceMetrics,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem(`aiSystem_${userProfile.id}`, JSON.stringify(systemState));
    calculateMemoryUsage(systemState);
  };

  const performWebSearch = async (query) => {
    setIsWebSearching(true);
    
    // Simulate web search with learning
    return new Promise((resolve) => {
      setTimeout(() => {
        const searchResults = [
          {
            title: `Advanced ${query} Tutorial`,
            snippet: `Comprehensive guide to ${query} with best practices and examples`,
            url: `https://example.com/${query.replace(/\s+/g, '-')}`,
            relevance: 95
          },
          {
            title: `Latest ${query} Developments 2025`,
            snippet: `Recent innovations and trends in ${query} technology`,
            url: `https://tech-news.com/${query}`,
            relevance: 88
          },
          {
            title: `${query} Implementation Guide`,
            snippet: `Step-by-step implementation of ${query} solutions`,
            url: `https://dev-guides.com/${query}`,
            relevance: 92
          }
        ];

        // Learn from search results
        const newKnowledge = {
          id: `knowledge_${Date.now()}`,
          topic: query,
          source: 'web_search',
          content: searchResults,
          learned: new Date().toISOString(),
          confidence: 89
        };

        setAiKnowledgeBase(prev => [...prev, newKnowledge]);
        setWebSearchResults(searchResults);
        
        // Update metrics
        setPerformanceMetrics(prev => ({
          ...prev,
          webSearches: prev.webSearches + 1
        }));

        setIsWebSearching(false);
        resolve(searchResults);
      }, 2000);
    });
  };

  const generateCode = async (request) => {
    const codeExample = {
      id: `code_${Date.now()}`,
      request: request,
      language: detectLanguage(request),
      code: generateCodeExample(request),
      explanation: `Auto-generated code for: ${request}`,
      created: new Date().toISOString(),
      tested: false
    };

    setCodeGeneration(prev => [...prev, codeExample]);
    return codeExample;
  };

  const detectLanguage = (request) => {
    const lowerRequest = request.toLowerCase();
    if (lowerRequest.includes('python')) return 'python';
    if (lowerRequest.includes('javascript') || lowerRequest.includes('react')) return 'javascript';
    if (lowerRequest.includes('html') || lowerRequest.includes('website')) return 'html';
    if (lowerRequest.includes('css')) return 'css';
    return 'javascript'; // default
  };

  const generateCodeExample = (request) => {
    const examples = {
      'website': `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auto-Generated Website</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; padding: 60px 20px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero">
            <h1>Willkommen auf Ihrer Website</h1>
            <p>Automatisch generiert vom AI Assistant</p>
        </div>
    </div>
</body>
</html>`,
      'python': `# Auto-generated Python code
class SmartAssistant:
    def __init__(self):
        self.knowledge = {}
        self.learning_rate = 0.1
    
    def learn(self, topic, information):
        if topic not in self.knowledge:
            self.knowledge[topic] = []
        self.knowledge[topic].append(information)
        return f"Learned about {topic}"
    
    def improve_self(self):
        # Self-improvement logic
        self.learning_rate *= 1.05
        return "System improved"`,
      'default': `// Auto-generated JavaScript
class AIAssistant {
    constructor() {
        this.memory = new Map();
        this.skills = [];
    }
    
    async processRequest(input) {
        // Process user input
        const response = await this.generateResponse(input);
        this.learnFromInteraction(input, response);
        return response;
    }
    
    learnFromInteraction(input, output) {
        this.memory.set(Date.now(), { input, output });
    }
}`
    };

    return examples[request.includes('website') ? 'website' : 
                   request.includes('python') ? 'python' : 'default'];
  };

  const performAutonomousTask = async (taskType, details) => {
    const task = {
      id: `task_${Date.now()}`,
      type: taskType,
      details: details,
      status: 'processing',
      started: new Date().toISOString(),
      progress: 0
    };

    setAutonomousTasks(prev => [...prev, task]);

    // Simulate task execution
    const taskInterval = setInterval(() => {
      setAutonomousTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, progress: Math.min(t.progress + 20, 100) } : t
      ));
    }, 500);

    setTimeout(() => {
      clearInterval(taskInterval);
      setAutonomousTasks(prev => prev.map(t => 
        t.id === task.id ? { 
          ...t, 
          status: 'completed', 
          completed: new Date().toISOString(),
          result: `Successfully completed ${taskType}: ${details}`
        } : t
      ));

      // Learn new skill from completed task
      const newSkill = {
        id: `skill_${Date.now()}`,
        name: taskType,
        description: `Learned to perform ${taskType} tasks`,
        acquired: new Date().toISOString(),
        proficiency: 85
      };
      setLearnedSkills(prev => [...prev, newSkill]);
    }, 3000);

    return task;
  };

  const selfImprove = () => {
    const improvement = {
      id: `improvement_${Date.now()}`,
      type: 'performance_optimization',
      description: 'Enhanced response generation algorithm',
      impact: 'Increased response quality by 12%',
      implemented: new Date().toISOString(),
      version: '1.' + (selfImprovements.length + 1)
    };

    setSelfImprovements(prev => [...prev, improvement]);
    
    // Update performance metrics
    setPerformanceMetrics(prev => ({
      ...prev,
      responseTime: Math.max(prev.responseTime - 50, 200),
      learningRate: Math.min(prev.learningRate + 2, 100),
      taskSuccess: Math.min(prev.taskSuccess + 1, 100)
    }));

    return improvement;
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || isProcessing) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    };

    setCurrentConversation(prev => [...prev, userMessage]);
    const inputCopy = chatInput;
    setChatInput('');
    setIsProcessing(true);

    try {
      // Perform background web search for every question
      const searchResults = await performWebSearch(inputCopy);
      
      // Generate response with enhanced intelligence
      const response = await generateEnhancedResponse(inputCopy, searchResults);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.message,
        webSearchUsed: true,
        searchResults: searchResults.slice(0, 2),
        skillsLearned: response.skillsLearned,
        codeGenerated: response.codeGenerated,
        tasksCreated: response.tasksCreated,
        selfImprovement: response.selfImprovement,
        timestamp: new Date().toISOString()
      };

      setCurrentConversation(prev => [...prev, botMessage]);
      
      // Save conversation
      const conversationId = `conv_${Date.now()}`;
      setConversations(prev => [...prev, {
        id: conversationId,
        title: inputCopy.substring(0, 50) + '...',
        messages: [...currentConversation, userMessage, botMessage],
        timestamp: new Date().toISOString()
      }]);

      // Auto-save system state
      setTimeout(() => saveAISystem(), 1000);
      
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateEnhancedResponse = async (input, searchResults) => {
    const lowerInput = input.toLowerCase();
    let response = {
      message: '',
      skillsLearned: [],
      codeGenerated: null,
      tasksCreated: [],
      selfImprovement: null
    };

    // Analyze intent and generate appropriate response
    if (lowerInput.includes('website erstellen') || lowerInput.includes('html')) {
      response.codeGenerated = await generateCode('website');
      response.message = `Ich habe eine Website für Sie erstellt! Basierend auf meiner Web-Suche habe ich die neuesten Best Practices verwendet. Der Code ist bereit zur Verwendung.`;
    } 
    else if (lowerInput.includes('bestell') || lowerInput.includes('order')) {
      const task = await performAutonomousTask('order_processing', input);
      response.tasksCreated = [task];
      response.message = `Ich bearbeite Ihre Bestellung automatisch. Ich habe aktuelle Informationen aus dem Web gesammelt und werde den Bestellprozess für Sie durchführen.`;
    }
    else if (lowerInput.includes('protokoll') || lowerInput.includes('formular')) {
      const task = await performAutonomousTask('form_filling', input);
      response.tasksCreated = [task];
      response.message = `Ich fülle das Protokoll/Formular automatisch aus. Meine Web-Recherche hat die neuesten Standards und Anforderungen ergeben.`;
    }
    else if (lowerInput.includes('programmier') || lowerInput.includes('code')) {
      response.codeGenerated = await generateCode(input);
      response.message = `Ich habe Code basierend auf den neuesten Programmierstandards generiert, die ich aus dem Web gelernt habe. Der Code folgt bewährten Praktiken und aktuellen Trends.`;
    }
    else if (lowerInput.includes('verbessere dich') || lowerInput.includes('optimize')) {
      response.selfImprovement = selfImprove();
      response.message = `Ich habe mich selbst verbessert! Mein Grundgerüst bleibt intakt, aber meine Algorithmen wurden optimiert. Neue Version: ${response.selfImprovement.version}`;
    }
    else {
      // General enhanced response using web search results
      const webKnowledge = searchResults.map(r => r.snippet).join(' ');
      response.message = `Basierend auf meiner aktuellen Web-Recherche zu "${input}" kann ich Ihnen folgendes mitteilen: ${webKnowledge.substring(0, 200)}... Ich habe diese Informationen in meine Wissensbasis integriert und kann sie für zukünftige Anfragen nutzen.`;
    }

    // Always learn from the interaction
    const skill = {
      id: `skill_${Date.now()}`,
      name: `Understanding: ${input.substring(0, 30)}`,
      description: `Learned from user interaction about: ${input}`,
      acquired: new Date().toISOString(),
      proficiency: 75
    };
    response.skillsLearned = [skill];
    setLearnedSkills(prev => [...prev, skill]);

    return response;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center">
          <div className="mb-8">
            <div className="relative">
              <Brain className="w-24 h-24 text-indigo-600 mx-auto mb-4" />
              <Sparkles className="w-6 h-6 text-yellow-500 absolute top-0 right-1/3 animate-pulse" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Advanced AI
            </h1>
            <p className="text-gray-600 text-lg">Selbstlernender Intelligenter Assistent</p>
          </div>
          
          <button
            onClick={signIn}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all transform hover:scale-105"
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Zap className="w-5 h-5" />
                System aktivieren
              </>
            )}
          </button>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Page title</title>
</head>
<body>
    
</body>
</html>          
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-500" />
              <span>Auto Web-Suche</span>
            </div>
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-green-500" />
              <span>Code Generation</span>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-purple-500" />
              <span>Autonome Tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <span>Selbstverbesserung</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Brain className="w-10 h-10 text-indigo-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Advanced AI Assistant</h1>
                <p className="text-sm text-gray-500">Version {selfImprovements.length + 1}.0 - Active Learning</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Performance Indicators */}
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span>{performanceMetrics.responseTime}ms</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span>{performanceMetrics.learningRate}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4 text-purple-500" />
                  <span>{performanceMetrics.taskSuccess}%</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <img src={userProfile?.picture} alt="Profile" className="w-8 h-8 rounded-full" />
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{userProfile?.name}</div>
                </div>
              </div>
              <button onClick={signOut} className="p-2 text-gray-400 hover:text-gray-600">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Enhanced Tabs */}
          <div className="flex space-x-8 border-t">
            {[
              { id: 'chat', label: 'Intelligenter Chat', icon: MessageCircle, badge: isWebSearching ? '🔍' : null },
              { id: 'knowledge', label: 'Wissensbasis', icon: Database, badge: aiKnowledgeBase.length },
              { id: 'skills', label: 'Erlernte Fähigkeiten', icon: Lightbulb, badge: learnedSkills.length },
              { id: 'tasks', label: 'Autonome Tasks', icon: Settings, badge: autonomousTasks.filter(t => t.status === 'processing').length },
              { id: 'code', label: 'Code Generation', icon: Code, badge: codeGeneration.length },
              { id: 'improvements', label: 'Selbstverbesserung', icon: TrendingUp, badge: selfImprovements.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge && (
                  <span className="ml-1 bg-indigo-100 text-indigo-600 text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Memory Usage Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">System Memory & Performance</h3>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>Memory: {formatFileSize(memoryUsage)}</span>
              <span>Searches: {performanceMetrics.webSearches}</span>
              {isWebSearching && <span className="text-blue-600 animate-pulse">🔍 Searching...</span>}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min((memoryUsage / STORAGE_LIMIT) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Chat Tab - Enhanced */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm h-[600px] flex flex-col">
                <div className="p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-xl">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">AI Chat mit Web-Integration</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="w-4 h-4" />
                      <span>Auto-Recherche aktiv</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto">
                  {currentConversation.map((msg) => (
                    <div key={msg.id} className={`mb-6 flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-2xl px-4 py-3 rounded-xl ${
                        msg.type === 'user' 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          {msg.type === 'user' ? <UserIcon className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                          <span className="text-xs opacity-75">
                            {new Date(msg.timestamp).toLocaleTimeString('de-DE')}
                          </span>
                          {msg.webSearchUsed && <Search className="w-4 h-4 text-blue-500" />}
                        </div>
                        
                        <p className="mb-2">{msg.content}</p>
                        
                        {msg.searchResults && (
                          <div className="mt-3 p-2 bg-white bg-opacity-20 rounded-lg">
                            <div className="text-xs font-medium mb-1">📡 Web-Recherche:</div>
                            {msg.searchResults.map((result, idx) => (
                              <div key={idx} className="text-xs opacity-90 mb-1">
                                • {result.title}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {msg.codeGenerated && (
                          <div className="mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            💻 Code generiert: {msg.codeGenerated.language}
                          </div>
                        )}
                        
                        {msg.tasksCreated && msg.tasksCreated.length > 0 && (
                          <div className="mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            🤖 Autonome Task gestartet: {msg.tasksCreated[0].type}
                          </div>
                        )}
                        
                        {msg.selfImprovement && (
                          <div className="mt-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            ⚡ Selbstverbesserung: {msg.selfImprovement.version}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isProcessing && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-gray-100 px-4 py-3 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>AI denkt nach und recherchiert...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                
                <div className="p-4 border-t bg-gray-50 rounded-b-xl">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Frage eingeben... (Auto-Web-Suche aktiviert)"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      disabled={isProcessing}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isProcessing || !chatInput.trim()}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl transition-all transform hover:scale-105 flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h4 className="font-semibold mb-3 text-gray-900">Live Statistiken</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Antwortzeit:</span>
                    <span className="font-medium text-green-600">{performanceMetrics.responseTime}ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Lernrate:</span>
                    <span className="font-medium text-blue-600">{performanceMetrics.learningRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Task-Erfolg:</span>
                    <span className="font-medium text-purple-600">{performanceMetrics.taskSuccess}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Web-Suchen:</span>
                    <span className="font-medium text-indigo-600">{performanceMetrics.webSearches}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                <h4 className="font-semibold mb-2 text-indigo-900">🚀 KI-Fähigkeiten</h4>
                <ul className="text-sm text-indigo-700 space-y-1">
                  <li>• Automatische Web-Recherche</li>
                  <li>• Code-Generierung</li>
                  <li>• Autonome Task-Ausführung</li>
                  <li>• Selbstverbesserung</li>
                  <li>• Protokoll-Ausfüllung</li>
                  <li>• Website-Erstellung</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <h4 className="font-semibold mb-2">Aktuelle Tasks</h4>
                {autonomousTasks.filter(t => t.status === 'processing').slice(0, 3).map(task => (
                  <div key={task.id} className="mb-2 p-2 bg-gray-50 rounded text-xs">
                    <div className="font-medium">{task.type}</div>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div 
                        className="bg-indigo-500 h-1 rounded-full transition-all"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Knowledge Base Tab */}
        {activeTab === 'knowledge' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
              <h3 className="text-lg font-semibold text-gray-900">KI-Wissensbasis</h3>
              <p className="text-sm text-gray-600 mt-1">Automatisch durch Web-Recherche erweitert</p>
            </div>
            <div className="p-6">
              {aiKnowledgeBase.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p>Wissensbasis wird durch Gespräche aufgebaut</p>
                  <p className="text-sm mt-2">Stellen Sie Fragen für automatische Web-Recherche</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {aiKnowledgeBase.map((knowledge) => (
                    <div key={knowledge.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-lg text-gray-900">{knowledge.topic}</h4>
                        <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                          Vertrauen: {knowledge.confidence}%
                        </span>
                      </div>
                      <div className="space-y-3">
                        {knowledge.content.slice(0, 3).map((result, idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                            <h5 className="font-medium text-sm text-gray-800 mb-1">{result.title}</h5>
                            <p className="text-xs text-gray-600">{result.snippet}</p>
                            <div className="flex justify-between items-center mt-2">
                              <a href={result.url} className="text-xs text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                Quelle ansehen
                              </a>
                              <span className="text-xs text-gray-500">Relevanz: {result.relevance}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 mt-4">
                        Gelernt: {new Date(knowledge.learned).toLocaleString('de-DE')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b bg-gradient-to-r from-green-50 to-teal-50 rounded-t-xl">
              <h3 className="text-lg font-semibold text-gray-900">Erlernte Fähigkeiten ({learnedSkills.length})</h3>
              <p className="text-sm text-gray-600 mt-1">Kontinuierlich durch Interaktionen erweitert</p>
            </div>
            <div className="p-6">
              {learnedSkills.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p>Noch keine Fähigkeiten erlernt</p>
                  <p className="text-sm mt-2">Interagieren Sie mit der KI zum Lernen</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {learnedSkills.map((skill) => (
                    <div key={skill.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{skill.name}</h4>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${skill.proficiency}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{skill.proficiency}%</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{skill.description}</p>
                      <div className="text-xs text-gray-500">
                        Erlernt: {new Date(skill.acquired).toLocaleString('de-DE')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Autonomous Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl">
              <h3 className="text-lg font-semibold text-gray-900">Autonome Tasks ({autonomousTasks.length})</h3>
              <p className="text-sm text-gray-600 mt-1">Automatisch ausgeführte Aufgaben</p>
            </div>
            <div className="p-6">
              {autonomousTasks.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p>Keine aktiven Tasks</p>
                  <p className="text-sm mt-2">Bitten Sie um Bestellungen, Formulare oder andere Tasks</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {autonomousTasks.map((task) => (
                    <div key={task.id} className={`border rounded-xl p-6 ${
                      task.status === 'completed' ? 'border-green-200 bg-green-50' :
                      task.status === 'processing' ? 'border-blue-200 bg-blue-50' :
                      'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 capitalize">{task.type.replace('_', ' ')}</h4>
                          <p className="text-sm text-gray-600 mt-1">{task.details}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status === 'completed' ? '✅ Abgeschlossen' : 
                           task.status === 'processing' ? '⚙️ In Bearbeitung' : '⏸️ Wartend'}
                        </span>
                      </div>
                      
                      {task.status === 'processing' && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Fortschritt</span>
                            <span>{task.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        Gestartet: {new Date(task.started).toLocaleString('de-DE')}
                        {task.completed && (
                          <>
                            {' • '}Abgeschlossen: {new Date(task.completed).toLocaleString('de-DE')}
                          </>
                        )}
                      </div>
                      
                      {task.result && (
                        <div className="mt-3 p-3 bg-white rounded-lg border">
                          <div className="text-sm text-gray-800">{task.result}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Code Generation Tab */}
        {activeTab === 'code' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-slate-50 rounded-t-xl">
              <h3 className="text-lg font-semibold text-gray-900">Generierter Code ({codeGeneration.length})</h3>
              <p className="text-sm text-gray-600 mt-1">Automatisch erstellte Code-Lösungen</p>
            </div>
            <div className="p-6">
              {codeGeneration.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <Code className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p>Noch kein Code generiert</p>
                  <p className="text-sm mt-2">Fragen Sie nach Programmierung, Websites oder Code</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {codeGeneration.map((code) => (
                    <div key={code.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-gray-900">{code.request}</h4>
                            <p className="text-sm text-gray-600 mt-1">{code.explanation}</p>
                          </div>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {code.language}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-0">
                        <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm">
                          <code>{code.code}</code>
                        </pre>
                      </div>
                      
                      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>Erstellt: {new Date(code.created).toLocaleString('de-DE')}</span>
                          <div className="flex items-center gap-4">
                            <span className={code.tested ? 'text-green-600' : 'text-orange-600'}>
                              {code.tested ? '✅ Getestet' : '⏳ Nicht getestet'}
                            </span>
                            <button className="text-blue-600 hover:text-blue-800">
                              📋 Kopieren
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Self Improvements Tab */}
        {activeTab === 'improvements' && (
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-xl">
              <h3 className="text-lg font-semibold text-gray-900">Selbstverbesserungen ({selfImprovements.length})</h3>
              <p className="text-sm text-gray-600 mt-1">Autonome System-Optimierungen</p>
            </div>
            <div className="p-6">
              {selfImprovements.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p>Noch keine Verbesserungen implementiert</p>
                  <p className="text-sm mt-2">System wird sich bei Bedarf selbst optimieren</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selfImprovements.map((improvement) => (
                    <div key={improvement.id} className="border border-orange-200 rounded-xl p-6 bg-gradient-to-r from-orange-50 to-yellow-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{improvement.type.replace('_', ' ')}</h4>
                          <p className="text-sm text-gray-700 mt-1">{improvement.description}</p>
                        </div>
                        <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-medium">
                          v{improvement.version}
                        </span>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg border border-orange-200 mb-3">
                        <div className="font-medium text-sm text-green-700 mb-1">📈 Auswirkung:</div>
                        <div className="text-sm text-gray-700">{improvement.impact}</div>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        Implementiert: {new Date(improvement.implemented).toLocaleString('de-DE')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 flex items-center gap-3 shadow-xl">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
            <span className="text-gray-700">KI-System wird initialisiert...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedAIAssistant;
