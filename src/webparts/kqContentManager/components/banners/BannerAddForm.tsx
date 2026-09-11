import * as React from 'react';
import { WebPartContext } from '@microsoft/sp-webpart-base';

import { KqCmsService } from '../../services/KqCmsService';
import styles from '../KqContentManager.module.scss';

interface IBannerAddFormProps {
  context: WebPartContext;
  onCancel: () => void;
  onSaved: () => void;
}

const BannerAddForm: React.FC<IBannerAddFormProps> = ({
  context,
  onCancel,
  onSaved
}) => {
  const [imageFile, setImageFile] =
    React.useState<File | undefined>();

  const [previewUrl, setPreviewUrl] =
    React.useState<string>('');

  const [title, setTitle] =
    React.useState<string>('');

  const [ctaText, setCtaText] =
    React.useState<string>('');

  const [ctaUrl, setCtaUrl] =
    React.useState<string>('');

  const [displayOrder, setDisplayOrder] =
    React.useState<number>(1);

  const [isPublished, setIsPublished] =
    React.useState<boolean>(false);

  const [startDate, setStartDate] =
    React.useState<string>('');

  const [endDate, setEndDate] =
    React.useState<string>('');

  const [isSaving, setIsSaving] =
    React.useState<boolean>(false);

  const [errorMessage, setErrorMessage] =
    React.useState<string>('');

  const service = React.useMemo(
    () => new KqCmsService(context),
    [context]
  );

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (allowedTypes.indexOf(file.type) === -1) {
      setErrorMessage(
        'Please upload a JPG, PNG or WebP image.'
      );

      event.target.value = '';
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setErrorMessage('');
    setImageFile(file);
    setPreviewUrl(
      URL.createObjectURL(file)
    );
  };

  const validateForm = (): boolean => {
    if (!imageFile) {
      setErrorMessage(
        'Banner image is required.'
      );
      return false;
    }

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

  const handleSubmit =
    async (): Promise<void> => {
      if (!validateForm()) {
        return;
      }

      if (!imageFile) {
        return;
      }

      try {
        setIsSaving(true);
        setErrorMessage('');

        await service.addBanner({
          imageFile,
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
            : 'Unable to add banner.'
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
            Add Banner
          </h3>

          <p className={styles.sectionDescription}>
            Add a new banner to the KQ World homepage.
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

      {errorMessage && (
        <div className={styles.errorPanel}>
          {errorMessage}
        </div>
      )}

      <div className={styles.formGrid}>
        <div
          className={`${styles.formField} ${styles.fullWidthField}`}
        >
          <label htmlFor="new-banner-image">
            Banner Image
          </label>

          <input
            id="new-banner-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isSaving}
            onChange={handleImageChange}
          />
        </div>

        {previewUrl && (
          <div
            className={`${styles.newBannerPreview} ${styles.fullWidthField}`}
          >
            <img
              src={previewUrl}
              alt="New banner preview"
            />
          </div>
        )}

        <div className={styles.formField}>
          <label htmlFor="new-banner-title">
            Banner Title
          </label>

          <input
            id="new-banner-title"
            type="text"
            value={title}
            disabled={isSaving}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="Enter banner title"
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="new-banner-order">
            Display Order
          </label>

          <input
            id="new-banner-order"
            type="number"
            min="1"
            max="10"
            step="1"
            value={displayOrder}
            disabled={isSaving}
            onChange={(event) =>
              setDisplayOrder(
                Number(event.target.value)
              )
            }
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="new-banner-cta">
            CTA Text
          </label>

          <input
            id="new-banner-cta"
            type="text"
            value={ctaText}
            disabled={isSaving}
            onChange={(event) =>
              setCtaText(event.target.value)
            }
            placeholder="e.g. Learn More"
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="new-banner-url">
            CTA Destination URL
          </label>

          <input
            id="new-banner-url"
            type="url"
            value={ctaUrl}
            disabled={isSaving}
            onChange={(event) =>
              setCtaUrl(event.target.value)
            }
            placeholder="https://..."
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="new-banner-start">
            Start Date
          </label>

          <input
            id="new-banner-start"
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
          <label htmlFor="new-banner-end">
            End Date
          </label>

          <input
            id="new-banner-end"
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
          <label htmlFor="new-banner-status">
            Publishing Status
          </label>

          <select
            id="new-banner-status"
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
            !imageFile ||
            !title.trim() ||
            !Number.isInteger(displayOrder) ||
            displayOrder < 1 ||
            displayOrder > 10
          }
          onClick={() =>
            void handleSubmit()
          }
        >
          {isSaving
            ? 'Adding...'
            : 'Add Banner'}
        </button>
      </div>
    </div>
  );
};

export default BannerAddForm;