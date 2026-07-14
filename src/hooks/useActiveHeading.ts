import { useEffect, useState } from 'react';
import type { TocItem } from '../types/blog';

export function useActiveHeading(items: TocItem[]) {
  const [observedId, setObservedId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0 || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

        if (visibleEntry?.target.id) setObservedId(visibleEntry.target.id);
      },
      { rootMargin: '-15% 0px -70% 0px', threshold: [0, 1] },
    );

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [items]);

  return items.some((item) => item.id === observedId) ? observedId : items[0]?.id ?? null;
}
