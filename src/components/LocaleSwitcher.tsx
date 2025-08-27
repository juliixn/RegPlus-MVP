
"use client";

import { useLocale } from './LocaleProvider';
import { Button } from './ui/button';
import Image from 'next/image';

export default function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();

  const toggleLocale = () => {
    setLocale(locale === 'es' ? 'en' : 'es');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLocale}
      className="flex items-center gap-2"
    >
      <Image
        src={locale === 'es' ? '/flags/es.svg' : '/flags/us.svg'}
        alt={locale === 'es' ? 'Spanish' : 'English'}
        width={20}
        height={20}
        className="rounded-full"
      />
      <span className="uppercase">{locale}</span>
    </Button>
  );
}
