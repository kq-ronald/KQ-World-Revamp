import * as React from 'react';
import styles from './IntranetBanner.module.scss';
import {
  SPHttpClient,
  SPHttpClientResponse
} from '@microsoft/sp-http';

import { IIntranetBannerProps } from './IIntranetBannerProps';

import {
  IIntranetBannerItem,
  ISharePointBannerItem
} from '../data/intranetBannerData';

const IntranetBanner: React.FC<IIntranetBannerProps> = ({
  context
}) => {
  const [isDarkMode, setIsDarkMode] =
    React.useState<boolean>(() => {
      return document.documentElement.getAttribute(
        'data-kq-theme'
      ) === 'dark';
    });

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
  const [banners, setBanners] =
    React.useState<IIntranetBannerItem[]>([]);

  const [activeIndex, setActiveIndex] =
    React.useState<number>(0);

  const [isLoading, setIsLoading] =
    React.useState<boolean>(true);

  const [hasError, setHasError] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    let isMounted = true;

    const loadBanners = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setHasError(false);

        const webUrl =
          context.pageContext.web.absoluteUrl;

        const libraryName =
          'KQ Intranet Banners Dev';

        const endpoint =
          `${webUrl}/_api/web/lists/getbytitle('${libraryName}')/items` +
          `?$select=Id,Title,File/Name,File/ServerRelativeUrl` +
          `&$expand=File` +
          `&$orderby=Modified desc` +
          `&$top=10`;

        const response: SPHttpClientResponse =
          await context.spHttpClient.get(
            endpoint,
            SPHttpClient.configurations.v1
          );

        if (!response.ok) {
          throw new Error(
            `Unable to load banners. Status: ${response.status}`
          );
        }

        const data: {
          value: ISharePointBannerItem[];
        } = await response.json();

        const imageExtensions = [
          '.jpg',
          '.jpeg',
          '.png',
          '.webp',
          '.gif',
          '.svg'
        ];

        const items: IIntranetBannerItem[] =
          data.value
            .filter((item) => {
              if (!item.File) {
                return false;
              }

              const fileName =
                item.File.Name.toLowerCase();

              return imageExtensions.some(
                (extension) =>
                  fileName.endsWith(extension)
              );
            })
            .map((item) => {
              const fileUrl =
                `${window.location.origin}${item.File?.ServerRelativeUrl}`;

              return {
                id: item.Id,
                image: fileUrl,
                headline:
                  item.Title ||
                  item.File?.Name ||
                  'KQ Intranet Banner',
                description: '',
                url: ''
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
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadBanners()
      .catch((error) => {
        console.error(
          'Unexpected banner loading error:',
          error
        );
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
      current === banners.length - 1
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

  if (isLoading) {
    return (
      <section
        className={styles.intranetBanner}
        style={{
          width: '100%',
          minHeight: '280px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box'
        }}
      >
        Loading banners...
      </section>
    );
  }

  if (hasError) {
    return (
      <section
        style={{
          width: '100%',
          minHeight: '160px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box'
        }}
      >
        Unable to load intranet banners.
      </section>
    );
  }

  if (!activeBanner) {
    return null;
  }

  return (
    <section
      className={`${styles.intranetBanner} ${isDarkMode ? styles.darkMode : styles.lightMode
        }`}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1276 / 446',
          overflow: 'hidden',
          borderRadius: '12px',
          margin: 0,
          padding: 0
        }}
      >
        <img
          src={activeBanner.image}
          alt={activeBanner.headline}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'block',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            border: 0,
            margin: 0,
            padding: 0
          }}
        />

        {activeBanner.url && (
          <a
            href={activeBanner.url}
            aria-label={`Read more about ${activeBanner.headline}`}
            style={{
              position: 'absolute',
              zIndex: 20,
              left: '5%',
              bottom: '9%',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '9px',
              height: '40px',
              paddingLeft: '16px',
              paddingRight: '5px',
              borderRadius: '999px',
              backgroundColor: '#000000',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 400,
              lineHeight: 1,
              textDecoration: 'none',
              boxSizing: 'border-box'
            }}
          >
            <span>
              Get The Whole Story
            </span>

            <span
              style={{
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                color: '#e30613',
                fontSize: '16px',
                fontWeight: 600
              }}
            >
              ↗
            </span>
          </a>
        )}

        {banners.length > 1 && (
          <div
            style={{
              position: 'absolute',
              zIndex: 20,
              right: '2.8%',
              bottom: '8%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {banners.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={(event) =>
                    goToSlide(index, event)
                  }
                  aria-label={`View banner ${index + 1}`}
                  style={{
                    width:
                      index === activeIndex
                        ? '30px'
                        : '24px',
                    height: '5px',
                    border: 0,
                    padding: 0,
                    margin: 0,
                    borderRadius: '999px',
                    backgroundColor:
                      index === activeIndex
                        ? '#e30613'
                        : '#808080',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={goPrevious}
              aria-label="Previous banner"
              style={{
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: 0,
                borderRadius: '50%',
                padding: 0,
                margin: 0,
                backgroundColor: '#e30613',
                color: '#ffffff',
                fontSize: '27px',
                fontWeight: 300,
                lineHeight: 1,
                cursor: 'pointer'
              }}
            >
              ‹
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next banner"
              style={{
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: 0,
                borderRadius: '50%',
                padding: 0,
                margin: 0,
                backgroundColor: '#e30613',
                color: '#ffffff',
                fontSize: '27px',
                fontWeight: 300,
                lineHeight: 1,
                cursor: 'pointer'
              }}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default IntranetBanner;