export interface QuoteItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface QuoteFormData {
  recipientName: string;
  recipientLast: string;
  recipientCompany: string;
  title: string;
  subject: string;
  clientId: number;
  senderId: number;
  items: QuoteItem[];
  totalAmount: number;
  notes: string;
  paymentTerms: string;
  senderSignature: string;
}

export interface ClientData {
  id?: number;
  name: string;
  brand: string;
  paymentTerms: string;
}

export interface SenderData {
  id?: number;
  fullName: string;
  title: string;
}

export const SUBJECTS = [
  "מדיה",
  "סטודיו",
  "קריאייטיב",
  "אסטרטגיה",
  "שונות",
] as const;
