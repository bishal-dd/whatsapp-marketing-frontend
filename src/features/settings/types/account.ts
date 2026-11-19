export interface WhatsAppAccount {
  connected: boolean;
  phoneNumberId: string | null;
  wabaId: string | null;
  accessTokenHint: string | null;
  displayPhone: string | null;
  verifiedName: string | null;
  qualityRating: string | null;
  defaultCountry: string;
  sendRatePerSecond: number;
  dailyLimit: number;
  lastWebhookAt: string | null;
  webhookPath: string;
  webhookReady: boolean;
  /** Number, account ID and token come from the server's .env; Settings can't change them. */
  managedByEnv: boolean;
}

export interface SaveAccountInput {
  /** Left out when the number is set in the server's .env. */
  phoneNumberId?: string;
  wabaId?: string;
  accessToken?: string;
  defaultCountry: string;
  dailyLimit: number;
  sendRatePerSecond: number;
}
