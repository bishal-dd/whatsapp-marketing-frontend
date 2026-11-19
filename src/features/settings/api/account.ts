import { api, type Data } from "@/src/lib/api";
import type { SaveAccountInput, WhatsAppAccount } from "../types/account";

export const getAccount = () => api<Data<WhatsAppAccount>>("GET", "/whatsapp/account");
export const saveAccount = (input: SaveAccountInput) => api<Data<WhatsAppAccount>>("PUT", "/whatsapp/account", input);
export const checkAccount = () => api<Data<WhatsAppAccount & { messagingTier: string | null }>>("POST", "/whatsapp/account/check");
