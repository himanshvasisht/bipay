// BiPay Ecosystem - Core Payment System
import { BiPayBiometricDatabase } from './biometricDatabase';

export interface BiPayUser {
  id: string;
  phoneNumber: string;
  pin: string;
  balance: number;
  hasBiometric: boolean;
  createdAt: Date;
}

export interface BiPayTransaction {
  id: string;
  fromUserId: string;
  toUserId?: string;
  amount: number;
  type: 'payment' | 'transfer';
  status: 'completed' | 'failed';
  timestamp: Date;
  biometricAuth: boolean;
}

export class BiPayEcosystem {
  private users: Map<string, BiPayUser> = new Map();
  private transactions: BiPayTransaction[] = [];
  private biometricDB: BiPayBiometricDatabase;

  constructor() {
    this.biometricDB = BiPayBiometricDatabase.getInstance();
  }

  async registerUser(phoneNumber: string, pin: string, biometricData?: any): Promise<BiPayUser> {
    const userId = `user_${Date.now()}`;
    
    const user: BiPayUser = {
      id: userId,
      phoneNumber,
      pin,
      balance: 1000,
      hasBiometric: false,
      createdAt: new Date()
    };

    if (biometricData) {
      await this.biometricDB.enrollBiometric(userId, biometricData.fingerprint, biometricData.face);
      user.hasBiometric = true;
    }

    this.users.set(userId, user);
    return user;
  }

  async authenticateUser(phoneNumber: string, pin?: string, biometricData?: any): Promise<BiPayUser | null> {
    const user = Array.from(this.users.values()).find(u => u.phoneNumber === phoneNumber);
    
    if (!user) return null;

    if (biometricData && user.hasBiometric) {
      const isAuth = await this.biometricDB.authenticateByBiometric(biometricData.fingerprint);
      if (isAuth) return user;
    }

    if (pin && user.pin === pin) {
      return user;
    }

    return null;
  }

  getUser(userId: string): BiPayUser | undefined {
    return this.users.get(userId);
  }

  getUserByPhone(phoneNumber: string): BiPayUser | undefined {
    return Array.from(this.users.values()).find(u => u.phoneNumber === phoneNumber);
  }
}

export const biPayEcosystem = new BiPayEcosystem();
