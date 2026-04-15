import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { UserAuthProvider } from "@/contexts/user-auth-context";
import { OperatorAuthProvider } from "@/contexts/operator-auth-context";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UTHBUS - Bus Booking System",
  description: "Book bus tickets easily and manage your travels",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <UserAuthProvider>
            <OperatorAuthProvider>
              <Navbar />
              {children}
            </OperatorAuthProvider>
          </UserAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
