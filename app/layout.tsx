import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { UserAuthProvider } from "@/contexts/user-auth-context";
import { OperatorAuthProvider } from "@/contexts/operator-auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { BookingProvider } from "@/contexts/booking-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "UTHBUS – Book Bus Tickets Online in Nepal",
    template: "%s | UTHBUS",
  },
  description:
    "Book bus tickets online across Nepal. Real-time seat availability, verified operators, instant e-ticket. Kathmandu to Pokhara, Biratnagar, Dharan, Itahari, Damak, and more.",
  metadataBase: new URL("https://uthbus.com"),
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
              <BookingProvider>
                <Navbar />
                {children}
              </BookingProvider>
            </OperatorAuthProvider>
          </UserAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
