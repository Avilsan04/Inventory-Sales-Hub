import * as React from 'react';
import {
  MessageSquareIcon,
  ShoppingBagIcon,
  TruckIcon,
  CloudIcon,
  ArchiveIcon,
  CarIcon,
} from 'lucide-react';
import { useTranslationAdapter } from '@shared/adapters/useTranslationAdapter';
import { Reveal } from '@shared/ui/animated';
import styles from '@shared/styles/themes/pages/Landing.module.scss';

const BRANDS = ['Slack', 'Shopify', 'DoorDash', 'Salesforce', 'Dropbox', 'Uber'] as const;
type BrandName = (typeof BRANDS)[number];

function renderBrandIcon(name: BrandName): React.ReactElement {
  switch (name) {
    case 'Slack':      return <MessageSquareIcon aria-hidden="true" />;
    case 'Shopify':    return <ShoppingBagIcon   aria-hidden="true" />;
    case 'DoorDash':   return <TruckIcon         aria-hidden="true" />;
    case 'Salesforce': return <CloudIcon         aria-hidden="true" />;
    case 'Dropbox':    return <ArchiveIcon       aria-hidden="true" />;
    case 'Uber':       return <CarIcon           aria-hidden="true" />;
  }
}

export function TrustedBySection(): React.ReactElement {
  const { translate } = useTranslationAdapter();

  return (
    <section className={styles['trustedBy']} aria-labelledby="trusted-heading">
      <div className={styles['trustedInner']}>
        <Reveal direction="fade">
          <h2 id="trusted-heading" className={styles['trustedTitle']}>
            {translate('landing.trusted.title')}
          </h2>
        </Reveal>

        <div className={styles['trustedLogos']}>
          {BRANDS.map((name, idx) => (
            <Reveal key={name} direction="fade" delay={idx * 0.07}>
              <span className={styles['trustedLogo']}>
                {renderBrandIcon(name)}
                {name}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
