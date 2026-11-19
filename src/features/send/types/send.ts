/** Where each {{n}} in the template comes from. */
export type VariableSource =
  | { type: "field"; field: "first_name" | "name" | "phone"; fallback?: string }
  | { type: "text"; value: string };

/** Ticked contacts, or everyone subscribed. */
export type Recipients = { mode: "selected"; contactIds: string[] } | { mode: "all" };

export interface SendInput {
  templateId: string;
  variables: VariableSource[];
  recipients: Recipients;
}

export interface Preview {
  recipients: number;
  byCountry: Record<string, number>;
  cost: { currency: string; total: number; recipientsWithoutRate: number };
  category: string;
  dailyLimit: number | null;
  exceedsDailyLimit: boolean;
  samples: { phone: string; name: string | null; body: string }[];
  sendable: boolean;
}
