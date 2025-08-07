import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { UserAuthProvider } from "@/contexts/user-auth-context";
import { OperatorAuthProvider } from "@/contexts/operator-auth-context";

export const metadata: Metadata = {
  title: "UTHBUS - Bus Booking System",
  description: "Book bus tickets easily and manage your travels",
};
import { OperatorAuthProvider } from '@/contexts/operator-auth-context';
import { UserAuthProvider } from '@/contexts/user-auth-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <OperatorAuthProvider>
          <UserAuthProvider>
            {children}
          </UserAuthProvider>
        </OperatorAuthProvider>
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
  );
}