import * as React from 'react';

import {
  WebPartContext
} from '@microsoft/sp-webpart-base';

import {
  IVideo
} from '../../models/IVideo';

import {
  VideoService
} from '../../services/VideoService';

import styles from '../KqContentManager.module.scss';

interface IVideoEditFormProps {
  context:
    WebPartContext;

  video:
    IVideo;

  onCancel:
    () => void;

  onSaved:
    () => void;
}

const VideoEditForm:
  React.FC<
    IVideoEditFormProps
  > = ({
    context,
    video,
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
        video.title
      );

    const [
      videoUrl,
      setVideoUrl
    ] =
      React.useState(
        video.videoUrl
      );

    const [
      category,
      setCategory
    ] =
      React.useState(
        video.category
      );

    const [
      displayOrder,
      setDisplayOrder
    ] =
      React.useState(
        String(
          video.displayOrder
        )
      );

    const [
      isPublished,
      setIsPublished
    ] =
      React.useState(
        video.isPublished
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
        video.thumbnailUrl
      );

    const [
      objectPreviewUrl,
      setObjectPreviewUrl
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
            objectPreviewUrl
          ) {
            URL.revokeObjectURL(
              objectPreviewUrl
            );
          }
        };
      },
      [objectPreviewUrl]
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
          objectPreviewUrl
        ) {
          URL.revokeObjectURL(
            objectPreviewUrl
          );
        }

        const previewUrl =
          URL.createObjectURL(
            file
          );

        setThumbnailFile(
          file
        );

        setObjectPreviewUrl(
          previewUrl
        );

        setThumbnailPreview(
          previewUrl
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

        setIsSaving(
          true
        );

        try {
          await service.updateVideo({
            id:
              video.id,

            title:
              title.trim(),

            videoUrl:
              videoUrl.trim(),

            category,

            displayOrder:
              Number(
                displayOrder
              ),

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
              : 'Unable to update Video.'
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
              Edit Video
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
              value={
                title
              }
              onChange={
                (
                  event
                ) =>
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
              Replace Thumbnail
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
                Current Thumbnail
              </label>

              <img
                src={
                  thumbnailPreview
                }
                alt={
                  title
                }
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
              ? 'Saving...'
              : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  };

export default VideoEditForm;