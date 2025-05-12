import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CSV Data Manager - Debug Challenge",
  description: "A debugging challenge for job candidates",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
