export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  plan: 'basic' | 'pro';
  status: 'active' | 'banned';
  createdAt: string;
  shopName?: string;
}

export enum View {
  HOME = 'HOME',
  CHAT = 'CHAT',
  CALCULATOR = 'CALCULATOR',
  DUE_LIST = 'DUE_LIST',
  DUE_ANALYSIS = 'DUE_ANALYSIS',
  INVOICE = 'INVOICE',
  REPORTS = 'REPORTS',
  PRICING_TOOL = 'PRICING_TOOL',
  LOSS_PREVENTION = 'LOSS_PREVENTION',
  GUIDELINES = 'GUIDELINES',
  SALES_TIPS = 'SALES_TIPS',
  TARGET_HISTORY = 'TARGET_HISTORY',
  PRINTER_SETTINGS = 'PRINTER_SETTINGS',
  QR_SCANNER = 'QR_SCANNER',
  PLANS = 'PLANS',
  NOTEPAD = 'NOTEPAD',
  CALENDAR = 'CALENDAR',
  SALES_LIST = 'SALES_LIST',
  DAILY_PROFIT = 'DAILY_PROFIT'
}

export interface CustomerDue {
  id: string;
  customerId: string;
  name: string;
  mobile: string;
  amount: number;
  daysPending: number;
  risk: 'High' | 'Medium' | 'Low';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  total_due: number;
  last_payment_date?: string;
  risk_level: 'High' | 'Medium' | 'Low';
}

export interface Transaction {
  id: string;
  date: string;
  type: 'Income' | 'Expense';
  amount: number;
  category: string;
  description?: string;
  customer_id?: string;
  profit?: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id?: string;
  product_list: any[];
  discount: number;
  total_amount: number;
  created_at: string;
}

export interface Note {
  id: string;
  content: string;
  audio_path?: string;
  timestamp: string;
  createdAt?: string;
}

export interface AIInsight {
  id: string;
  insight_type: string;
  message: string;
}

export interface DailyReportItem {
  day: string;
  sales: number;
  expense: number;
}

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}
