import * as React from 'react';
import {
  SlackIcon,
  ShoppingBagIcon,
  TruckIcon,
  CloudIcon,
  ArchiveIcon,
  CarIcon,
} from 'lucide-react';
import { useTranslationAdapter } from '@shared/adapters/useTranslationAdapter';
import { Reveal } from '@shared/ui/animated';
import styles from '@shared/styles/themes/pages/Landing.module.scss';

interface BrandConfig {
  readonly name: string;
  readonly Icon: React.ComponentType<{ 'aria-hidden': string; className?: string }>;
}

const BRANDS: readonly BrandConfig[] = [
  { name: 'Slack', Icon: SlackIcon },
  { name: 'Shopify', Icon: ShoppingBagIcon },
  { name: 'DoorDash', Icon: TruckIcon },
  { name: 'Salesforce', Icon: CloudIcon },
  { name: 'Dropbox', Icon: ArchiveIcon },
  { name: 'Uber', Icon: CarIcon },
] as const;

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
          {BRANDS.map(({ name, Icon }, idx) => (
            <Reveal key={name} direction="fade" delay={idx * 0.07}>
              <span className={styles['trustedLogo']}>
                <Icon aria-hidden="true" />
                {name}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
