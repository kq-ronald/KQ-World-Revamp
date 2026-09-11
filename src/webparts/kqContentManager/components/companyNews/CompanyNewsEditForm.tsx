import * as React from 'react';

import {
  WebPartContext
} from '@microsoft/sp-webpart-base';

import {
  CompanyNewsService
} from '../../services/CompanyNewsService';

import {
  ICompanyNews
} from '../../models/ICompanyNews';

import styles from '../KqContentManager.module.scss';

interface ICompanyNewsEditFormProps {
  context: WebPartContext;
  newsItem: ICompanyNews;
  onCancel: () => void;
  onSaved: () => void;
}

const CompanyNewsEditForm:
  React.FC<ICompanyNewsEditFormProps> = ({
    context,
    newsItem,
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
    ] = React.useState<string>(
      newsItem.featuredImageUrl
    );

    const [
      objectPreviewUrl,
      setObjectPreviewUrl
    ] = React.useState<string>('');

    const [
      title,
      setTitle
    ] = React.useState<string>(
      newsItem.title
    );

    const [
      moreInfo,
      setMoreInfo
    ] = React.useState<string>(
      newsItem.moreInfo || ''
    );

    const [
      category,
      setCategory
    ] = React.useState<string>(
      newsItem.category ||
      'Take 3'
    );

    const [
      articleUrl,
      setArticleUrl
    ] = React.useState<string>(
      newsItem.articleUrl
    );

    const [
      startDate,
      setStartDate
    ] = React.useState<string>(
      newsItem.startDate
        ? new Date(
            newsItem.startDate
          )
            .toISOString()
            .slice(0, 16)
        : ''
    );

    const [
      displayOrder,
      setDisplayOrder
    ] = React.useState<number>(
      newsItem.displayOrder
    );

    const [
      isPublished,
      setIsPublished
    ] = React.useState<boolean>(
      newsItem.isPublished
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
        if (objectPreviewUrl) {
          URL.revokeObjectURL(
            objectPreviewUrl
          );
        }
      };
    }, [objectPreviewUrl]);

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

      if (objectPreviewUrl) {
        URL.revokeObjectURL(
          objectPreviewUrl
        );
      }

      const newPreviewUrl =
        URL.createObjectURL(
          file
        );

      setImageFile(file);

      setObjectPreviewUrl(
        newPreviewUrl
      );

      setPreviewUrl(
        newPreviewUrl
      );

      setErrorMessage('');
    };

    const validateForm =
      (): boolean => {
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

        try {
          setIsSaving(true);
          setErrorMessage('');

          await service
            .updateCompanyNews({
              id:
                newsItem.id,

              imageFile,

              currentFileName:
                newsItem.fileName,

              currentFileUrl:
                newsItem.fileUrl,

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
              : 'Unable to update Company News.'
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
              Edit News
            </h3>

            <p
              className={
                styles.sectionDescription
              }
            >
              Update this Company News item on KQ World.
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

        {previewUrl && (
          <div
            className={
              styles.companyNewsFormPreview
            }
          >
            <img
              src={previewUrl}
              alt={
                title ||
                'Featured image'
              }
            />
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
              htmlFor="edit-company-news-image"
            >
              Replace Featured Image
            </label>

            <input
              id="edit-company-news-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={isSaving}
              onChange={
                handleImageChange
              }
            />

            <span
              className={
                styles.selectedFileName
              }
            >
              Current file:{' '}
              {imageFile
                ? imageFile.name
                : newsItem.fileName}
            </span>
          </div>

          <div
            className={
              styles.formField
            }
          >
            <label
              htmlFor="edit-company-news-title"
            >
              Title
            </label>

            <input
              id="edit-company-news-title"
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

          <div
            className={
              styles.formField
            }
          >
            <label
              htmlFor="edit-company-news-category"
            >
              Category
            </label>

            <select
              id="edit-company-news-category"
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
              htmlFor="edit-company-news-more-info"
            >
              More Info
            </label>

            <textarea
              id="edit-company-news-more-info"
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
              htmlFor="edit-company-news-url"
            >
              Article URL
            </label>

            <input
              id="edit-company-news-url"
              type="url"
              value={articleUrl}
              disabled={isSaving}
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
              htmlFor="edit-company-news-start-date"
            >
              Start Date
            </label>

            <input
              id="edit-company-news-start-date"
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
              htmlFor="edit-company-news-order"
            >
              Display Order
            </label>

            <input
              id="edit-company-news-order"
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
              htmlFor="edit-company-news-status"
            >
              Publishing Status
            </label>

            <select
              id="edit-company-news-status"
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
              ? 'Saving...'
              : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  };

export default CompanyNewsEditForm;