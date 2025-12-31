
import { MedicalItem, Transaction, User, UserRole, TransactionType } from './types';

const DB_NAME = 'AlRaziInventoryDB';
const DB_VERSION = 1;

class InventoryDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('items')) {
          db.createObjectStore('items', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('transactions')) {
          db.createObjectStore('transactions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.seedInitialAdmin();
        resolve();
      };

      request.onerror = () => reject('Database initialization failed');
    });
  }

  private async seedInitialAdmin() {
    const admin = await this.getUser('admin');
    if (!admin) {
      await this.saveUser({
        id: 'admin',
        username: 'admin',
        password: '0000',
        role: UserRole.ADMIN,
        displayName: 'مدير النظام'
      });
    }
  }

  // Generic methods
  private async getFromStore<T>(storeName: string, key: string): Promise<T | null> {
    return new Promise((resolve) => {
      if (!this.db) return resolve(null);
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  private async getAllFromStore<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve) => {
      if (!this.db) return resolve([]);
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  private async putInStore<T>(storeName: string, item: T): Promise<void> {
    return new Promise((resolve) => {
      if (!this.db) return resolve();
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      store.put(item);
      transaction.oncomplete = () => resolve();
    });
  }

  private async deleteFromStore(storeName: string, key: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.db) return resolve();
      const transaction = this.db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      store.delete(key);
      transaction.oncomplete = () => resolve();
    });
  }

  // Users
  async getUser(username: string): Promise<User | null> {
    return this.getFromStore<User>('users', username);
  }
  async saveUser(user: User): Promise<void> {
    return this.putInStore('users', user);
  }
  async deleteUser(userId: string): Promise<void> {
    return this.deleteFromStore('users', userId);
  }

  // Items
  async getItems(): Promise<MedicalItem[]> {
    return this.getAllFromStore<MedicalItem>('items');
  }
  async saveItem(item: MedicalItem): Promise<void> {
    return this.putInStore('items', item);
  }

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    const txs = await this.getAllFromStore<Transaction>('transactions');
    return txs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  async saveTransaction(tx: Transaction): Promise<void> {
    // Also update item quantity
    const item = await this.getFromStore<MedicalItem>('items', tx.itemId);
    if (item) {
      if (tx.type === TransactionType.INBOUND) {
        item.currentQuantity += tx.quantity;
      } else {
        item.currentQuantity -= tx.quantity;
      }
      await this.saveItem(item);
    }
    return this.putInStore('transactions', tx);
  }
  
  async updateTransaction(tx: Transaction, oldQty: number, oldType: TransactionType): Promise<void> {
    const item = await this.getFromStore<MedicalItem>('items', tx.itemId);
    if (item) {
      // Revert old effect
      if (oldType === TransactionType.INBOUND) item.currentQuantity -= oldQty;
      else item.currentQuantity += oldQty;
      
      // Apply new effect
      if (tx.type === TransactionType.INBOUND) item.currentQuantity += tx.quantity;
      else item.currentQuantity -= tx.quantity;
      
      await this.saveItem(item);
    }
    return this.putInStore('transactions', tx);
  }
}

export const dbService = new InventoryDB();
