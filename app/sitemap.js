import siteContent from "../data/site-content.json";

function cleanBaseUrl(value) {
  return String(value || "https://mariusgrigore.com").replace(/\/+$/, "");
}

function cleanPath(value) {
  const path = String(value || "/").trim();
  return path.startsWith("/") ? path : `/${path}`;
}

export default function sitemap() {
  const siteMap = siteContent.siteMap || {};
  const baseUrl = cleanBaseUrl(siteMap.baseUrl);
  const pages = Array.isArray(siteMap.pages) ? siteMap.pages : [];

  return pages
    .filter((page) => page.enabled)
    .map((page) => ({
      changeFrequency: page.changeFrequency || "monthly",
      lastModified: new Date(),
      priority: Number(page.priority) || 0.5,
      url: `${baseUrl}${cleanPath(page.path)}`,
    }));
}
