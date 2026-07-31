import type { Metadata } from "next";
import { Baloo_2, Inter } from "next/font/google";
import { AppShell } from "@/components/shell/app-shell";
import { getSession } from "@/lib/auth/get-session";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

export const metadata: Metadata = {
  title: "QuestPad",
  description: "Single-family learning tracker",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${baloo.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <AppShell initialSession={session}>{children}</AppShell>
      </body>
    </html>
  );
}
