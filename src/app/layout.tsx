import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sonder Escape | Personality-Matched Weekend Trips",
  description:
    "Answer a 30-second survey and get a mystery weekend escape built around your travel personality.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#18181b",
              color: "#f5f5f4",
              border: "1px solid #3f3f46",
              borderRadius: "14px",
              fontSize: "14px",
              padding: "12px 16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
            },
            success: {
              iconTheme: {
                primary: "#dcff73",
                secondary: "#18181b",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#18181b",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
