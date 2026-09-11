import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import { IBanner } from '../../models/IBanner';
import { KqCmsService } from '../../services/KqCmsService';

import styles from '../KqContentManager.module.scss';

interface IBannerEditFormProps {
  context: WebPartContext;
  banner: IBanner;
  onCancel: () => void;
  onSaved: () => void;
}

const BannerEditForm: React.FC<IBannerEditFormProps> = ({
  context,
  banner,
  onCancel,
  onSaved
}) => {
  const [title, setTitle] =
    React.useState<string>(
      banner.title || ''
    );

  const [ctaText, setCtaText] =
    React.useState<string>(
      banner.ctaText || ''
    );

  const [ctaUrl, setCtaUrl] =
    React.useState<string>(
      banner.ctaUrl || ''
    );

  const [displayOrder, setDisplayOrder] =
    React.useState<number>(
      banner.displayOrder || 1
    );

  const [isPublished, setIsPublished] =
    React.useState<boolean>(
      banner.isPublished
    );

  const [startDate, setStartDate] =
    React.useState<string>(
      banner.startDate
        ? banner.startDate.substring(
            0,
            10
          )
        : ''
    );

  const [endDate, setEndDate] =
    React.useState<string>(
      banner.endDate
        ? banner.endDate.substring(
            0,
            10
          )
        : ''
    );

  const [isSaving, setIsSaving] =
    React.useState<boolean>(false);

  const [errorMessage, setErrorMessage] =
    React.useState<string>('');

  const service = React.useMemo(
    () => new KqCmsService(context),
    [context]
  );

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setErrorMessage(
        'Banner title is required.'
      );
      return false;
    }

    if (
      !Number.isInteger(displayOrder) ||
      displayOrder < 1 ||
      displayOrder > 10
    ) {
      setErrorMessage(
        'Display order must be a whole number between 1 and 10.'
      );
      return false;
    }

    if (
      startDate &&
      endDate &&
      endDate < startDate
    ) {
      setErrorMessage(
        'End date cannot be earlier than start date.'
      );
      return false;
    }

    return true;
  };

  const handleSave =
    async (): Promise<void> => {
      if (!validateForm()) {
        return;
      }

      try {
        setIsSaving(true);
        setErrorMessage('');

        await service.updateBanner({
          id: banner.id,
          title: title.trim(),
          ctaText: ctaText.trim(),
          ctaUrl: ctaUrl.trim(),
          displayOrder,
          isPublished,
          startDate:
            startDate || undefined,
          endDate:
            endDate || undefined
        });

        onSaved();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to save banner changes.'
        );
      } finally {
        setIsSaving(false);
      }
    };

  return (
    <div className={styles.bannerEditForm}>
      <div className={styles.editFormHeader}>
        <div>
          <p className={styles.sectionEyebrow}>
            HERO BANNER
          </p>

          <h3 className={styles.editFormTitle}>
            Edit Banner
          </h3>

          <p className={styles.sectionDescription}>
            Update the content and publishing settings for this banner.
          </p>
        </div>

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onCancel}
          disabled={isSaving}
        >
          Back
        </button>
      </div>

      <div className={styles.editBannerPreview}>
        {banner.fileUrl ? (
          <img
            src={banner.fileUrl}
            alt={
              title ||
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

      {errorMessage && (
        <div className={styles.errorPanel}>
          {errorMessage}
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={styles.formField}>
          <label htmlFor="banner-title">
            Banner Title
          </label>

          <input
            id="banner-title"
            type="text"
            value={title}
            disabled={isSaving}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="banner-order">
            Display Order
          </label>

          <input
            id="banner-order"
            type="number"
            min="1"
            max="10"
            step="1"
            value={displayOrder}
            disabled={isSaving}
            onChange={(event) =>
              setDisplayOrder(
                Number(
                  event.target.value
                )
              )
            }
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="banner-cta-text">
            CTA Text
          </label>

          <input
            id="banner-cta-text"
            type="text"
            value={ctaText}
            disabled={isSaving}
            onChange={(event) =>
              setCtaText(
                event.target.value
              )
            }
            placeholder="e.g. Learn More"
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="banner-cta-url">
            CTA Destination URL
          </label>

          <input
            id="banner-cta-url"
            type="url"
            value={ctaUrl}
            disabled={isSaving}
            onChange={(event) =>
              setCtaUrl(
                event.target.value
              )
            }
            placeholder="https://..."
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="banner-start-date">
            Start Date
          </label>

          <input
            id="banner-start-date"
            type="date"
            value={startDate}
            disabled={isSaving}
            onChange={(event) =>
              setStartDate(
                event.target.value
              )
            }
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="banner-end-date">
            End Date
          </label>

          <input
            id="banner-end-date"
            type="date"
            value={endDate}
            disabled={isSaving}
            onChange={(event) =>
              setEndDate(
                event.target.value
              )
            }
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="banner-published">
            Publishing Status
          </label>

          <select
            id="banner-published"
            value={
              isPublished
                ? 'published'
                : 'unpublished'
            }
            disabled={isSaving}
            onChange={(event) =>
              setIsPublished(
                event.target.value ===
                  'published'
              )
            }
          >
            <option value="unpublished">
              Unpublished
            </option>

            <option value="published">
              Published
            </option>
          </select>
        </div>
      </div>

      <div className={styles.formActions}>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </button>

        <button
          type="button"
          className={styles.primaryButton}
          disabled={
            isSaving ||
            !title.trim() ||
            !Number.isInteger(
              displayOrder
            ) ||
            displayOrder < 1 ||
            displayOrder > 10
          }
          onClick={() =>
            void handleSave()
          }
        >
          {isSaving
            ? 'Saving...'
            : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default BannerEditForm;