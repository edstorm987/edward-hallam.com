"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import siteContent from "../../data/site-content.json";

const consentKey = "mariusCookieConsent";

function normalizePath(path) {
  if (!path) return "/";
  const clean = path.split("?")[0].split("#")[0] || "/";
  return clean.length > 1 ? clean.replace(/\/+$/, "") : clean;
}

function pageMatches(pages = [], pathname = "/") {
  const targets = Array.isArray(pages) && pages.length ? pages : ["/"];
  const current = normalizePath(pathname);

  return targets.some((target) => {
    const normalized = normalizePath(target);
    if (normalized === "*" || normalized === "/*") return true;
    return normalized === current;
  });
}

function canLoad({ bannerEnabled, consent, respectConsent }) {
  if (!respectConsent) return true;
  if (!bannerEnabled) return true;
  return consent === "accepted";
}

function loadScript(id, src) {
  if (document.getElementById(id)) return;

  const script = document.createElement("script");
  script.async = true;
  script.id = id;
  script.src = src;
  document.head.appendChild(script);
}

function loadInlineScript(id, code) {
  if (document.getElementById(id)) return;

  const script = document.createElement("script");
  script.id = id;
  script.textContent = code;
  document.head.appendChild(script);
}

function loadGoogleTag(measurementId) {
  if (!measurementId) return;

  loadScript("marius-google-tag", `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`);
  loadInlineScript(
    "marius-google-tag-init",
    `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${measurementId}');`
  );
}

function loadMetaPixel(pixelId) {
  if (!pixelId || window.fbq) return;

  loadInlineScript(
    "marius-meta-pixel",
    `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`
  );
}

function fireImagePixel(url) {
  if (!url) return;

  const image = new Image();
  image.src = url;
}

export default function TrackingManager() {
  const pathname = usePathname() || "/";
  const tracking = siteContent.tracking || {};
  const banner = tracking.cookieBanner || {};
  const isPublicPage = !pathname.startsWith("/portal") && pathname !== "/login";
  const [consent, setConsent] = useState("loading");
  const bannerEnabled = Boolean(banner.enabled && isPublicPage);

  useEffect(() => {
    setConsent(window.localStorage.getItem(consentKey) || "unset");
  }, []);

  useEffect(() => {
    if (!isPublicPage || consent === "loading") return;

    const googleTag = tracking.googleTag || {};
    if (
      googleTag.enabled &&
      pageMatches(googleTag.pages, pathname) &&
      canLoad({ bannerEnabled, consent, respectConsent: googleTag.respectConsent !== false })
    ) {
      loadGoogleTag(googleTag.measurementId);
    }

    (tracking.pixels || []).forEach((pixel, index) => {
      if (
        !pixel.enabled ||
        !pageMatches(pixel.pages, pathname) ||
        !canLoad({ bannerEnabled, consent, respectConsent: pixel.respectConsent !== false })
      ) {
        return;
      }

      if (pixel.provider === "meta") {
        loadMetaPixel(pixel.pixelId);
      } else if (pixel.pixelUrl) {
        fireImagePixel(pixel.pixelUrl);
      } else if (pixel.scriptUrl) {
        loadScript(`marius-pixel-${index}`, pixel.scriptUrl);
      }
    });
  }, [bannerEnabled, consent, isPublicPage, pathname, tracking]);

  const shouldShowBanner = useMemo(() => {
    return bannerEnabled && consent === "unset";
  }, [bannerEnabled, consent]);

  const chooseConsent = (value) => {
    window.localStorage.setItem(consentKey, value);
    setConsent(value);
  };

  if (!shouldShowBanner) return null;

  return (
    <aside className="cookie-consent" aria-label="Cookie consent">
      <div>
        <strong>{banner.title || "Cookies"}</strong>
        <p>{banner.body || "We use cookies and tags to improve the site experience."}</p>
      </div>
      <div>
        <button type="button" onClick={() => chooseConsent("rejected")}>
          {banner.rejectLabel || "Reject"}
        </button>
        <button type="button" onClick={() => chooseConsent("accepted")}>
          {banner.acceptLabel || "Accept"}
        </button>
      </div>
    </aside>
  );
}
