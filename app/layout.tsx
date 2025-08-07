import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { UserAuthProvider } from "@/contexts/user-auth-context";
import { OperatorAuthProvider } from "@/contexts/operator-auth-context";

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
    <html lang="en">
      <body className="antialiased">
        <UserAuthProvider>
          <OperatorAuthProvider>
            <Navbar />
            {children}
          </OperatorAuthProvider>
        </UserAuthProvider>
      </body>
    </html>
  );
}