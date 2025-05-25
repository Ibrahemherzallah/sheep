
// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager';
}

// Sheep Types
export type SheepOrigin = 'bought' | 'farm-produced';
export type SheepSex = 'male' | 'female';
export type SheepStatus = 'healthy' | 'sick' | 'pregnant' | 'giving-birth-soon';

export interface Sheep {
  id: string;
  sheepNumber: string;
  origin: SheepOrigin;
  birthDate?: Date;
  sex: SheepSex;
  isPregnant: boolean;
  pregnantSince?: Date;
  expectedBirthDate?: Date;
  milkProductionCapacity?: number;
  status: SheepStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Medical Types
export interface Disease {
  id: string;
  name: string;
  description?: string;
}

export interface Medicine {
  id: string;
  name: string;
  description?: string;
  dosage?: string;
}

export interface Vitamin {
  id: string;
  name: string;
  description?: string;
}

// Stock Types
export interface StockItem {
  id: string;
  itemType: 'medicine' | 'injection' | 'vitamin' | 'feed' | 'straw';
  itemId?: string; // Reference to medicine/injection/vitamin ID if applicable
  name: string;
  quantity: number;
  unit: string;
  lastUpdated: Date;
  notes?: string;
}

export interface StockCategory {
  category: string;
  items: StockItem[];
}

export type MedicalEventType = 'routine-injection' | 'post-birth-injection' | 'disease' | 'medication' | 'vitamin' | 'recovered';

export interface MedicalEvent {
  id: string;
  sheepId: string;
  type: MedicalEventType;
  date: Date;
  diseaseId?: string;
  medicineId?: string;
  vitaminId?: string;
  notes?: string;
  createdAt: Date;
  isCompleted: boolean;
}

// Birth Record
export interface BirthRecord {
  id: string;
  motherId: string;
  date: Date;
  childrenCount: number;
  maleCount: number;
  femaleCount: number;
  childIds: string[];
  notes?: string;
}

// Cycle Types
export interface Cycle {
  id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  sheepIds: string[];
  initialMaleCount: number;
  initialFemaleCount: number;
  status: string;
  notes?: string;
}

export interface WeeklyCycleRecord {
  id: string;
  cycleId: string;
  weekStartDate: Date;
  feedQuantity: number;
  milkQuantity: number;
  vitaminsGiven: string[];
  syringesGiven: number;
  notes?: string;
}

export interface CycleSummary {
  id: string;
  cycleId: string;
  startDate: Date;
  endDate: Date;
  totalFeed: number;
  totalMilk: number;
  totalVitamins: Record<string, number>;
  totalSyringes: number;
  deadSheepCount: number;
  soldSheepCount: number;
  soldTotalWeight: number;
  soldPricePerKilo: number;
  addedToStockCount: number;
  notes?: string;
}

// Notification Type
export type NotificationType = 
  | 'birth-approaching' 
  | 'routine-injection-due' 
  | 'post-birth-injection-due' 
  | 'healing-update';

export interface Notification {
  id: string;
  type: NotificationType;
  sheepId?: string;
  cycleId?: string;
  message: string;
  date: Date;
  isRead: boolean;
}

// Stock Movement
export type StockMovementType = 'added' | 'sold' | 'dead' | 'consumed';

export interface StockMovement {
  id: string;
  sheepIds?: string[];
  cycleId?: string;
  stockItemId: string;
  type: StockMovementType;
  date: Date;
  quantity: number;
  notes?: string;
}
