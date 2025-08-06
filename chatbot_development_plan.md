    def find_similar_projects(self, user_id, project_context):
        """Find similar projects using cosine similarity"""
        user_projects = [f for f in self.feedback_history if f['user_id'] == user_id]
        
        if not user_projects:
            return []
        
        # Create feature vectors
        current_features = self.vectorize_project_features(project_context)
        project_vectors = []
        
        for project in user_projects:
            vector = self.vectorize_project_features(project['project_features'])
            project_vectors.append({
                'vector': vector,
                'project_data': project,
                'similarity': cosine_similarity([current_features], [vector])[0][0]
            })
        
        # Sort by similarity
        project_vectors.sort(key=lambda x: x['similarity'], reverse=True)
        
        return [{
            'id': p['project_data']['project_id'],
            'title': p['project_data']['project_features'].get('title', 'Untitled'),
            'date': p['project_data']['timestamp'].strftime('%d.%m.%Y'),
            'similarity': p['similarity']
        } for p in project_vectors[:5]]
    
    def vectorize_project_features(self, features):
        """Convert project features to numerical vector"""
        # This is a simplified version - in production you'd use more sophisticated encoding
        vector = []
        
        # Type encoding (one-hot style)
        project_types = ['video', 'image', 'animation', 'text', 'research']
        type_vector = [1 if features.get('type') == t else 0 for t in project_types]
        vector.extend(type_vector)
        
        # Numerical features
        vector.append(features.get('duration', 0) / 600)  # Normalized duration
        vector.append(features.get('complexity', 0) / 10)  # Normalized complexity
        vector.append(len(features.get('keywords', [])) / 10)  # Keywords count
        
        # Style encoding
        styles = ['modern', 'classic', 'futuristic', 'minimal', 'vintage']
        style_vector = [1 if features.get('style') == s else 0 for s in styles]
        vector.extend(style_vector)
        
        return np.array(vector)
    
    def calculate_complexity(self, project_data):
        """Calculate project complexity score (1-10)"""
        complexity = 1
        
        # Factor in project type
        type_complexity = {
            'text': 2,
            'image': 4,
            'animation': 7,
            'video': 8,
            'research': 5
        }
        
        complexity += type_complexity.get(project_data.get('type', ''), 3)
        
        # Factor in duration for videos
        if project_data.get('duration', 0) > 300:  # 5+ minutes
            complexity += 2
        
        # Factor in resolution
        if '4K' in project_data.get('resolution', ''):
            complexity += 2
        
        return min(complexity, 10)
    
    def save_model(self, filepath):
        """Save learning models to disk"""
        model_data = {
            'user_preferences': self.user_preferences,
            'feedback_history': [
                {**f, 'timestamp': f['timestamp'].isoformat()} 
                for f in self.feedback_history
            ],
            'version': '1.0',
            'last_updated': datetime.now().isoformat()
        }
        
        with open(filepath, 'w') as f:
            json.dump(model_data, f, indent=2)
    
    def load_model(self, filepath):
        """Load learning models from disk"""
        try:
            with open(filepath, 'r') as f:
          # Entwicklungsplan: Philipps Lernender Multimedia-Chatbot
*Von der Konzeption zur funktionsfähigen Software*

---

## 🎯 Entwicklungsstrategie: MVP-First Approach

### Phase 1: Minimum Viable Product (MVP) - 3 Monate
**Ziel**: Funktionsfähiger Basis-Chatbot mit 2 Kern-Funktionen

#### Woche 1-2: Grundarchitektur
```bash
# Projekt-Setup
mkdir philipp-ai-chatbot
cd philipp-ai-chatbot

# Backend Setup
mkdir backend
cd backend
npm init -y
npm install express socket.io cors dotenv
npm install @anthropic-ai/sdk openai
npm install prisma @prisma/client
npm install redis ioredis
npm install multer aws-sdk

# Frontend Setup
cd ../
npx create-react-app frontend --template typescript
cd frontend
npm install socket.io-client axios
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
```

#### Grundlegende Backend-Struktur:
```javascript
// backend/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Basis-Routes
app.use('/api/chat', require('./routes/chat'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/assets', require('./routes/assets'));

// Socket.io für Real-time Chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('chat_message', async (data) => {
    const response = await processMessage(data);
    socket.emit('bot_response', response);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

async function processMessage(data) {
  // Hier kommt die AI-Logik rein
  const { message, userId, projectId } = data;
  
  // 1. Intent Recognition
  const intent = await recognizeIntent(message);
  
  // 2. Project Context Loading
  const context = await loadProjectContext(projectId, userId);
  
  // 3. Generate Response
  const response = await generateResponse(intent, context, message);
  
  // 4. Save Interaction
  await saveInteraction(userId, message, response);
  
  return response;
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### Datenbank Schema (Prisma):
```prisma
// backend/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  projects     Project[]
  interactions ChatInteraction[]
  preferences  UserPreference[]
  
  @@map("users")
}

model Project {
  id          String   @id @default(cuid())
  title       String
  description String?
  type        String   // "video", "image", "animation", etc.
  status      String   @default("active") // "active", "completed", "archived"
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  userId String
  user   User   @relation(fields: [userId], references: [id])
  
  assets       Asset[]
  interactions ChatInteraction[]
  metadata     ProjectMetadata?
  
  @@map("projects")
}

model Asset {
  id        String   @id @default(cuid())
  filename  String
  fileType  String
  fileSize  Int
  url       String
  version   Int      @default(1)
  createdAt DateTime @default(now())
  
  projectId String
  project   Project @relation(fields: [projectId], references: [id])
  
  metadata AssetMetadata?
  
  @@map("assets")
}

model ChatInteraction {
  id        String   @id @default(cuid())
  message   String
  response  String
  intent    String?
  createdAt DateTime @default(now())
  
  userId String
  user   User   @relation(fields: [userId], references: [id])
  
  projectId String?
  project   Project? @relation(fields: [projectId], references: [id])
  
  @@map("chat_interactions")
}

model UserPreference {
  id     String @id @default(cuid())
  key    String
  value  String
  
  userId String
  user   User   @relation(fields: [userId], references: [id])
  
  @@unique([userId, key])
  @@map("user_preferences")
}

model ProjectMetadata {
  id        String @id @default(cuid())
  keywords  String[]
  tags      String[]
  rating    Float?
  feedback  String?
  
  projectId String  @unique
  project   Project @relation(fields: [projectId], references: [id])
  
  @@map("project_metadata")
}

model AssetMetadata {
  id         String @id @default(cuid())
  resolution String?
  duration   Int?    // in seconds for videos
  colorPalette String[]
  tools      String[]
  
  assetId String @unique
  asset   Asset  @relation(fields: [assetId], references: [id])
  
  @@map("asset_metadata")
}
```

#### AI Integration Service:
```javascript
// backend/services/aiService.js
const { Anthropic } = require('@anthropic-ai/sdk');

class AIService {
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    
    this.systemPrompt = `Du bist Philipps persönlicher Multimedia-AI-Assistent. 
    Du hilfst bei der Erstellung von Videos, Bildern, Animationen und Texten.
    
    Deine Persönlichkeit:
    - Freundlich und hilfsbereit
    - Erinnert sich an Projektdetails
    - Macht proaktive Vorschläge
    - Lernt aus Feedback
    
    Verfügbare Funktionen:
    1. Recherche-Synthesizer
    2. Visual Creator 1K+
    3. Video Producer
    4. Bild-zu-Video Converter
    5. Text-Animations-Konstrukteur
    6. Bild-zu-Animation Spezialist`;
  }

  async recognizeIntent(message) {
    const response = await this.anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Analysiere diese Nachricht und erkenne die Absicht:
        "${message}"
        
        Mögliche Intents:
        - create_video
        - create_image
        - text_animation
        - research_request
        - project_status
        - general_chat
        
        Antworte nur mit dem Intent-Namen.`
      }]
    });
    
    return response.content[0].text.trim();
  }

  async generateResponse(intent, context, message) {
    const contextString = JSON.stringify(context, null, 2);
    
    const response = await this.anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      system: this.systemPrompt,
      messages: [{
        role: 'user',
        content: `Intent: ${intent}
        Nachricht: "${message}"
        Kontext: ${contextString}
        
        Generiere eine hilfreiche, persönliche Antwort als Philipps AI-Assistent.
        Beziehe dich auf vergangene Projekte wenn relevant.
        Mache konkrete, umsetzbare Vorschläge.`
      }]
    });
    
    return {
      text: response.content[0].text,
      intent: intent,
      suggestions: this.extractSuggestions(response.content[0].text)
    };
  }

  extractSuggestions(text) {
    // Extract actionable suggestions from response
    const suggestions = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      if (line.includes('✅') || line.includes('🎯') || line.includes('💡')) {
        suggestions.push(line.trim());
      }
    });
    
    return suggestions;
  }
}

module.exports = new AIService();
```

#### Frontend Chat Interface:
```typescript
// frontend/src/components/ChatInterface.tsx
import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Typography,
  List,
  ListItem,
  Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('bot_response', (response: any) => {
      setIsTyping(false);
      addMessage({
        id: Date.now().toString(),
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: response.suggestions
      });
    });

    // Initial greeting
    addMessage({
      id: 'welcome',
      text: 'Hallo Philipp! 👋 Ich bin dein persönlicher Multimedia-Assistent. Womit kann ich dir heute helfen?',
      sender: 'bot',
      timestamp: new Date()
    });

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !socket) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    addMessage(userMessage);
    setIsTyping(true);
    
    socket.emit('chat_message', {
      message: inputValue,
      userId: 'user_123', // TODO: Get from auth
      projectId: null // TODO: Get current project
    });

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, backgroundColor: '#1976d2', color: 'white' }}>
        <Typography variant="h6">
          🤖 Philipps AI-Assistent
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Multimedia Content Creator & Digital-Strategist
        </Typography>
      </Paper>

      {/* Messages */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        p: 2,
        backgroundColor: '#f5f5f5'
      }}>
        <List>
          {messages.map((message) => (
            <ListItem key={message.id} sx={{ 
              display: 'flex', 
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              mb: 1
            }}>
              <Paper sx={{
                p: 2,
                maxWidth: '70%',
                backgroundColor: message.sender === 'user' ? '#1976d2' : '#fff',
                color: message.sender === 'user' ? 'white' : 'inherit'
              }}>
                <Typography variant="body1">
                  {message.text}
                </Typography>
                
                {message.suggestions && (
                  <Box sx={{ mt: 1 }}>
                    {message.suggestions.map((suggestion, index) => (
                      <Chip
                        key={index}
                        label={suggestion}
                        size="small"
                        sx={{ m: 0.5 }}
                        onClick={() => setInputValue(suggestion)}
                      />
                    ))}
                  </Box>
                )}
                
                <Typography variant="caption" sx={{ 
                  display: 'block', 
                  mt: 1, 
                  opacity: 0.7 
                }}>
                  {message.timestamp.toLocaleTimeString()}
                </Typography>
              </Paper>
            </ListItem>
          ))}
          
          {isTyping && (
            <ListItem sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Paper sx={{ p: 2, backgroundColor: '#fff' }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  🤖 tippt...
                </Typography>
              </Paper>
            </ListItem>
          )}
        </List>
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Schreibe eine Nachricht..."
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={!inputValue.trim()}
            endIcon={<SendIcon />}
          >
            Senden
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatInterface;
```

---

## 🚀 Phase 2: Multimedia-Funktionen integrieren (Wochen 3-6)

### Recherche-Synthesizer Implementation:
```javascript
// backend/services/researchService.js
const axios = require('axios');
const cheerio = require('cheerio');

class ResearchService {
  constructor() {
    this.searchAPIs = {
      google: process.env.GOOGLE_SEARCH_API_KEY,
      bing: process.env.BING_SEARCH_API_KEY
    };
  }

  async performResearch(query, depth = 'standard') {
    const searchResults = await this.webSearch(query);
    const analyzedContent = await this.analyzeContent(searchResults);
    const synthesis = await this.synthesizeInformation(analyzedContent, query);
    
    return {
      query,
      sources: searchResults,
      analysis: analyzedContent,
      synthesis,
      createdAt: new Date()
    };
  }

  async webSearch(query) {
    const results = [];
    
    // Google Custom Search
    try {
      const googleResponse = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: this.searchAPIs.google,
          cx: process.env.GOOGLE_SEARCH_ENGINE_ID,
          q: query,
          num: 10
        }
      });
      
      results.push(...googleResponse.data.items.map(item => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        source: 'google'
      })));
    } catch (error) {
      console.error('Google Search Error:', error);
    }

    return results;
  }

  async analyzeContent(searchResults) {
    const analyzed = [];
    
    for (const result of searchResults.slice(0, 5)) { // Limit for MVP
      try {
        const response = await axios.get(result.url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        const $ = cheerio.load(response.data);
        const content = $('p').text();
        
        analyzed.push({
          ...result,
          fullContent: content.substring(0, 2000), // Limit content
          wordCount: content.split(' ').length
        });
      } catch (error) {
        console.error(`Error fetching ${result.url}:`, error.message);
        analyzed.push({
          ...result,
          fullContent: result.snippet,
          wordCount: result.snippet.split(' ').length
        });
      }
    }
    
    return analyzed;
  }

  async synthesizeInformation(analyzedContent, originalQuery) {
    const aiService = require('./aiService');
    
    const contentSummary = analyzedContent.map(item => ({
      title: item.title,
      url: item.url,
      content: item.fullContent.substring(0, 500)
    }));

    const synthesis = await aiService.anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Erstelle eine umfassende Zusammenfassung zu: "${originalQuery}"
        
        Basierend auf diesen Quellen:
        ${JSON.stringify(contentSummary, null, 2)}
        
        Die Zusammenfassung soll:
        - Strukturiert und übersichtlich sein
        - Hauptpunkte hervorheben
        - Widersprüche aufzeigen falls vorhanden
        - Actionable Insights enthalten
        - Quellen korrekt referenzieren
        
        Format: Markdown mit Überschriften, Listen und Zitaten.`
      }]
    });

    return {
      summary: synthesis.content[0].text,
      sourceCount: analyzedContent.length,
      keyInsights: this.extractKeyInsights(synthesis.content[0].text),
      recommendations: this.generateRecommendations(synthesis.content[0].text)
    };
  }

  extractKeyInsights(text) {
    // Extract bullet points and key findings
    const insights = [];
    const lines = text.split('\n');
    
    lines.forEach(line => {
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        insights.push(line.trim().substring(2));
      }
    });
    
    return insights.slice(0, 5); // Top 5 insights
  }

  generateRecommendations(text) {
    return [
      "Weitere Recherche zu spezifischen Aspekten",
      "Erstellung visueller Zusammenfassung",
      "Video-Präsentation der Ergebnisse",
      "Social Media Content aus den Erkenntnissen"
    ];
  }
}

module.exports = new ResearchService();
```

### Image Generation Service:
```javascript
// backend/services/imageService.js
const OpenAI = require('openai');
const sharp = require('sharp');
const AWS = require('aws-sdk');

class ImageService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });
  }

  async createImage(prompt, specifications = {}) {
    const {
      resolution = '1920x1080',
      style = 'modern',
      colorScheme = 'default',
      format = 'png'
    } = specifications;

    try {
      // Generate with DALL-E
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: this.enhancePrompt(prompt, style, colorScheme),
        size: this.mapResolution(resolution),
        quality: "hd",
        n: 1,
      });

      const imageUrl = response.data[0].url;
      
      // Download and process image
      const processedImage = await this.processImage(imageUrl, specifications);
      
      // Upload to storage
      const finalUrl = await this.uploadToS3(processedImage, format);
      
      return {
        url: finalUrl,
        originalPrompt: prompt,
        enhancedPrompt: this.enhancePrompt(prompt, style, colorScheme),
        specifications,
        metadata: {
          resolution,
          format,
          fileSize: processedImage.length,
          createdAt: new Date()
        }
      };
    } catch (error) {
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }

  enhancePrompt(basePrompt, style, colorScheme) {
    const styleModifiers = {
      modern: "clean, contemporary, minimalist",
      classic: "traditional, elegant, timeless",
      futuristic: "high-tech, sci-fi, innovative",
      vintage: "retro, nostalgic, classic"
    };

    const colorModifiers = {
      monochrome: "black and white, grayscale",
      vibrant: "bright colors, high saturation",
      pastel: "soft colors, gentle tones",
      corporate: "professional color palette, blue and gray tones"
    };

    let enhanced = basePrompt;
    
    if (styleModifiers[style]) {
      enhanced += `, ${styleModifiers[style]} style`;
    }
    
    if (colorModifiers[colorScheme]) {
      enhanced += `, ${colorModifiers[colorScheme]}`;
    }
    
    enhanced += ", high quality, professional, detailed";
    
    return enhanced;
  }

  mapResolution(resolution) {
    const mapping = {
      '1920x1080': '1792x1024',
      '1080x1920': '1024x1792',
      '1024x1024': '1024x1024'
    };
    
    return mapping[resolution] || '1024x1024';
  }

  async processImage(imageUrl, specifications) {
    const axios = require('axios');
    
    // Download image
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });
    
    let imageBuffer = Buffer.from(response.data);
    
    // Process with Sharp
    const processor = sharp(imageBuffer);
    
    // Resize if needed
    if (specifications.resolution) {
      const [width, height] = specifications.resolution.split('x').map(Number);
      processor.resize(width, height, { fit: 'cover' });
    }
    
    // Convert format
    if (specifications.format === 'jpg') {
      processor.jpeg({ quality: 90 });
    } else if (specifications.format === 'webp') {
      processor.webp({ quality: 90 });
    } else {
      processor.png();
    }
    
    return await processor.toBuffer();
  }

  async uploadToS3(imageBuffer, format) {
    const key = `images/${Date.now()}.${format}`;
    
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: imageBuffer,
      ContentType: `image/${format}`,
      ACL: 'public-read'
    };
    
    const result = await this.s3.upload(params).promise();
    return result.Location;
  }

  async createVariations(originalImageUrl, count = 3) {
    // Create variations of existing image
    const variations = [];
    
    for (let i = 0; i < count; i++) {
      // This would use DALL-E variations API or other techniques
      // Implementation depends on specific requirements
    }
    
    return variations;
  }
}

module.exports = new ImageService();
```

---

## 🧠 Phase 3: Learning System (Wochen 7-10)

### Learning Module Implementation:
```python
# backend/ml/learning_engine.py
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
import joblib
import json
from datetime import datetime, timedelta

class LearningEngine:
    def __init__(self):
        self.user_preferences = {}
        self.project_vectors = {}
        self.quality_model = None
        self.recommendation_model = None
        self.feedback_history = []
        
    def learn_from_interaction(self, user_id, project_data, feedback):
        """Learn from user interaction and feedback"""
        
        # Store feedback
        feedback_entry = {
            'user_id': user_id,
            'project_id': project_data['id'],
            'rating': feedback.get('rating', 0),
            'comments': feedback.get('comments', ''),
            'timestamp': datetime.now(),
            'project_features': self.extract_project_features(project_data)
        }
        
        self.feedback_history.append(feedback_entry)
        
        # Update user preferences
        self.update_user_preferences(user_id, feedback_entry)
        
        # Update quality model
        self.update_quality_model()
        
        # Update recommendation model
        self.update_recommendation_model()
        
    def extract_project_features(self, project_data):
        """Extract features from project data"""
        features = {
            'type': project_data.get('type', ''),
            'duration': project_data.get('duration', 0),
            'resolution': project_data.get('resolution', ''),
            'style': project_data.get('style', ''),
            'color_scheme': project_data.get('color_scheme', ''),
            'keywords': project_data.get('keywords', []),
            'complexity': self.calculate_complexity(project_data),
            'creation_time': project_data.get('creation_time', 0)
        }
        
        return features
    
    def update_user_preferences(self, user_id, feedback_entry):
        """Update user preference model"""
        if user_id not in self.user_preferences:
            self.user_preferences[user_id] = {
                'style_preferences': {},
                'quality_standards': {},
                'workflow_patterns': {},
                'feedback_count': 0
            }
        
        prefs = self.user_preferences[user_id]
        prefs['feedback_count'] += 1
        
        # Weighted learning based on rating
        weight = feedback_entry['rating'] / 5.0
        features = feedback_entry['project_features']
        
        # Update style preferences
        if features['style']:
            style = features['style']
            if style not in prefs['style_preferences']:
                prefs['style_preferences'][style] = 0
            prefs['style_preferences'][style] += weight
        
        # Update quality standards
        prefs['quality_standards']['min_rating'] = max(
            prefs['quality_standards'].get('min_rating', 0),
            feedback_entry['rating'] - 1
        )
        
        # Learn workflow patterns
        creation_time = features['creation_time']
        if creation_time > 0:
            if 'avg_creation_time' not in prefs['workflow_patterns']:
                prefs['workflow_patterns']['avg_creation_time'] = creation_time
            else:
                # Moving average
                current_avg = prefs['workflow_patterns']['avg_creation_time']
                prefs['workflow_patterns']['avg_creation_time'] = (
                    current_avg * 0.8 + creation_time * 0.2
                )
    
    def predict_user_preferences(self, user_id, project_context):
        """Predict user preferences for new project"""
        if user_id not in self.user_preferences:
            return self.get_default_preferences()
        
        prefs = self.user_preferences[user_id]
        
        predictions = {
            'preferred_style': self.get_top_preference(prefs['style_preferences']),
            'quality_threshold': prefs['quality_standards'].get('min_rating', 4.0),
            'estimated_time': prefs['workflow_patterns'].get('avg_creation_time', 3600),
            'recommendations': self.generate_recommendations(user_id, project_context)
        }
        
        return predictions
    
    def generate_recommendations(self, user_id, project_context):
        """Generate personalized recommendations"""
        recommendations = []
        
        # Find similar past projects
        similar_projects = self.find_similar_projects(user_id, project_context)
        
        for project in similar_projects[:3]:
            recommendations.append({
                'type': 'similar_project',
                'project_id': project['id'],
                'similarity_score': project['similarity'],
                'suggestion': f"Ähnlich wie dein Projekt '{project['title']}' vom {project['date']}"
            })
        
        # Suggest improvements based on feedback patterns
        improvement_suggestions = self.analyze_feedback_patterns(user_id)
        recommendations.extend(improvement_suggestions)
        
        return recommendations
    
    def find_similar_projects(self, user_id, project_context):
        """Find similar projects using cosine similarity"""
        user_projects = [f for f in self.feedback_history if f['user_id'] == user_id]
        
        if not user_projects