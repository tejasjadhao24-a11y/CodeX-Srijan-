export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ActionTaken = 'PROCEED' | 'PAUSE_VERIFY' | 'HOLD_ESCALATE';
export type TransactionStatus = 'PENDING' | 'APPROVED' | 'CANCELLED' | 'HELD';

export interface RiskFactor {
  code: string;
  text: string;
  points?: number;
  severity?: 'info' | 'warning' | 'critical';
}

export interface EvaluateRequest {
  userId?: string;
  beneficiaryId?: string;
  newBeneficiaryName?: string;
  accountNumber?: string;
  amount: number;
  category?: string;
  deviceId?: string;
  location?: string;
  selfReportedUrgent?: boolean;
  simulatedHour?: number;
  previewMode?: boolean;
}

export interface EvaluateResponse {
  transactionId?: string;
  riskScore: number;
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  actionTaken: ActionTaken;
  isKnownBeneficiary: boolean;
  status: TransactionStatus;
  isMinorTransaction?: boolean;
  requiresGuardianApproval?: boolean;
  guardianAlertId?: string;
}

export interface SocialCheckRequest {
  answer: string;
}

export interface DeepfakeCheckRequest {
  audioFileName?: string;
  audioDuration?: number;
}

export interface FinalizeRequest {
  overrideApproved?: boolean;
  guardianApproved?: boolean;
}

export interface DashboardStatsResponse {
  totalMonitored: number;
  highCriticalCount: number;
  avgProcessingTimeMs: number;
  protectionScore: number;
  totalValueProtected: number;
  riskDistribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  recentTransactions: any[];
}

export interface GuardianStatsResponse {
  guardian: {
    id: string;
    name: string;
  };
  minors: Array<{
    id: string;
    name: string;
    avgTransactionAmount: number;
    minorSpendLimit: number;
    totalSpendThisWeek: number;
    pendingAlertsCount: number;
  }>;
  alerts: Array<{
    id: string;
    transactionId: string;
    amount: number;
    category: string;
    createdAt: string;
    acknowledged: boolean;
    status: string;
    transaction: {
      beneficiaryName: string;
      riskScore: number;
      riskLevel: string;
      status: string;
      user: {
        name: string;
      };
    };
  }>;
  categorySpend: Record<string, number>;
  merchantSpend: Record<string, number>;
}
