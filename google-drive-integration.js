// Google Drive API Integration für Chatbot Memory System
// Installation: npm install googleapis google-auth-library

import { google } from 'googleapis';
import fs from 'fs/promises';

class ChatbotMemoryGoogleDrive {
  constructor() {
    this.auth = null;
    this.drive = null;
    this.memoryFolderId = null;
    this.CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    this.CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    this.REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
    this.STORAGE_LIMIT = 2 * 1024 * 1024 * 1024; // 2GB
  }

  // 1. OAuth2 Setup
  async initializeAuth() {
    this.auth = new google.auth.OAuth2(
      this.CLIENT_ID,
      this.CLIENT_SECRET,
      this.REDIRECT_URI
    );

    // Scopes für Drive API
    const scopes = [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const authUrl = this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });

    return authUrl;
  }

  // 2. Token-Setup nach OAuth
  async setCredentials(code) {
    const { tokens } = await this.auth.getToken(code);
    this.auth.setCredentials(tokens);
    
    this.drive = google.drive({ version: 'v3', auth: this.auth });
    
    // Memory-Ordner erstellen oder finden
    await this.ensureMemoryFolder();
    
    return tokens;
  }

  // 3. Memory-Ordner Setup
  async ensureMemoryFolder() {
    try {
      // Suche nach existierendem Chatbot-Memory-Ordner
      const response = await this.drive.files.list({
        q: "name='Chatbot-Memory' and mimeType='application/vnd.google-apps.folder'",
        spaces: 'drive',
      });

      if (response.data.files.length > 0) {
        this.memoryFolderId = response.data.files[0].id;
      } else {
        // Erstelle neuen Memory-Ordner
        const folderMetadata = {
          name: 'Chatbot-Memory',
          mimeType: 'application/vnd.google-apps.folder',
        };

        const folder = await this.drive.files.create({
          requestBody: folderMetadata,
          fields: 'id',
        });

        this.memoryFolderId = folder.data.id;
      }

      console.log('Memory Folder ID:', this.memoryFolderId);
    } catch (error) {
      console.error('Error creating memory folder:', error);
      throw error;
    }
  }

  // 4. Gespräche speichern
  async saveConversation(conversationData, userId) {
    try {
      const fileName = `conversation_${userId}_${Date.now()}.json`;
      const fileContent = JSON.stringify(conversationData, null, 2);
      
      // Prüfe Speicherlimit
      const currentUsage = await this.getStorageUsage(userId);
      const newSize = Buffer.byteLength(fileContent, 'utf8');
      
      if (currentUsage + newSize > this.STORAGE_LIMIT) {
        throw new Error('Storage limit exceeded');
      }

      const fileMetadata = {
        name: fileName,
        parents: [this.memoryFolderId],
        description: `Chatbot conversation for user ${userId}`,
      };

      const media = {
        mimeType: 'application/json',
        body: fileContent,
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, size',
      });

      return {
        fileId: response.data.id,
        fileName: response.data.name,
        size: response.data.size,
      };
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }

  // 5. Gelernte Aufgaben speichern
  async saveLearnedTasks(tasks, userId) {
    try {
      const fileName = `learned_tasks_${userId}.json`;
      const fileContent = JSON.stringify(tasks, null, 2);

      // Prüfe ob Datei bereits existiert
      const existingFile = await this.findFile(fileName);
      
      const fileMetadata = {
        name: fileName,
        parents: [this.memoryFolderId],
      };

      const media = {
        mimeType: 'application/json',
        body: fileContent,
      };

      if (existingFile) {
        // Update existierende Datei
        const response = await this.drive.files.update({
          fileId: existingFile.id,
          media: media,
        });
        return response.data;
      } else {
        // Erstelle neue Datei
        const response = await this.drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id, name, size',
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error saving learned tasks:', error);
      throw error;
    }
  }

  // 6. Gelernte Funktionen speichern
  async saveLearnedFunctions(functions, userId) {
    try {
      const fileName = `learned_functions_${userId}.json`;
      const fileContent = JSON.stringify(functions, null, 2);

      const existingFile = await this.findFile(fileName);
      
      const fileMetadata = {
        name: fileName,
        parents: [this.memoryFolderId],
      };

      const media = {
        mimeType: 'application/json',
        body: fileContent,
      };

      if (existingFile) {
        const response = await this.drive.files.update({
          fileId: existingFile.id,
          media: media,
        });
        return response.data;
      } else {
        const response = await this.drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id, name, size',
        });
        return response.data;
      }
    } catch (error) {
      console.error('Error saving learned functions:', error);
      throw error;
    }
  }

  // 7. Daten laden
  async loadUserMemory(userId) {
    try {
      const memory = {
        conversations: [],
        tasks: [],
        functions: []
      };

      // Lade Gespräche
      const conversationFiles = await this.drive.files.list({
        q: `parents in '${this.memoryFolderId}' and name contains 'conversation_${userId}'`,
        fields: 'files(id, name, size, createdTime)',
      });

      for (const file of conversationFiles.data.files) {
        const content = await this.downloadFile(file.id);
        memory.conversations.push(JSON.parse(content));
      }

      // Lade Aufgaben
      const tasksFile = await this.findFile(`learned_tasks_${userId}.json`);
      if (tasksFile) {
        const content = await this.downloadFile(tasksFile.id);
        memory.tasks = JSON.parse(content);
      }

      // Lade Funktionen
      const functionsFile = await this.findFile(`learned_functions_${userId}.json`);
      if (functionsFile) {
        const content = await this.downloadFile(functionsFile.id);
        memory.functions = JSON.parse(content);
      }

      return memory;
    } catch (error) {
      console.error('Error loading user memory:', error);
      throw error;
    }
  }

  // 8. Speichernutzung berechnen
  async getStorageUsage(userId) {
    try {
      const response = await this.drive.files.list({
        q: `parents in '${this.memoryFolderId}' and (name contains '${userId}' or name contains 'conversation_${userId}')`,
        fields: 'files(size)',
      });

      const totalSize = response.data.files.reduce((sum, file) => {
        return sum + parseInt(file.size || 0);
      }, 0);

      return totalSize;
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return 0;
    }
  }

  // 9. Hilfsfunktionen
  async findFile(fileName) {
    try {
      const response = await this.drive.files.list({
        q: `parents in '${this.memoryFolderId}' and name='${fileName}'`,
        fields: 'files(id, name)',
      });

      return response.data.files[0] || null;
    } catch (error) {
      console.error('Error finding file:', error);
      return null;
    }
  }

  async downloadFile(fileId) {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media',
      });

      return response.data;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  }

  // 10. Cleanup und Maintenance
  async cleanupOldConversations(userId, maxAge = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAge);

      const response = await this.drive.files.list({
        q: `parents in '${this.memoryFolderId}' and name contains 'conversation_${userId}' and createdTime < '${cutoffDate.toISOString()}'`,
        fields: 'files(id, name, createdTime)',
      });

      for (const file of response.data.files) {
        await this.drive.files.delete({
          fileId: file.id,
        });
        console.log(`Deleted old conversation: ${file.name}`);
      }

      return response.data.files.length;
    } catch (error) {
      console.error('Error cleaning up old conversations:', error);
      return 0;
    }
  }

  // 11. Backup erstellen
  async createBackup(userId) {
    try {
      const memory = await this.loadUserMemory(userId);
      const backupData = {
        userId: userId,
        timestamp: new Date().toISOString(),
        memory: memory
      };

      const fileName = `backup_${userId}_${Date.now()}.json`;
      const fileContent = JSON.stringify(backupData, null, 2);

      const fileMetadata = {
        name: fileName,
        parents: [this.memoryFolderId],
        description: `Backup for user ${userId}`,
      };

      const media = {
        mimeType: 'application/json',
        body: fileContent,
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, size',
      });

      return response.data;
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }
}

// 12. Express.js Integration Beispiel
export class ChatbotMemoryAPI {
  constructor() {
    this.driveManager = new ChatbotMemoryGoogleDrive();
  }

  // API Endpoints
  async handleAuth(req, res) {
    try {
      const authUrl = await this.driveManager.initializeAuth();
      res.json({ authUrl });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async handleCallback(req, res) {
    try {
      const { code } = req.query;
      const tokens = await this.driveManager.setCredentials(code);
      // Speichere Tokens sicher (z.B. in verschlüsselter Datenbank)
      res.json({ success: true, tokens });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async saveConversation(req, res) {
    try {
      const { conversationData, userId } = req.body;
      const result = await this.driveManager.saveConversation(conversationData, userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async loadMemory(req, res) {
    try {
      const { userId } = req.params;
      const memory = await this.driveManager.loadUserMemory(userId);
      res.json(memory);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getStorageUsage(req, res) {
    try {
      const { userId } = req.params;
      const usage = await this.driveManager.getStorageUsage(userId);
      res.json({ usage, limit: this.driveManager.STORAGE_LIMIT });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

// 13. Verwendungsbeispiel
const memorySystem = new ChatbotMemoryGoogleDrive();

// Initialisierung
await memorySystem.initializeAuth();
await memorySystem.setCredentials(authCode);

// Gespräch speichern
const conversation = {
  id: 'conv_123',
  messages: [
    { type: 'user', content: 'Hallo' },
    { type: 'bot', content: 'Hallo! Wie kann ich helfen?' }
  ],
  timestamp: new Date().toISOString()
};

await memorySystem.saveConversation(conversation, 'user123');

// Memory laden
const userMemory = await memorySystem.loadUserMemory('user123');
console.log(userMemory);

export { ChatbotMemoryGoogleDrive, ChatbotMemoryAPI };