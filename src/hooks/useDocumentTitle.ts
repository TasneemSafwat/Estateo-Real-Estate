import { useEffect } from 'react';

interface DocumentMeta {
  title: string;
  description?: string;
  image?: string;
}

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Per-route SEO: title, meta description and Open Graph tags.
 */
export function useDocumentTitle({ title, description, image }: DocumentMeta): void {
  useEffect(() => {
    const fullTitle = title.includes('Estateo') ? title : `${title} · Estateo`;
    document.title = fullTitle;

    setMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);

    if (description) {
      setMeta('meta[name="description"]', 'name', 'description', description);
      setMeta('meta[property="og:description"]', 'property', 'og:description', description);
      setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    }

    if (image) {
      setMeta('meta[property="og:image"]', 'property', 'og:image', image);
    }
  }, [title, description, image]);
}
