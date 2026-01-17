import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DrawSync Studio - Collaborative Whiteboard",
  description: "A collaborative whiteboard application with real-time drawing, shapes, text, and export features",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

