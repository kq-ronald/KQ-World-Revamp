import * as React from 'react';

import {
  WebPartContext
} from '@microsoft/sp-webpart-base';

import {
  CompanyNewsService
} from '../../services/CompanyNewsService';

import styles from '../KqContentManager.module.scss';

interface ICompanyNewsAddFormProps {
  context: WebPartContext;
  onCancel: () => void;
  onSaved: () => void;
}

const CompanyNewsAddForm:
  React.FC<ICompanyNewsAddFormProps> = ({
    context,
    onCancel,
    onSaved
  }) => {
    const [
      imageFile,
      setImageFile
    ] = React.useState<
      File | undefined
    >(undefined);

    const [
      previewUrl,
      setPreviewUrl
    ] = React.useState<string>('');

    const [
      title,
      setTitle
    ] = React.useState<string>('');

    const [
      moreInfo,
      setMoreInfo
    ] = React.useState<string>('');

    const [
      category,
      setCategory
    ] = React.useState<string>(
      'Take 3'
    );

    const [
      articleUrl,
      setArticleUrl
    ] = React.useState<string>('');

    const [
      startDate,
      setStartDate
    ] = React.useState<string>('');

    const [
      displayOrder,
      setDisplayOrder
    ] = React.useState<number>(1);

    const [
      isPublished,
      setIsPublished
    ] = React.useState<boolean>(
      false
    );

    const [
      isSaving,
      setIsSaving
    ] = React.useState<boolean>(
      false
    );

    const [
      errorMessage,
      setErrorMessage
    ] = React.useState<string>('');

    const service =
      React.useMemo(
        () =>
          new CompanyNewsService(
            context
          ),
        [context]
      );

    React.useEffect(() => {
      return () => {
        if (previewUrl) {
          URL.revokeObjectURL(
            previewUrl
          );
        }
      };
    }, [previewUrl]);

    const handleImageChange = (
      event:
        React.ChangeEvent<HTMLInputElement>
    ): void => {
      const file =
        event.target.files &&
        event.target.files.length > 0
          ? event.target.files[0]
          : undefined;

      if (!file) {
        return;
      }

      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp'
      ];

      if (
        allowedTypes.indexOf(
          file.type
        ) === -1
      ) {
        setErrorMessage(
          'Please upload a JPG, PNG or WebP image.'
        );

        event.target.value = '';

        return;
      }

      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        );
      }

      setImageFile(file);

      setPreviewUrl(
        URL.createObjectURL(
          file
        )
      );

      setErrorMessage('');
    };

    const validateForm =
      (): boolean => {
        if (!imageFile) {
          setErrorMessage(
            'Featured image is required.'
          );

          return false;
        }

        if (!title.trim()) {
          setErrorMessage(
            'News title is required.'
          );

          return false;
        }

        if (!articleUrl.trim()) {
          setErrorMessage(
            'Article URL is required.'
          );

          return false;
        }

        if (
          !Number.isInteger(
            displayOrder
          ) ||
          displayOrder < 1
        ) {
          setErrorMessage(
            'Display order must be a whole number greater than 0.'
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

          await service
            .addCompanyNews({
              imageFile,

              title:
                title.trim(),

              moreInfo:
                moreInfo.trim(),

              category,

              articleUrl:
                articleUrl.trim(),

              startDate:
                startDate ||
                undefined,

              displayOrder,

              isPublished
            });

          onSaved();
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to add Company News.'
          );
        } finally {
          setIsSaving(false);
        }
      };

    return (
      <div
        className={
          styles.bannerEditForm
        }
      >
        <div
          className={
            styles.editFormHeader
          }
        >
          <div>
            <p
              className={
                styles.sectionEyebrow
              }
            >
              COMPANY NEWS
            </p>

            <h3
              className={
                styles.editFormTitle
              }
            >
              Add News
            </h3>

            <p
              className={
                styles.sectionDescription
              }
            >
              Add Take 3, Blog or The Pride content to KQ World.
            </p>
          </div>

          <button
            type="button"
            className={
              styles.secondaryButton
            }
            onClick={onCancel}
            disabled={isSaving}
          >
            Back
          </button>
        </div>

        {errorMessage && (
          <div
            className={
              styles.errorPanel
            }
          >
            {errorMessage}
          </div>
        )}

        <div
          className={
            styles.formGrid
          }
        >
          <div
            className={
              `${styles.formField} ${styles.fullWidthField}`
            }
          >
            <label
              htmlFor="company-news-image"
            >
              Featured Image
            </label>

            <input
              id="company-news-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={isSaving}
              onChange={
                handleImageChange
              }
            />
          </div>

          {previewUrl && (
            <div
              className={
                `${styles.companyNewsFormPreview} ${styles.fullWidthField}`
              }
            >
              <img
                src={previewUrl}
                alt="Featured preview"
              />
            </div>
          )}

          <div
            className={
              styles.formField
            }
          >
            <label
              htmlFor="company-news-title"
            >
              Title
            </label>

            <input
              id="company-news-title"
              type="text"
              value={title}
              disabled={isSaving}
              placeholder="Enter article title"
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
            />
          </div>

          <div
            className={
              styles.formField
            }
          >
            <label
              htmlFor="company-news-category"
            >
              Category
            </label>

            <select
              id="company-news-category"
              value={category}
              disabled={isSaving}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
            >
              <option value="Take 3">
                Take 3
              </option>

              <option value="Blogs">
                Blogs
              </option>

              <option value="The Pride">
                The Pride
              </option>
            </select>
          </div>

          <div
            className={
              `${styles.formField} ${styles.fullWidthField}`
            }
          >
            <label
              htmlFor="company-news-more-info"
            >
              More Info
            </label>

            <textarea
              id="company-news-more-info"
              rows={4}
              value={moreInfo}
              disabled={isSaving}
              placeholder="Optional short summary or teaser"
              onChange={(event) =>
                setMoreInfo(
                  event.target.value
                )
              }
            />
          </div>

          <div
            className={
              `${styles.formField} ${styles.fullWidthField}`
            }
          >
            <label
              htmlFor="company-news-url"
            >
              Article URL
            </label>

            <input
              id="company-news-url"
              type="url"
              value={articleUrl}
              disabled={isSaving}
              placeholder="https://kenyaairwaysplc.sharepoint.com/..."
              onChange={(event) =>
                setArticleUrl(
                  event.target.value
                )
              }
            />
          </div>

          <div
            className={
              styles.formField
            }
          >
            <label
              htmlFor="company-news-start-date"
            >
              Start Date
            </label>

            <input
              id="company-news-start-date"
              type="datetime-local"
              value={startDate}
              disabled={isSaving}
              onChange={(event) =>
                setStartDate(
                  event.target.value
                )
              }
            />
          </div>

          <div
            className={
              styles.formField
            }
          >
            <label
              htmlFor="company-news-order"
            >
              Display Order
            </label>

            <input
              id="company-news-order"
              type="number"
              min="1"
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

          <div
            className={
              styles.formField
            }
          >
            <label
              htmlFor="company-news-status"
            >
              Publishing Status
            </label>

            <select
              id="company-news-status"
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

        <div
          className={
            styles.formActions
          }
        >
          <button
            type="button"
            className={
              styles.secondaryButton
            }
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </button>

          <button
            type="button"
            className={
              styles.primaryButton
            }
            disabled={
              isSaving ||
              !imageFile ||
              !title.trim() ||
              !articleUrl.trim() ||
              !Number.isInteger(
                displayOrder
              ) ||
              displayOrder < 1
            }
            onClick={() =>
              void handleSubmit()
            }
          >
            {isSaving
              ? 'Adding...'
              : 'Add News'}
          </button>
        </div>
      </div>
    );
  };

export default CompanyNewsAddForm;