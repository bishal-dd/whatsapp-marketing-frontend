import type { Metadata } from "next";
import { APP_NAME } from "@/src/lib/format";
import { Providers } from "./providers";
import "@fontsource-variable/onest";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: "Send WhatsApp messages to your contacts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Browser extensions (e.g. ColorZilla) add attributes to <body>; ignore those differences. */}
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
