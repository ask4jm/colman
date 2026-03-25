import { Geist, Geist_Mono } from "next/font/google";
import AppToaster from "../components/app-toaster";
import { PortalProvider } from "../components/portal-provider";
import { ThemeProvider } from "../components/theme-provider";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Panchayat Cash Collection Portal",
  description:
    "Manual village cash collection workflow for collectors with daily or weekly submission to the main station.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <ThemeProvider>
          <PortalProvider>
            {children}
            <AppToaster />
          </PortalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
