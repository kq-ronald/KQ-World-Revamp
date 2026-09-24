import * as React from 'react';
import styles from './IntranetBanner.module.scss';
import {
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http';

import { IIntranetBannerProps } from './IIntranetBannerProps';

interface ISharePointBanner {
  Id: number;
  Title?: string;
  IsPublished?: boolean;
  DisplayOrder?: number;
  StartDate?: string;
  EndDate?: string;
  CTAText?: string;
  CTAUrl?:
  | string
  | {
    Url?: string;
    Description?: string;
  };
  File?: {
    Name: string;
    ServerRelativeUrl: string;
  };
}

interface IHomepageBanner {
  id: number;
  image: string;
  headline: string;
  description: string;
  url: string;
  ctaText: string;
}

const IntranetBanner: React.FC<IIntranetBannerProps> = ({
  context
}) => {
  const [isDarkMode, setIsDarkMode] =
    React.useState<boolean>(() => {
      return (
        document.documentElement.getAttribute(
          'data-kq-theme'
        ) === 'dark'
      );
    });

  const [banners, setBanners] =
    React.useState<IHomepageBanner[]>([]);

  const [activeIndex, setActiveIndex] =
    React.useState<number>(0);

  const [isLoading, setIsLoading] =
    React.useState<boolean>(true);

  const [hasError, setHasError] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    const handleThemeChange = (
      event: Event
    ): void => {
      const customEvent =
        event as CustomEvent<{
          theme: 'light' | 'dark';
        }>;

      setIsDarkMode(
        customEvent.detail.theme === 'dark'
      );
    };

    window.addEventListener(
      'kqworld-theme-change',
      handleThemeChange
    );

    return () => {
      window.removeEventListener(
        'kqworld-theme-change',
        handleThemeChange
      );
    };
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    const loadBanners =
      async (): Promise<void> => {
        try {
          setIsLoading(true);
          setHasError(false);

          const webUrl =
            context.pageContext.web.absoluteUrl;

          const libraryName =
            'KQ Intranet Banners Dev';

          const endpoint =
            `${webUrl}/_api/web/lists/getbytitle('${libraryName}')/items` +
            `?$select=Id,Title,IsPublished,DisplayOrder,StartDate,EndDate,CTAText,CTAUrl,File/Name,File/ServerRelativeUrl` +
            `&$expand=File` +
            `&$filter=IsPublished eq 1` +
            `&$orderby=DisplayOrder asc` +
            `&$top=10`;

          const response: SPHttpClientResponse =
            await context.spHttpClient.get(
              endpoint,
              SPHttpClient.configurations.v1
            );

          if (!response.ok) {
            const errorText =
              await response.text();

            throw new Error(
              `Unable to load banners. ` +
              `SharePoint returned ${response.status}. ` +
              errorText
            );
          }

          const data: {
            value: ISharePointBanner[];
          } = await response.json();

          const now = new Date();

          const imageExtensions = [
            '.jpg',
            '.jpeg',
            '.png',
            '.webp',
            '.gif',
            '.svg'
          ];

          const items: IHomepageBanner[] =
            data.value
              .filter((item) => {
                if (!item.File) {
                  return false;
                }

                const fileName =
                  item.File.Name.toLowerCase();

                const isImage =
                  imageExtensions.some(
                    (extension) =>
                      fileName.endsWith(
                        extension
                      )
                  );

                if (!isImage) {
                  return false;
                }

                const startDate =
                  item.StartDate
                    ? new Date(
                      item.StartDate
                    )
                    : undefined;

                const endDate =
                  item.EndDate
                    ? new Date(
                      item.EndDate
                    )
                    : undefined;

                const hasStarted =
                  !startDate ||
                  startDate <= now;

                const hasNotEnded =
                  !endDate ||
                  endDate >= now;

                return (
                  hasStarted &&
                  hasNotEnded
                );
              })
              .map((item) => {
                const fileUrl =
                  `${window.location.origin}` +
                  `${item.File?.ServerRelativeUrl}`;

                let ctaUrl = '';

                if (
                  typeof item.CTAUrl ===
                  'string'
                ) {
                  ctaUrl =
                    item.CTAUrl;
                } else if (
                  item.CTAUrl?.Url
                ) {
                  ctaUrl =
                    item.CTAUrl.Url;
                }

                return {
                  id: item.Id,

                  image: fileUrl,

                  headline:
                    item.Title ||
                    item.File?.Name ||
                    'KQ Intranet Banner',

                  description: '',

                  url: ctaUrl,

                  ctaText:
                    item.CTAText || ''
                };
              });

          if (isMounted) {
            setBanners(items);
            setActiveIndex(0);
          }
        } catch (error) {
          console.error(
            'Error loading KQ Intranet banners:',
            error
          );

          if (isMounted) {
            setHasError(true);
            setBanners([]);
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

    loadBanners().catch((error: unknown) => {
      console.error('Unexpected banner loading error:', error);
    });

    return () => {
      isMounted = false;
    };
  }, [context]);

  const activeBanner =
    banners[activeIndex];

  const goPrevious = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault();
    event.stopPropagation();

    setActiveIndex((current) =>
      current === 0
        ? banners.length - 1
        : current - 1
    );
  };

  const goNext = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault();
    event.stopPropagation();

    setActiveIndex((current) =>
      current ===
        banners.length - 1
        ? 0
        : current + 1
    );
  };

  const goToSlide = (
    index: number,
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.preventDefault();
    event.stopPropagation();

    setActiveIndex(index);
  };

  const rootClassName = [
    styles.intranetBanner,
    isDarkMode ? styles.darkMode : styles.lightMode
  ].join(' ');

  if (isLoading || hasError) {
    return (
      <section data-kq-banner="true" className={rootClassName} aria-busy={isLoading}>
        <div className={styles.bannerState} role={hasError ? 'alert' : 'status'}>
          {hasError ? 'Unable to load intranet banners.' : 'Loading banners...'}
        </div>
      </section>
    );
  }

  if (!activeBanner) {
    return null;
  }

  return (
    <section
      data-kq-banner="true"
      className={rootClassName}
      aria-label="KQ World announcements"
      aria-roledescription="carousel"
    >
      <div className={styles.bannerFrame}>
        <img
          src={activeBanner.image}
          alt={activeBanner.headline}
          className={styles.bannerImage}
        />
        {(activeBanner.url || banners.length > 1) && (
          <div className={styles.bannerToolbar}>
            {activeBanner.url && (
              <button
                type="button"
                className={styles.bannerCta}
                onClick={() => {
                  window.open(activeBanner.url, '_blank', 'noopener,noreferrer');
                }}
                aria-label={`Read more about ${activeBanner.headline} (opens in a new tab)`}
              >
                <span className={styles.bannerCtaText}>
                  {activeBanner.ctaText || 'Get The Whole Story'}
                </span>
                <span className={styles.bannerCtaIcon} aria-hidden="true">↗</span>
              </button>
            )}
            {banners.length > 1 && (
              <div className={styles.bannerControls}>
                <div className={styles.bannerIndicators}>
                  {banners.map((banner, index) => (
                    <button
                      key={banner.id}
                      type="button"
                      className={[
                        styles.bannerIndicator,
                        index === activeIndex ? styles.activeIndicator : ''
                      ].join(' ')}
                      onClick={(event) => goToSlide(index, event)}
                      aria-label={`View banner ${index + 1}`}
                      aria-current={index === activeIndex ? 'true' : undefined}
                    />
                  ))}
                </div>
                <span className={styles.slideCount} aria-live="polite">
                  {activeIndex + 1} / {banners.length}
                </span>
                <button type="button" className={styles.bannerArrow}
                  onClick={goPrevious} aria-label="Previous banner">
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M15 5 L8 12 L15 19" />
                  </svg>
                </button>
                <button type="button" className={styles.bannerArrow}
                  onClick={goNext} aria-label="Next banner">
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M9 5 L16 12 L9 19" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default IntranetBanner;
