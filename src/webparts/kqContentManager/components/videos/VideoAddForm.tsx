import * as React from 'react';

import {
  WebPartContext
} from '@microsoft/sp-webpart-base';

import {
  VideoService
} from '../../services/VideoService';

import styles from '../KqContentManager.module.scss';

interface IVideoAddFormProps {
  context:
    WebPartContext;

  onCancel:
    () => void;

  onSaved:
    () => void;
}

const VideoAddForm:
  React.FC<
    IVideoAddFormProps
  > = ({
    context,
    onCancel,
    onSaved
  }) => {

    const service =
      React.useMemo(
        () =>
          new VideoService(
            context
          ),
        [context]
      );

    const [
      title,
      setTitle
    ] =
      React.useState(
        ''
      );

    const [
      videoUrl,
      setVideoUrl
    ] =
      React.useState(
        ''
      );

    const [
      category,
      setCategory
    ] =
      React.useState(
        ''
      );

    const [
      displayOrder,
      setDisplayOrder
    ] =
      React.useState(
        '1'
      );

    const [
      isPublished,
      setIsPublished
    ] =
      React.useState(
        false
      );

    const [
      thumbnailFile,
      setThumbnailFile
    ] =
      React.useState<
        File | undefined
      >();

    const [
      thumbnailPreview,
      setThumbnailPreview
    ] =
      React.useState(
        ''
      );

    const [
      isSaving,
      setIsSaving
    ] =
      React.useState(
        false
      );

    const [
      errorMessage,
      setErrorMessage
    ] =
      React.useState(
        ''
      );

    React.useEffect(
      () => {
        return () => {
          if (
            thumbnailPreview
          ) {
            URL.revokeObjectURL(
              thumbnailPreview
            );
          }
        };
      },
      [thumbnailPreview]
    );

    const handleThumbnailChange =
      (
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

        if (
          file.type !==
            'image/jpeg' &&
          file.type !==
            'image/png' &&
          file.type !==
            'image/webp'
        ) {
          setErrorMessage(
            'Thumbnail must be JPG, PNG or WebP.'
          );

          return;
        }

        if (
          thumbnailPreview
        ) {
          URL.revokeObjectURL(
            thumbnailPreview
          );
        }

        setThumbnailFile(
          file
        );

        setThumbnailPreview(
          URL.createObjectURL(
            file
          )
        );

        setErrorMessage(
          ''
        );
      };

    const handleSubmit =
      async (): Promise<void> => {

        setErrorMessage(
          ''
        );

        const order =
          Number(
            displayOrder
          );

        if (
          !thumbnailFile
        ) {
          setErrorMessage(
            'Thumbnail is required.'
          );

          return;
        }

        setIsSaving(
          true
        );

        try {
          await service.addVideo({
            title:
              title.trim(),

            videoUrl:
              videoUrl.trim(),

            category,

            displayOrder:
              order,

            isPublished,

            thumbnailFile
          });

          onSaved();
        } catch (
          error
        ) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to add Video.'
          );
        } finally {
          setIsSaving(
            false
          );
        }
      };

    const categories =
      service.getCategories();

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
            <div
              className={
                styles.sectionEyebrow
              }
            >
              VIDEOS
            </div>

            <h2
              className={
                styles.editFormTitle
              }
            >
              Add Video
            </h2>
          </div>
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
              styles.formField
            }
          >
            <label>
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={
                (
                  event
                ) =>
                  setTitle(
                    event.target.value
                  )
              }
              placeholder="Video title"
            />
          </div>

          <div
            className={
              styles.formField
            }
          >
            <label>
              Category
            </label>

            <select
              value={
                category
              }
              onChange={
                (
                  event
                ) =>
                  setCategory(
                    event.target.value
                  )
              }
            >
              <option
                value=""
              >
                Select category
              </option>

              {categories.map(
                (
                  option
                ) => (
                  <option
                    key={
                      option
                    }
                    value={
                      option
                    }
                  >
                    {option}
                  </option>
                )
              )}
            </select>
          </div>

          <div
            className={
              styles.formField
            }
          >
            <label>
              Video URL
            </label>

            <input
              type="url"
              value={
                videoUrl
              }
              onChange={
                (
                  event
                ) =>
                  setVideoUrl(
                    event.target.value
                  )
              }
              placeholder="https://..."
            />
          </div>

          <div
            className={
              styles.formField
            }
          >
            <label>
              Display Order
            </label>

            <input
              type="number"
              min="1"
              step="1"
              value={
                displayOrder
              }
              onChange={
                (
                  event
                ) =>
                  setDisplayOrder(
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
            <label>
              Thumbnail
            </label>

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={
                handleThumbnailChange
              }
            />
          </div>

          <div
            className={
              styles.formField
            }
          >
            <label>
              Publication
            </label>

            <select
              value={
                isPublished
                  ? 'yes'
                  : 'no'
              }
              onChange={
                (
                  event
                ) =>
                  setIsPublished(
                    event.target.value ===
                    'yes'
                  )
              }
            >
              <option
                value="no"
              >
                Unpublished
              </option>

              <option
                value="yes"
              >
                Published
              </option>
            </select>
          </div>

          {thumbnailPreview && (
            <div
              className={
                styles.fullWidthField
              }
            >
              <label>
                Preview
              </label>

              <img
                src={
                  thumbnailPreview
                }
                alt="Video thumbnail preview"
                className={
                  styles.companyNewsFormPreview
                }
              />
            </div>
          )}
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
            onClick={
              onCancel
            }
            disabled={
              isSaving
            }
          >
            Cancel
          </button>

          <button
            type="button"
            className={
              styles.primaryButton
            }
            onClick={
              handleSubmit
            }
            disabled={
              isSaving ||
              !title.trim() ||
              !videoUrl.trim() ||
              !category ||
              !displayOrder
            }
          >
            {isSaving
              ? 'Adding...'
              : 'Add Video'}
          </button>
        </div>
      </div>
    );
  };

export default VideoAddForm;