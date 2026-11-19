/** "17 Nov, 10:46" in the viewer's time zone. */
export const formatDateTime = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

/** "17 Nov 2026" */
export const formatDate = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

export const plural = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`;

export const APP_NAME = "WhatsApp Marketing";
