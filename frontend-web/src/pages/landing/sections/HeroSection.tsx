import * as React from 'react';
import { PackageIcon, ArrowRightIcon, XIcon } from 'lucide-react';
import { useTranslationAdapter } from '@shared/adapters/useTranslationAdapter';
import { Button } from '@shared/ui/primitives';
import { cn } from '@shared/lib/cn';
import styles from '@shared/styles/themes/pages/Landing.module.scss';

interface HeroSectionProps {
  readonly onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps): React.ReactElement {
  const { translate } = useTranslationAdapter();
  const [isFlipped, setIsFlipped] = React.useState<boolean>(false);

  const toggleFlip = React.useCallback((): void => {
    setIsFlipped((prev) => !prev);
  }, []);

  return (
    <section className={styles['hero']} aria-labelledby="hero-heading">
      <div className={styles['heroBackground']} aria-hidden="true">
        <div className={styles['heroGlow']} />
        <div className={styles['heroGrid']} />
      </div>

      <div className={cn(styles['heroFlipContainer'], isFlipped && styles['isFlipped'])}>
        
        {/* FRONT FACE */}
        <div 
          className={styles['heroFront']} 
          aria-hidden={isFlipped} 
          tabIndex={isFlipped ? -1 : undefined}
        >
          <div className={styles['heroContent']}>
            <div className={styles['heroBadge']}>
              <PackageIcon aria-hidden="true" />
              <span>{translate('landing.hero.badge')}</span>
            </div>

            <h1 id="hero-heading" className={styles['heroTitle']}>
              {translate('landing.hero.titleLine1')}
              <span className={styles['heroTitleAccent']}>
                {translate('landing.hero.titleAccent')}
              </span>
            </h1>

            <p className={styles['heroDescription']}>
              {translate('landing.hero.description')}
            </p>

            <div className={styles['heroActions']}>
              <Button size="lg" onClick={onGetStarted}>
                {translate('landing.hero.cta')}
                <ArrowRightIcon aria-hidden="true" />
              </Button>
              <Button variant="outline" size="lg" onClick={toggleFlip}>
                {translate('landing.hero.secondaryCta')}
              </Button>
            </div>
          </div>
        </div>

        {/* BACK FACE */}
        <div 
          className={styles['heroBack']} 
          aria-hidden={!isFlipped}
          tabIndex={!isFlipped ? -1 : undefined}
        >
          <div className={styles['heroContentBack']}>
            <button 
              type="button" 
              className={styles['closeFlipButton']} 
              onClick={toggleFlip}
              aria-label={translate('common.close')}
            >
              <XIcon aria-hidden="true" />
            </button>
            
            <h2>{translate('landing.hero.backTitle')}</h2>
            <div className={styles['backDetails']}>
              <p>{translate('landing.hero.backDescription')}</p>
              <ul>
                <li>{translate('landing.hero.featureOne')}</li>
                <li>{translate('landing.hero.featureTwo')}</li>
                <li>{translate('landing.hero.featureThree')}</li>
              </ul>
            </div>
            
            <div className={styles['heroActions']}>
               <Button size="lg" onClick={onGetStarted}>
                {translate('landing.hero.cta')}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}