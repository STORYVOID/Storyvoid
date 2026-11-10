
import { useCallback, useState } from 'react';

const TITLE_KEY = 'storyvoid_featured_title';
const IMAGE_KEY = 'storyvoid_custom_banner_image';

export const useFeaturedBanner = () => {
  const [customTitle, setCustomTitle] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(TITLE_KEY) || '';
  });

  const [customImage, setCustomImage] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(IMAGE_KEY) || '';
  });

  const updateTitle = useCallback((value: string) => {
    setCustomTitle(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TITLE_KEY, value);
    }
  }, []);

  const updateImage = useCallback((value: string) => {
    setCustomImage(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem(IMAGE_KEY, value);
    }
  }, []);

  return {
    customTitle,
    customImage,
    updateTitle,
    updateImage,
  };
};
