import siteContent from "../data/site-content.json";

function cleanBaseUrl(value) {
  return String(value || "https://mariusgrigore.com").replace(/\/+$/, "");
}

function cleanPath(value) {
  const path = String(value || "/").trim();
  return path.startsWith("/") ? path : `/${path}`;
}

export default function robots() {
  const siteMap = siteContent.siteMap || {};
  const robotsConfig = siteContent.robots || {};
  const baseUrl = cleanBaseUrl(siteMap.baseUrl);
  const disallow = Array.isArray(robotsConfig.disallow) ? robotsConfig.disallow : [];
  const sitemapPath = cleanPath(robotsConfig.sitemapPath || "/sitemap.xml");

  return {
    rules: {
      allow: robotsConfig.allowIndexing === false ? undefined : "/",
      disallow: robotsConfig.allowIndexing === false ? "/" : disallow,
      userAgent: "*",
    },
    sitemap: `${baseUrl}${sitemapPath}`,
  };
}
