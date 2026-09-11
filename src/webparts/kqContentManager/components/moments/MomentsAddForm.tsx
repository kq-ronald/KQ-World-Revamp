import * as React from 'react';

import {
  WebPartContext
} from '@microsoft/sp-webpart-base';

import MomentsService
  from '../../services/MomentsService';

import styles
  from '../KqContentManager.module.scss';

interface IMomentsAddFormProps {
  context: WebPartContext;

  folderUrl: string;

  onCancel: () => void;

  onSaved: () => void;
}

const MomentsAddForm:
  React.FC<IMomentsAddFormProps> = ({
    context,
    folderUrl,
    onCancel,
    onSaved
  }) => {

    const service =
      React.useMemo(
        () =>
          new MomentsService(
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
      description,
      setDescription
    ] =
      React.useState(
        ''
      );

    const [
      isPublished,
      setIsPublished
    ] =
      React.useState(
        false
      );

    const [
      publishDate,
      setPublishDate
    ] =
      React.useState(
        ''
      );

    const [
      file,
      setFile
    ] =
      React.useState<
        File | undefined
      >();

    const [
      previewUrl,
      setPreviewUrl
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
            previewUrl
          ) {
            URL.revokeObjectURL(
              previewUrl
            );
          }
        };
      },
      [previewUrl]
    );

    const handleFileChange =
      (
        event:
          React.ChangeEvent<HTMLInputElement>
      ): void => {

        const selectedFile =
          event.target.files &&
          event.target.files.length > 0
            ? event.target.files[0]
            : undefined;

        if (
          !selectedFile
        ) {
          return;
        }

        if (
          previewUrl
        ) {
          URL.revokeObjectURL(
            previewUrl
          );
        }

        setFile(
          selectedFile
        );

        setPreviewUrl(
          URL.createObjectURL(
            selectedFile
          )
        );

        if (
          !title.trim()
        ) {

          const fileNameWithoutExtension =
            selectedFile.name.replace(
              /\.[^/.]+$/,
              ''
            );

          setTitle(
            fileNameWithoutExtension
          );
        }

        setErrorMessage(
          ''
        );
      };

    const handlePublishChange =
      (
        event:
          React.ChangeEvent<HTMLSelectElement>
      ): void => {

        const published =
          event.target.value ===
          'yes';

        setIsPublished(
          published
        );

        if (
          published &&
          !publishDate
        ) {

          const now =
            new Date();

          const localDate =
            new Date(
              now.getTime() -
              now.getTimezoneOffset() *
              60000
            )
              .toISOString()
              .slice(
                0,
                16
              );

          setPublishDate(
            localDate
          );
        }
      };

    const handleSubmit =
      async (): Promise<void> => {

        setErrorMessage(
          ''
        );

        if (
          !file
        ) {

          setErrorMessage(
            'Select an image for this Moment.'
          );

          return;
        }

        if (
          isPublished &&
          !publishDate
        ) {

          setErrorMessage(
            'Published Moments need a publish date.'
          );

          return;
        }

        setIsSaving(
          true
        );

        try {

          await service.addMoment({
            file,

            folderUrl,

            title:
              title.trim(),

            description:
              description.trim(),

            isPublished,

            publishDate:
              publishDate ||
              undefined
          });

          onSaved();

        } catch (
          error
        ) {

          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to add this KQ Moment.'
          );

        } finally {

          setIsSaving(
            false
          );
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
            <div
              className={
                styles.sectionEyebrow
              }
            >
              KQ MOMENTS
            </div>

            <h2
              className={
                styles.editFormTitle
              }
            >
              Add Moment
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
            styles.momentUploadLocation
          }
        >
          Uploading to:
          <strong>
            {folderUrl}
          </strong>
        </div>

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
              Image
            </label>

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={
                handleFileChange
              }
            />
          </div>

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
              placeholder="Moment title"
            />
          </div>

          <div
            className={
              styles.fullWidthField
            }
          >
            <label>
              Description
            </label>

            <textarea
              value={
                description
              }
              onChange={
                (
                  event
                ) =>
                  setDescription(
                    event.target.value
                  )
              }
              rows={
                4
              }
              placeholder="Short description of this moment"
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
                handlePublishChange
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

          <div
            className={
              styles.formField
            }
          >
            <label>
              Publish Date
            </label>

            <input
              type="datetime-local"
              value={
                publishDate
              }
              onChange={
                (
                  event
                ) =>
                  setPublishDate(
                    event.target.value
                  )
              }
            />
          </div>

          {previewUrl && (
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
                  previewUrl
                }
                alt=""
                className={
                  styles.momentFormPreview
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
              () =>
                void handleSubmit()
            }
            disabled={
              isSaving ||
              !file ||
              !title.trim()
            }
          >
            {isSaving
              ? 'Uploading...'
              : 'Add Moment'}
          </button>
        </div>
      </div>
    );
  };

export default MomentsAddForm;