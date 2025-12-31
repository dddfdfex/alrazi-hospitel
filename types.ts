
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  displayName: string;
}

export interface MedicalItem {
  id: string;
  name: string;
  code: string;
  category: string;
  unit: string;
  currentQuantity: number;
  addedAt: string;
}

export enum TransactionType {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND'
}

export interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  type: TransactionType;
  quantity: number;
  timestamp: string; // ISO String for full precision
  userId: string;
  username: string;
}
