// src/services/localStorageService.js
class LocalStorageService {
    constructor() {
        this.dbName = 'KiMonsterPhilippDB';
        this.dbVersion = 2;
        this.db = null;
        this.stores = {
            files: 'files',
            settings: 'settings',
            cache: 'cache',
            research: 'research',
            projects: 'projects'
        };
        this.maxFileSize = 50 * 1024 * 1024; // 50MB per file
        this.maxTotalSize = 500 * 1024 * 1024; // 500MB total
    }

    /**
     * IndexedDB initialisieren
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            console.log('🔄 Initializing Local Storage Service...');
            
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = () => {
                console.error('❌ Failed to open IndexedDB');
                reject(request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ Local Storage Service initialized');
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Files Store
                if (!db.objectStoreNames.contains(this.stores.files)) {
                    const filesStore = db.createObjectStore(this.stores.files, { keyPath: 'name' });
                    filesStore.createIndex('modified', 'modified', { unique: false });
                    filesStore.createIndex('size', 'size', { unique: false });
                    filesStore.createIndex('type', 'type', { unique: false });
                }
                
                // Settings Store
                if (!db.objectStoreNames.contains(this.stores.settings)) {
                    db.createObjectStore(this.stores.settings, { keyPath: 'key' });
                }
                
                // Cache Store
                if (!db.objectStoreNames.contains(this.stores.cache)) {
                    const cacheStore = db.createObjectStore(this.stores.cache, { keyPath: 'key' });
                    cacheStore.createIndex('expires', 'expires', { unique: false });
                }
                
                // Research Store
                if (!db.objectStoreNames.contains(this.stores.research)) {
                    const researchStore = db.createObjectStore(this.stores.research, { keyPath: 'id' });
                    researchStore.createIndex('timestamp', 'timestamp', { unique: false });
                    researchStore.createIndex('function', 'function', { unique: false });
                }
                
                // Projects Store
                if (!db.objectStoreNames.contains(this.stores.projects)) {
                    const projectsStore = db.createObjectStore(this.stores.projects, { keyPath: 'id' });
                    projectsStore.createIndex('created', 'created', { unique: false });
                    projectsStore.createIndex('status', 'status', { unique: false });
                }
                
                console.log('🔧 Database schema updated');
            };
        });
    }

    /**
     * Datei speichern (mit Kompression)
     */
    async saveFile(fileName, fileData, metadata = {}) {
        try {
            console.log(`💾 Saving file locally: ${fileName}`);
            
            if (!this.db) await this.initialize();
            
            // Size check
            const fileSize = fileData.size || fileData.byteLength || new Blob([fileData]).size;
            if (fileSize > this.maxFileSize) {
                throw new Error(`File too large: ${fileSize} bytes (max: ${this.maxFileSize})`);
            }
            
            // Check total storage
            const currentSize = await this.getTotalStorageUsed();
            if (currentSize + fileSize > this.maxTotalSize) {
                await this.cleanup(); // Try to free space
            }
            
            // Prepare file object
            let processedData;
            if (fileData instanceof File || fileData instanceof Blob) {
                processedData = await this.blobToArrayBuffer(fileData);
            } else {
                processedData = fileData;
            }
            
            // Compress if it's text data
            if (metadata.type && metadata.type.startsWith('text/')) {
                processedData = await this.compressData(processedData);
                metadata.compressed = true;
            }
            
            const fileObject = {
                name: fileName,
                data: processedData,
                size: fileSize,
                type: metadata.type || 'application/octet-stream',
                modified: new Date(),
                created: new Date(),
                compressed: metadata.compressed || false,
                ...metadata
            };
            
            const transaction = this.db.transaction([this.stores.files], 'readwrite');
            const store = transaction.objectStore(this.stores.files);
            
            await new Promise((resolve, reject) => {
                const request = store.put(fileObject);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            
            return research;
            
        } catch (error) {
            console.error('❌ Failed to get research history:', error);
            throw error;
        }
    }

    /**
     * Einstellungen speichern
     */
    async saveSetting(key, value) {
        try {
            if (!this.db) await this.initialize();
            
            const setting = {
                key: key,
                value: value,
                modified: new Date()
            };
            
            const transaction = this.db.transaction([this.stores.settings], 'readwrite');
            const store = transaction.objectStore(this.stores.settings);
            
            await new Promise((resolve, reject) => {
                const request = store.put(setting);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            
            console.log(`⚙️ Setting saved: ${key}`);
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to save setting: ${key}`, error);
            throw error;
        }
    }

    /**
     * Einstellung laden
     */
    async getSetting(key, defaultValue = null) {
        try {
            if (!this.db) await this.initialize();
            
            const transaction = this.db.transaction([this.stores.settings], 'readonly');
            const store = transaction.objectStore(this.stores.settings);
            
            const setting = await new Promise((resolve, reject) => {
                const request = store.get(key);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
            
            return setting ? setting.value : defaultValue;
            
        } catch (error) {
            console.error(`❌ Failed to get setting: ${key}`, error);
            return defaultValue;
        }
    }

    /**
     * Cache-Daten speichern (mit Ablaufzeit)
     */
    async setCache(key, data, ttlMinutes = 60) {
        try {
            if (!this.db) await this.initialize();
            
            const cacheObject = {
                key: key,
                data: data,
                created: new Date(),
                expires: new Date(Date.now() + ttlMinutes * 60 * 1000)
            };
            
            const transaction = this.db.transaction([this.stores.cache], 'readwrite');
            const store = transaction.objectStore(this.stores.cache);
            
            await new Promise((resolve, reject) => {
                const request = store.put(cacheObject);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            
            console.log(`🗂️ Cache set: ${key} (expires in ${ttlMinutes} minutes)`);
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to set cache: ${key}`, error);
            throw error;
        }
    }

    /**
     * Cache-Daten laden
     */
    async getCache(key) {
        try {
            if (!this.db) await this.initialize();
            
            const transaction = this.db.transaction([this.stores.cache], 'readonly');
            const store = transaction.objectStore(this.stores.cache);
            
            const cacheObject = await new Promise((resolve, reject) => {
                const request = store.get(key);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
            
            if (!cacheObject) {
                return null;
            }
            
            // Check if expired
            if (new Date() > cacheObject.expires) {
                await this.deleteCache(key);
                return null;
            }
            
            console.log(`🗂️ Cache hit: ${key}`);
            return cacheObject.data;
            
        } catch (error) {
            console.error(`❌ Failed to get cache: ${key}`, error);
            return null;
        }
    }

    /**
     * Cache-Eintrag löschen
     */
    async deleteCache(key) {
        try {
            if (!this.db) await this.initialize();
            
            const transaction = this.db.transaction([this.stores.cache], 'readwrite');
            const store = transaction.objectStore(this.stores.cache);
            
            await new Promise((resolve, reject) => {
                const request = store.delete(key);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to delete cache: ${key}`, error);
            throw error;
        }
    }

    /**
     * Speicherplatz-Informationen
     */
    async getStorageInfo() {
        try {
            if (!this.db) await this.initialize();
            
            const totalUsed = await this.getTotalStorageUsed();
            const fileCount = await this.getFileCount();
            
            // Estimate available space (navigator.storage.estimate is not widely supported)
            let available = this.maxTotalSize - totalUsed;
            
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                available = estimate.quota - estimate.usage;
            }
            
            return {
                used: totalUsed,
                available: Math.max(0, available),
                total: this.maxTotalSize,
                fileCount: fileCount,
                usage: totalUsed / this.maxTotalSize * 100
            };
            
        } catch (error) {
            console.error('❌ Failed to get storage info:', error);
            throw error;
        }
    }

    /**
     * Gesamte Speichernutzung berechnen
     */
    async getTotalStorageUsed() {
        try {
            if (!this.db) await this.initialize();
            
            const transaction = this.db.transaction([this.stores.files], 'readonly');
            const store = transaction.objectStore(this.stores.files);
            
            const totalSize = await new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => {
                    const total = request.result.reduce((sum, file) => sum + (file.size || 0), 0);
                    resolve(total);
                };
                request.onerror = () => reject(request.error);
            });
            
            return totalSize;
            
        } catch (error) {
            console.error('❌ Failed to calculate total storage used:', error);
            return 0;
        }
    }

    /**
     * Anzahl Dateien zählen
     */
    async getFileCount() {
        try {
            if (!this.db) await this.initialize();
            
            const transaction = this.db.transaction([this.stores.files], 'readonly');
            const store = transaction.objectStore(this.stores.files);
            
            const count = await new Promise((resolve, reject) => {
                const request = store.count();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
            
            return count;
            
        } catch (error) {
            console.error('❌ Failed to count files:', error);
            return 0;
        }
    }

    /**
     * Alte Daten bereinigen
     */
    async cleanup() {
        try {
            console.log('🧹 Starting cleanup...');
            
            if (!this.db) await this.initialize();
            
            let cleaned = 0;
            
            // Clean expired cache
            const cacheTransaction = this.db.transaction([this.stores.cache], 'readwrite');
            const cacheStore = cacheTransaction.objectStore(this.stores.cache);
            const cacheIndex = cacheStore.index('expires');
            
            const expiredCache = await new Promise((resolve, reject) => {
                const request = cacheIndex.openCursor(IDBKeyRange.upperBound(new Date()));
                const expired = [];
                
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        expired.push(cursor.primaryKey);
                        cursor.continue();
                    } else {
                        resolve(expired);
                    }
                };
                request.onerror = () => reject(request.error);
            });
            
            for (const key of expiredCache) {
                await this.deleteCache(key);
                cleaned++;
            }
            
            // Clean old research (keep only last 100)
            const researchTransaction = this.db.transaction([this.stores.research], 'readwrite');
            const researchStore = researchTransaction.objectStore(this.stores.research);
            
            const allResearch = await new Promise((resolve, reject) => {
                const request = researchStore.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
            
            if (allResearch.length > 100) {
                const sorted = allResearch.sort((a, b) => b.timestamp - a.timestamp);
                const toDelete = sorted.slice(100);
                
                for (const research of toDelete) {
                    await new Promise((resolve, reject) => {
                        const request = researchStore.delete(research.id);
                        request.onsuccess = () => resolve();
                        request.onerror = () => reject(request.error);
                    });
                    cleaned++;
                }
            }
            
            console.log(`✅ Cleanup completed: ${cleaned} items removed`);
            return cleaned;
            
        } catch (error) {
            console.error('❌ Cleanup failed:', error);
            throw error;
        }
    }

    /**
     * Daten komprimieren
     */
    async compressData(data) {
        try {
            // Simple compression using gzip
            const stream = new CompressionStream('gzip');
            const writer = stream.writable.getWriter();
            const reader = stream.readable.getReader();
            
            writer.write(new Uint8Array(data));
            writer.close();
            
            const chunks = [];
            let done = false;
            
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) chunks.push(value);
            }
            
            const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
            let offset = 0;
            
            for (const chunk of chunks) {
                compressed.set(chunk, offset);
                offset += chunk.length;
            }
            
            return compressed.buffer;
            
        } catch (error) {
            console.warn('⚠️ Compression failed, storing uncompressed:', error);
            return data;
        }
    }

    /**
     * Daten dekomprimieren
     */
    async decompressData(compressedData) {
        try {
            const stream = new DecompressionStream('gzip');
            const writer = stream.writable.getWriter();
            const reader = stream.readable.getReader();
            
            writer.write(new Uint8Array(compressedData));
            writer.close();
            
            const chunks = [];
            let done = false;
            
            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) chunks.push(value);
            }
            
            const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
            let offset = 0;
            
            for (const chunk of chunks) {
                decompressed.set(chunk, offset);
                offset += chunk.length;
            }
            
            return decompressed.buffer;
            
        } catch (error) {
            console.warn('⚠️ Decompression failed, returning as-is:', error);
            return compressedData;
        }
    }

    /**
     * Blob zu ArrayBuffer konvertieren
     */
    async blobToArrayBuffer(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(blob);
        });
    }

    /**
     * Bytes formatieren
     */
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    /**
     * Datenbank zurücksetzen
     */
    async reset() {
        try {
            console.log('🔄 Resetting local storage...');
            
            if (this.db) {
                this.db.close();
            }
            
            await new Promise((resolve, reject) => {
                const deleteRequest = indexedDB.deleteDatabase(this.dbName);
                deleteRequest.onsuccess = () => resolve();
                deleteRequest.onerror = () => reject(deleteRequest.error);
            });
            
            this.db = null;
            await this.initialize();
            
            console.log('✅ Local storage reset completed');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to reset local storage:', error);
            throw error;
        }
    }

    /**
     * Datenbank schließen
     */
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
            console.log('🔒 Local storage connection closed');
        }
    }
}

export default LocalStorageService; = () => reject(request.error);
            });
            
            console.log(`✅ File saved locally: ${fileName} (${this.formatBytes(fileSize)})`);
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to save file locally: ${fileName}`, error);
            throw error;
        }
    }

    /**
     * Datei laden (mit Dekompression)
     */
    async getFile(fileName) {
        try {
            console.log(`📂 Loading file locally: ${fileName}`);
            
            if (!this.db) await this.initialize();
            
            const transaction = this.db.transaction([this.stores.files], 'readonly');
            const store = transaction.objectStore(this.stores.files);
            
            const fileObject = await new Promise((resolve, reject) => {
                const request = store.get(fileName);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
            
            if (!fileObject) {
                throw new Error(`File not found: ${fileName}`);
            }
            
            let data = fileObject.data;
            
            // Decompress if needed
            if (fileObject.compressed) {
                data = await this.decompressData(data);
            }
            
            // Convert back to Blob
            const blob = new Blob([data], { type: fileObject.type });
            
            console.log(`✅ File loaded locally: ${fileName}`);
            return blob;
            
        } catch (error) {
            console.error(`❌ Failed to load file locally: ${fileName}`, error);
            throw error;
        }
    }

    /**
     * Alle Dateien auflisten
     */
    async listFiles() {
        try {
            if (!this.db) await this.initialize();
            
            const transaction = this.db.transaction([this.stores.files], 'readonly');
            const store = transaction.objectStore(this.stores.files);
            
            const files = await new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => {
                    const files = request.result.map(file => ({
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        modified: file.modified,
                        created: file.created,
                        compressed: file.compressed || false
                    }));
                    resolve(files);
                };
                request.onerror = () => reject(request.error);
            });
            
            console.log(`📋 Found ${files.length} files in local storage`);
            return files;
            
        } catch (error) {
            console.error('❌ Failed to list local files:', error);
            throw error;
        }
    }

    /**
     * Datei löschen
     */
    async deleteFile(fileName) {
        try {
            console.log(`🗑️ Deleting file locally: ${fileName}`);
            
            if (!this.db) await this.initialize();
            
            const transaction = this.db.transaction([this.stores.files], 'readwrite');
            const store = transaction.objectStore(this.stores.files);
            
            await new Promise((resolve, reject) => {
                const request = store.delete(fileName);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            
            console.log(`✅ File deleted locally: ${fileName}`);
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to delete file locally: ${fileName}`, error);
            throw error;
        }
    }

    /**
     * Recherche-Ergebnis speichern
     */
    async saveResearch(functionName, query, result) {
        try {
            if (!this.db) await this.initialize();
            
            const researchObject = {
                id: `${functionName}-${Date.now()}`,
                function: functionName,
                query: query,
                result: result,
                timestamp: new Date(),
                size: JSON.stringify(result).length
            };
            
            const transaction = this.db.transaction([this.stores.research], 'readwrite');
            const store = transaction.objectStore(this.stores.research);
            
            await new Promise((resolve, reject) => {
                const request = store.put(researchObject);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            
            console.log(`💾 Research saved: ${functionName} - ${query}`);
            return researchObject.id;
            
        } catch (error) {
            console.error('❌ Failed to save research:', error);
            throw error;
        }
    }

    /**
     * Recherche-Historie laden
     */
    async getResearchHistory(limit = 50) {
        try {
            if (!this.db) await this.initialize();
            
            const transaction = this.db.transaction([this.stores.research], 'readonly');
            const store = transaction.objectStore(this.stores.research);
            const index = store.index('timestamp');
            
            const research = await new Promise((resolve, reject) => {
                const request = index.getAll();
                request.onsuccess = () => {
                    const sorted = request.result
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .slice(0, limit);
                    resolve(sorted);
                };
                request.onerror