import Script from "next/script";
import "./globals.css";
import TrackingManager from "./components/TrackingManager";
import siteContent from "../data/site-content.json";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://edward-hallam.com"),
  title: siteContent.seo.title,
  description: siteContent.seo.description,
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: siteContent.seo.title,
    description: siteContent.seo.description,
    images: [{ url: siteContent.assets.profile, alt: "Edward Hallam" }],
    siteName: "Edward Hallam",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteContent.seo.title,
    description: siteContent.seo.description,
    images: [siteContent.assets.profile],
  },
};

// The AquaCRM bot challenge guards the enquiry forms (same as the link-tree page).
const challengeSrc = process.env.NODE_ENV === "development"
  ? "http://localhost:3032/aqua-bot-challenge.js"
  : "https://www.aqua-crm.co.uk/aqua-bot-challenge.js";
const botSrc = process.env.NODE_ENV === "development"
  ? "http://localhost:3032/aqua-bot.js"
  : "https://www.aqua-crm.co.uk/aqua-bot.js";

export default function RootLayout({ children }) {
  return (
    // mode-transition.js toggles a class on <html> before hydration.
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/mode-transition.css" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts -- must run before first paint */}
        <script src="/mode-transition.js" />
      </head>
      <body>
        <TrackingManager />
        {children}
        <Script src={challengeSrc} strategy="afterInteractive" />
        {/* Aqua Bot, Ed's own bot (form-gated chat that lands in AquaCRM). */}
        <Script src={botSrc} data-bot="edward-hallam" strategy="afterInteractive" />
      </body>
    </html>
  );
}
