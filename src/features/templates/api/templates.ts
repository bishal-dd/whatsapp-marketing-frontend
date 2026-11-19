import { api, type Data } from "@/src/lib/api";
import type { NewTemplate, Template } from "../types/template";

export const listTemplates = () => api<Data<Template[]>>("GET", "/templates");
export const syncTemplates = () =>
  api<Data<Template[]> & { message: string }>("POST", "/templates/sync");
export const createTemplate = (input: NewTemplate) =>
  api<Data<Template> & { message: string }>("POST", "/templates", input);
export const deleteTemplate = (id: string) =>
  api<{ success: boolean; message: string }>("DELETE", `/templates/${id}`);
