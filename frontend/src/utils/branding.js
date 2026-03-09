const DEFAULT_FAVICON = "/vite.svg";

function ensureFaviconElement() {
  let link = document.querySelector("link[rel='icon']");

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "icon");
    document.head.appendChild(link);
  }

  return link;
}

export function setDocumentBranding({ title, favicon }) {
  if (title) {
    document.title = title;
  }

  const iconHref = favicon || DEFAULT_FAVICON;
  const faviconElement = ensureFaviconElement();
  faviconElement.setAttribute("href", iconHref);
}

export { DEFAULT_FAVICON };
