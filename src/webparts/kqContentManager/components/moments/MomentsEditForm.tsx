import * as React from 'react';

import {
  WebPartContext
} from '@microsoft/sp-webpart-base';

import {
  IKqMoment
} from '../../models/IKqMoment';

import MomentsService
  from '../../services/MomentsService';

import styles
  from '../KqContentManager.module.scss';

interface IMomentsEditFormProps {
  context: WebPartContext;

  moment: IKqMoment;

  onCancel: () => void;

  onSaved: () => void;
}

const MomentsEditForm:
  React.FC<IMomentsEditFormProps> = ({
    context,
    moment,
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
        moment.title
      );

    const [
      description,
      setDescription
    ] =
      React.useState(
        moment.description
      );

    const [
      isPublished,
      setIsPublished
    ] =
      React.useState(
        moment.isPublished
      );

    const [
      publishDate,
      setPublishDate
    ] =
      React.useState(
        moment.publishDate
          ? new Date(
              new Date(
                moment.publishDate
              ).getTime() -
              new Date(
                moment.publishDate
              ).getTimezoneOffset() *
              60000
            )
              .toISOString()
              .slice(
                0,
                16
              )
          : ''
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

          await service.updateMoment({
            id:
              moment.id,

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
              : 'Unable to update this KQ Moment.'
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
              Edit Moment
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
            styles.momentEditPreviewWrap
          }
        >
          <img
            src={
              moment.fileUrl
            }
            alt={
              moment.title
            }
            className={
              styles.momentFormPreview
            }
          />

          <div>
            <strong>
              {moment.fileName}
            </strong>

            <div
              className={
                styles.momentFileLocation
              }
            >
              {moment.folderUrl}
            </div>
          </div>
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
            />
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
              !title.trim()
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

export default MomentsEditForm;