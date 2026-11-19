export type TemplateCategory = "MARKETING" | "UTILITY" | "AUTHENTICATION";

export interface Template {
  id: string;
  name: string;
  language: string;
  category: TemplateCategory;
  /** APPROVED, PENDING, REJECTED… */
  status: string;
  rejectedReason: string | null;
  body: string;
  variableCount: number;
  unsupportedReason: string | null;
  sendable: boolean;
  components?: TemplateComponent[];
}

export interface TemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS";
  format?: string;
  text?: string;
  buttons?: { type: string; text: string; url?: string }[];
}

export type TemplateButton =
  | { type: "QUICK_REPLY"; text: string }
  | { type: "URL"; text: string; url: string };

/** What the "New message" form sends. Meta reviews it before it can be used. */
export interface NewTemplate {
  name: string;
  language: string;
  category: "UTILITY" | "MARKETING";
  header?: string;
  body: string;
  footer?: string;
  /** One example per {{n}}, in order. */
  examples: string[];
  buttons: TemplateButton[];
}
