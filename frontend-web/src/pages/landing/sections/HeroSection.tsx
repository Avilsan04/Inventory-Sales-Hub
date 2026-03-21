import * as React from 'react';
import { PackageIcon, ArrowRightIcon, TrendingUpIcon, ClockIcon } from 'lucide-react';
import { useTranslationAdapter } from '@shared/adapters/useTranslationAdapter';
import { FadeIn } from '@shared/ui/animated';
import { Button } from '@shared/ui/primitives';
import styles from '@shared/styles/themes/pages/Landing.module.scss';

interface HeroSectionProps {
  readonly onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps): React.ReactElement {
  const { translate } = useTranslationAdapter();

  return (
    <section className={styles['hero']} aria-labelledby="hero-heading">

      {/* Left column — text content */}
      <div className={styles['heroText']}>
        <FadeIn delay={0}>
          <div className={styles['heroBadge']}>
            <span className={styles['heroBadgeDot']} aria-hidden="true" />
            <PackageIcon aria-hidden="true" />
            <span>{translate('landing.hero.badge')}</span>
          </div>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h1 id="hero-heading" className={styles['heroTitle']}>
            {translate('landing.hero.titleLine1')}
            <span className={styles['heroTitleAccent']}>
              {translate('landing.hero.titleAccent')}
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className={styles['heroDescription']}>
            {translate('landing.hero.description')}
          </p>
        </FadeIn>

        <FadeIn delay={0.45}>
          <div className={styles['heroActions']}>
            <Button size="lg" onClick={onGetStarted}>
              {translate('landing.hero.cta')}
              <ArrowRightIcon aria-hidden="true" />
            </Button>
            <Button variant="outline" size="lg">
              {translate('landing.hero.secondaryCta')}
            </Button>
          </div>
        </FadeIn>

        <FadeIn delay={0.6}>
          <div className={styles['heroStats']}>
            <div className={styles['heroStat']}>
              <TrendingUpIcon className={styles['heroStatIconUp']} aria-hidden="true" />
              <span className={styles['heroStatValue']}>{translate('landing.hero.stat1.value')}</span>
              <span className={styles['heroStatLabel']}>{translate('landing.hero.stat1.label')}</span>
            </div>
            <span className={styles['heroStatSep']} aria-hidden="true">·</span>
            <div className={styles['heroStat']}>
              <TrendingUpIcon className={styles['heroStatIconUp']} aria-hidden="true" />
              <span className={styles['heroStatValue']}>{translate('landing.hero.stat2.value')}</span>
              <span className={styles['heroStatLabel']}>{translate('landing.hero.stat2.label')}</span>
            </div>
            <span className={styles['heroStatSep']} aria-hidden="true">·</span>
            <div className={styles['heroStat']}>
              <ClockIcon className={styles['heroStatIconClock']} aria-hidden="true" />
              <span className={styles['heroStatValue']}>{translate('landing.hero.stat3.value')}</span>
              <span className={styles['heroStatLabel']}>{translate('landing.hero.stat3.label')}</span>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Right column — dashboard mockup */}
      <FadeIn delay={0.4} className={styles['heroVisual']}>
        <div className={styles['mockupWindow']}>
          <div className={styles['mockupTitlebar']}>
            <span className={styles['mockupDotRed']} aria-hidden="true" />
            <span className={styles['mockupDotYellow']} aria-hidden="true" />
            <span className={styles['mockupDotGreen']} aria-hidden="true" />
            <span className={styles['mockupBrand']}>
              <PackageIcon aria-hidden="true" />
              Inventory Sales Hub
            </span>
          </div>
          <div className={styles['mockupBody']}>
            <div className={styles['mockupStatsRow']}>
              <div className={styles['mockupStatCard']}>
                <span className={styles['mockupStatCardLabel']}>Ingresos</span>
                <span className={styles['mockupStatCardValue']}>€24,830</span>
                <span className={styles['mockupStatCardBadge']}>↑ 18%</span>
              </div>
              <div className={styles['mockupStatCard']}>
                <span className={styles['mockupStatCardLabel']}>Pedidos</span>
                <span className={styles['mockupStatCardValue']}>1,284</span>
                <span className={styles['mockupStatCardBadge']}>↑ 9%</span>
              </div>
              <div className={styles['mockupStatCard']}>
                <span className={styles['mockupStatCardLabel']}>Clientes</span>
                <span className={styles['mockupStatCardValue']}>+347</span>
                <span className={styles['mockupStatCardBadge']}>↑ 23%</span>
              </div>
            </div>
            <div className={styles['mockupChart']}>
              <span className={styles['mockupChartLabel']}>Ingresos — Últimas 8 semanas</span>
              <svg viewBox="0 0 200 50" preserveAspectRatio="none" aria-hidden="true">
                <path
                  d="M0,42 C15,40 30,36 50,32 C65,29 75,30 90,24 C108,17 125,13 148,8 C165,5 182,3 200,2"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M0,42 C15,40 30,36 50,32 C65,29 75,30 90,24 C108,17 125,13 148,8 C165,5 182,3 200,2 L200,50 L0,50 Z"
                  fill="var(--color-primary)"
                  fillOpacity={0.06}
                />
              </svg>
            </div>
            <div className={styles['mockupTableSection']}>
              <span className={styles['mockupTableTitle']}>Ventas recientes</span>
              <div className={styles['mockupTableRow']}>
                <span className={styles['mockupTableDot']} aria-hidden="true" />
                <span className={styles['mockupTableName']}>TechSupply S.L.</span>
                <span className={styles['mockupTableAmount']}>+4,850 €</span>
              </div>
              <div className={styles['mockupTableRow']}>
                <span className={styles['mockupTableDot']} aria-hidden="true" />
                <span className={styles['mockupTableName']}>Distrib. López</span>
                <span className={styles['mockupTableAmount']}>+2,310 €</span>
              </div>
              <div className={styles['mockupTableRow']}>
                <span className={styles['mockupTableDot']} aria-hidden="true" />
                <span className={styles['mockupTableName']}>Almacenes Vera</span>
                <span className={styles['mockupTableAmount']}>+1,760 €</span>
              </div>
              <div className={styles['mockupTableRow']}>
                <span className={styles['mockupTableDot']} aria-hidden="true" />
                <span className={styles['mockupTableName']}>Global Parts</span>
                <span className={styles['mockupTableAmount']}>+890 €</span>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

    </section>
  );
}
