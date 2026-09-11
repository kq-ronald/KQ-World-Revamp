import * as React from 'react';

import { IKqContentManagerProps } from '../IKqContentManagerProps';
import { KqCmsService } from '../../services/KqCmsService';
import { IBanner } from '../../models/IBanner';

import BannerEditForm from './BannerEditForm';
import BannerAddForm from './BannerAddForm';

import styles from '../KqContentManager.module.scss';

const BannerManager: React.FC<IKqContentManagerProps> = ({
  context
}) => {
  const [banners, setBanners] =
    React.useState<IBanner[]>([]);

  const [isAddingBanner, setIsAddingBanner] =
    React.useState<boolean>(false);

  const [selectedBanner, setSelectedBanner] =
    React.useState<IBanner | undefined>(undefined);

  const [isLoading, setIsLoading] =
    React.useState<boolean>(true);

  const [errorMessage, setErrorMessage] =
    React.useState<string>('');

  const [successMessage, setSuccessMessage] =
    React.useState<string>('');

  const [updatingBannerId, setUpdatingBannerId] =
    React.useState<number | undefined>(undefined);

  const service = React.useMemo(
    () => new KqCmsService(context),
    [context]
  );

  const loadBanners = React.useCallback(
    async (): Promise<void> => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const items =
          await service.getBanners();

        setBanners(items);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unable to load hero banners.';

        setErrorMessage(message);
      } finally {
        setIsLoading(false);
      }
    },
    [service]
  );

  React.useEffect(() => {
    void loadBanners();
  }, [loadBanners]);

  const handleBannerAdded = (): void => {
    setIsAddingBanner(false);

    setSuccessMessage(
      'Banner added successfully.'
    );

    void loadBanners();
  };

  const handleBannerUpdated = (): void => {
    setSelectedBanner(undefined);

    setSuccessMessage(
      'Banner updated successfully.'
    );

    void loadBanners();
  };

  const handlePublishToggle =
    async (
      banner: IBanner
    ): Promise<void> => {
      try {
        setUpdatingBannerId(banner.id);
        setErrorMessage('');
        setSuccessMessage('');

        const newPublishedState =
          !banner.isPublished;

        await service.setBannerPublished(
          banner.id,
          newPublishedState
        );

        setBanners((currentBanners) =>
          currentBanners.map((item) =>
            item.id === banner.id
              ? {
                  ...item,
                  isPublished:
                    newPublishedState
                }
              : item
          )
        );

        setSuccessMessage(
          newPublishedState
            ? `"${banner.title}" published successfully.`
            : `"${banner.title}" unpublished successfully.`
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unable to update banner status.';

        setErrorMessage(message);
      } finally {
        setUpdatingBannerId(undefined);
      }
    };

  if (isAddingBanner) {
    return (
      <BannerAddForm
        context={context}
        onCancel={() =>
          setIsAddingBanner(false)
        }
        onSaved={handleBannerAdded}
      />
    );
  }

  if (selectedBanner) {
    return (
      <BannerEditForm
        context={context}
        banner={selectedBanner}
        onCancel={() =>
          setSelectedBanner(undefined)
        }
        onSaved={handleBannerUpdated}
      />
    );
  }

  return (
    <div>
      <div className={styles.pageHeading}>
        <div>
          <p className={styles.sectionEyebrow}>
            HOMEPAGE CONTENT
          </p>

          <h2 className={styles.sectionTitle}>
            Hero Banners
          </h2>

          <p className={styles.sectionDescription}>
            Manage the banners displayed on the KQ World homepage.
          </p>
        </div>

        <div
          className={
            styles.bannerHeaderActions
          }
        >
          <div className={styles.bannerCount}>
            {banners.length} / 10
          </div>

          <button
            type="button"
            className={styles.primaryButton}
            disabled={
              isLoading ||
              banners.length >= 10
            }
            onClick={() => {
              setSuccessMessage('');
              setErrorMessage('');
              setIsAddingBanner(true);
            }}
          >
            Add Banner
          </button>
        </div>
      </div>

      {successMessage && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: '#e8f5e9',
            color: '#1b5e20',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          ✓ {successMessage}
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className={styles.errorPanel}>
          {errorMessage}
        </div>
      )}

      {isLoading && (
        <div className={styles.statusPanel}>
          Loading hero banners...
        </div>
      )}

      {!isLoading &&
        !errorMessage &&
        banners.length === 0 && (
          <div className={styles.statusPanel}>
            No hero banners found.
          </div>
        )}

      {!isLoading &&
        !errorMessage &&
        banners.length > 0 && (
          <div className={styles.bannerList}>
            {banners.map((banner) => {
              const isUpdating =
                updatingBannerId ===
                banner.id;

              return (
                <div
                  key={banner.id}
                  className={styles.bannerRow}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <button
                      type="button"
                      className={
                        styles.editButton
                      }
                      disabled={isUpdating}
                      onClick={() => {
                        setSuccessMessage('');
                        setErrorMessage('');

                        setSelectedBanner(
                          banner
                        );
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className={
                        styles.editButton
                      }
                      disabled={isUpdating}
                      onClick={() => {
                        void handlePublishToggle(
                          banner
                        );
                      }}
                    >
                      {isUpdating
                        ? 'Updating...'
                        : banner.isPublished
                          ? 'Unpublish'
                          : 'Publish'}
                    </button>
                  </div>

                  <div
                    className={
                      styles.bannerPreview
                    }
                  >
                    {banner.fileUrl ? (
                      <img
                        src={banner.fileUrl}
                        alt={
                          banner.title ||
                          banner.fileName
                        }
                      />
                    ) : (
                      <div
                        className={
                          styles.bannerPreviewEmpty
                        }
                      >
                        No image
                      </div>
                    )}
                  </div>

                  <div
                    className={
                      styles.bannerDetails
                    }
                  >
                    <p
                      className={
                        styles.bannerTitle
                      }
                    >
                      {banner.title ||
                        banner.fileName}
                    </p>

                    <p
                      className={
                        styles.bannerFileName
                      }
                    >
                      {banner.fileName}
                    </p>
                  </div>

                  <div
                    className={
                      styles.bannerOrder
                    }
                  >
                    {banner.displayOrder ||
                      '-'}
                  </div>

                  <div>
                    <span
                      className={
                        banner.isPublished
                          ? styles.statusPublished
                          : styles.statusDraft
                      }
                    >
                      {banner.isPublished
                        ? 'Published'
                        : 'Unpublished'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
};

export default BannerManager;