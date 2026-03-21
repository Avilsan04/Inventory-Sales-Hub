import * as React from 'react';
import { PackageIcon } from 'lucide-react';
import { useTranslationAdapter } from '@shared/adapters/useTranslationAdapter';
import { Reveal } from '@shared/ui/animated';
import styles from '@shared/styles/themes/pages/Landing.module.scss';

export function AnalyticsSection(): React.ReactElement {
  const { translate } = useTranslationAdapter();

  return (
    <section className={styles['analytics']} aria-labelledby="analytics-heading">
      <div className={styles['analyticsInner']}>

        {/* Left column — text + small mockup cards */}
        <Reveal direction="left" className={styles['analyticsContent']}>
          <h2 id="analytics-heading" className={styles['sectionTitle']}>
            {translate('landing.analytics.title')}
          </h2>
          <p className={styles['sectionSubtitle']}>
            {translate('landing.analytics.description')}
          </p>

          <div className={styles['analyticsMockupCards']}>
            {/* Revenue trend mini card */}
            <div className={styles['mockupMiniCard']}>
              <p className={styles['mockupMiniTitle']}>Ingresos</p>
              <div className={styles['mockupMiniChart']}>
                <svg viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true">
                  <path
                    d="M0,30 L22,26 L45,29 L68,18 L90,22 L115,12 L140,15 L165,7 L200,4"
                    fill="none"
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M0,30 L22,26 L45,29 L68,18 L90,22 L115,12 L140,15 L165,7 L200,4 L200,40 L0,40 Z"
                    fill="var(--color-primary)"
                    fillOpacity={0.07}
                  />
                </svg>
              </div>
            </div>

            {/* KPI mini card */}
            <div className={styles['mockupMiniCard']}>
              <p className={styles['mockupMiniTitle']}>Métricas</p>
              <div className={styles['mockupMiniStatsRow']}>
                <div className={styles['mockupMiniStat']}>
                  <span className={styles['mockupMiniStatValue']}>€2.4M</span>
                  <span className={styles['mockupMiniStatLabel']}>Facturación</span>
                </div>
                <div className={styles['mockupMiniStat']}>
                  <span className={styles['mockupMiniStatValue']}>98.3%</span>
                  <span className={styles['mockupMiniStatLabel']}>Satisfacción</span>
                </div>
                <div className={styles['mockupMiniStat']}>
                  <span className={styles['mockupMiniStatValue']}>4.2d</span>
                  <span className={styles['mockupMiniStatLabel']}>Entrega media</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Right column — large dashboard mockup */}
        <Reveal direction="right" className={styles['analyticsVisual']}>
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
                  <span className={styles['mockupStatCardLabel']}>Facturación</span>
                  <span className={styles['mockupStatCardValue']}>€31.2K</span>
                  <span className={styles['mockupStatCardBadge']}>↑ 14%</span>
                </div>
                <div className={styles['mockupStatCard']}>
                  <span className={styles['mockupStatCardLabel']}>Stock total</span>
                  <span className={styles['mockupStatCardValue']}>8,432</span>
                  <span className={styles['mockupStatCardBadge']}>↑ 6%</span>
                </div>
                <div className={styles['mockupStatCard']}>
                  <span className={styles['mockupStatCardLabel']}>Margen neto</span>
                  <span className={styles['mockupStatCardValue']}>34.2%</span>
                  <span className={styles['mockupStatCardBadge']}>↑ 3%</span>
                </div>
              </div>
              <div className={styles['mockupChart']}>
                <span className={styles['mockupChartLabel']}>Rendimiento — Año actual</span>
                <svg viewBox="0 0 200 50" preserveAspectRatio="none" aria-hidden="true">
                  <path
                    d="M0,35 C20,32 35,38 55,30 C75,22 90,26 110,18 C128,11 150,6 175,3 L200,2"
                    fill="none"
                    stroke="var(--color-chart-4)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0,35 C20,32 35,38 55,30 C75,22 90,26 110,18 C128,11 150,6 175,3 L200,2 L200,50 L0,50 Z"
                    fill="var(--color-chart-4)"
                    fillOpacity={0.07}
                  />
                </svg>
              </div>
              <div className={styles['mockupTableSection']}>
                <span className={styles['mockupTableTitle']}>Top productos</span>
                <div className={styles['mockupTableRow']}>
                  <span className={styles['mockupTableDot']} aria-hidden="true" />
                  <span className={styles['mockupTableName']}>Laptop Pro 15&quot;</span>
                  <span className={styles['mockupTableAmount']}>+12,450 €</span>
                </div>
                <div className={styles['mockupTableRow']}>
                  <span className={styles['mockupTableDot']} aria-hidden="true" />
                  <span className={styles['mockupTableName']}>Monitor 4K 27&quot;</span>
                  <span className={styles['mockupTableAmount']}>+8,320 €</span>
                </div>
                <div className={styles['mockupTableRow']}>
                  <span className={styles['mockupTableDot']} aria-hidden="true" />
                  <span className={styles['mockupTableName']}>Teclado Pro BT</span>
                  <span className={styles['mockupTableAmount']}>+5,190 €</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
