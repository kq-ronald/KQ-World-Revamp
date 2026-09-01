import * as React from 'react';

import {
  intranetBannerItems,
  IIntranetBannerItem
} from '../data/intranetBannerData';

const IntranetBanner: React.FC = () => {
  const banners: IIntranetBannerItem[] =
    intranetBannerItems.slice(0, 10);

  const [activeIndex, setActiveIndex] =
    React.useState<number>(0);

  const activeBanner = banners[activeIndex];

  if (!activeBanner) {
    return null;
  }

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

  return (
    <section
      style={{
        width: '100%' ,
        margin: 0,
        padding: 0,
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(280px, 30vw, 360px)',
          overflow: 'hidden',
          borderRadius: '12px',
          margin: 0,
          padding: 0
        }}
      >
        {/* BANNER IMAGE */}
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

        {/* GET THE WHOLE STORY */}
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

        {/* CAROUSEL CONTROLS */}
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
          {/* INDICATORS */}
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

          {/* PREVIOUS */}
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

          {/* NEXT */}
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
      </div>
    </section>
  );
};

export default IntranetBanner;