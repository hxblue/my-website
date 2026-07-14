import { useEffect } from 'react';

interface PageMetaInput {
  title: string;
  description: string;
  image?: string;
}

const ensureMeta = (selector: string, attribute: 'name' | 'property', value: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  return element;
};

export function usePageMeta({ title, description, image }: PageMetaInput) {
  useEffect(() => {
    const previousTitle = document.title;
    const descriptionMeta = ensureMeta('meta[name="description"]', 'name', 'description');
    const ogTitle = ensureMeta('meta[property="og:title"]', 'property', 'og:title');
    const ogDescription = ensureMeta(
      'meta[property="og:description"]',
      'property',
      'og:description',
    );
    const ogImage = image
      ? ensureMeta('meta[property="og:image"]', 'property', 'og:image')
      : null;
    const previousValues = [descriptionMeta, ogTitle, ogDescription, ogImage].map(
      (element) => element?.getAttribute('content') ?? null,
    );

    document.title = title;
    descriptionMeta.setAttribute('content', description);
    ogTitle.setAttribute('content', title);
    ogDescription.setAttribute('content', description);
    if (ogImage && image) ogImage.setAttribute('content', image);

    return () => {
      document.title = previousTitle;
      [descriptionMeta, ogTitle, ogDescription, ogImage].forEach((element, index) => {
        if (!element) return;
        const previousValue = previousValues[index];
        if (previousValue === null) element.removeAttribute('content');
        else element.setAttribute('content', previousValue);
      });
    };
  }, [description, image, title]);
}
