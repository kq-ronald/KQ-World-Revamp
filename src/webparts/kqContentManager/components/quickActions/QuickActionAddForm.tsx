import * as React from 'react';

import {
  WebPartContext
} from '@microsoft/sp-webpart-base';

import {
  QuickActionService
} from '../../services/QuickActionService';

import {
  QUICK_ACTION_ICON_OPTIONS
} from '../../../kqquickactions/data/quickActionIcons';

import type {
  QuickActionIcon
} from '../../../kqquickactions/data/quickActionIcons';

import styles from '../KqContentManager.module.scss';

interface IQuickActionAddFormProps {
  context: WebPartContext;
  onCancel: () => void;
  onSaved: () => void;
}

const QuickActionAddForm: React.FC<
  IQuickActionAddFormProps
> = ({
  context,
  onCancel,
  onSaved
}) => {
  const [title, setTitle] =
    React.useState<string>('');

  const [
    navigationUrl,
    setNavigationUrl
  ] = React.useState<string>('');

  const [icon, setIcon] =
    React.useState<
      QuickActionIcon | ''
    >('');

  const [
    displayOrder,
    setDisplayOrder
  ] = React.useState<number>(1);

  const [
    isPublished,
    setIsPublished
  ] = React.useState<boolean>(false);

  const [
    isSaving,
    setIsSaving
  ] = React.useState<boolean>(false);

  const [
    errorMessage,
    setErrorMessage
  ] = React.useState<string>('');

  const service = React.useMemo(
    () =>
      new QuickActionService(
        context
      ),
    [context]
  );

  const validateForm =
    (): boolean => {
      if (!title.trim()) {
        setErrorMessage(
          'Quick Action title is required.'
        );
        return false;
      }

      if (!icon) {
        setErrorMessage(
          'Please select an icon.'
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

      if (!icon) {
        return;
      }

      try {
        setIsSaving(true);
        setErrorMessage('');

        await service.addQuickAction({
          title: title.trim(),

          navigationUrl:
            navigationUrl.trim(),

          icon,

          displayOrder,

          isPublished
        });

        onSaved();
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to add Quick Action.'
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
            QUICK ACTION
          </p>

          <h3 className={styles.editFormTitle}>
            Add Quick Action
          </h3>

          <p
            className={
              styles.sectionDescription
            }
          >
            Add a new shortcut to the KQ World homepage.
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
        <div className={styles.formField}>
          <label htmlFor="quick-action-title">
            Quick Action Title
          </label>

          <input
            id="quick-action-title"
            type="text"
            value={title}
            disabled={isSaving}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
            placeholder="e.g. Apply for Leave"
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="quick-action-order">
            Display Order
          </label>

          <input
            id="quick-action-order"
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
          className={`${styles.formField} ${styles.fullWidthField}`}
        >
          <label htmlFor="quick-action-url">
            Navigation URL
          </label>

          <input
            id="quick-action-url"
            type="url"
            value={navigationUrl}
            disabled={isSaving}
            onChange={(event) =>
              setNavigationUrl(
                event.target.value
              )
            }
            placeholder="https://..."
          />
        </div>

        <div className={styles.formField}>
          <label htmlFor="quick-action-status">
            Publishing Status
          </label>

          <select
            id="quick-action-status"
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

        <div
          className={
            `${styles.iconPickerSection} ${styles.fullWidthField}`
          }
        >
          <div
            className={
              styles.iconPickerHeader
            }
          >
            <label>
              Icon
            </label>

            <span
              className={
                styles.fieldHint
              }
            >
              Select the icon displayed on the homepage.
            </span>
          </div>

          <div
            className={
              styles.iconPickerGrid
            }
          >
            {QUICK_ACTION_ICON_OPTIONS.map(
              (option) => {
                const IconComponent =
                  option.icon;

                const isSelected =
                  icon === option.key;

                return (
                  <button
                    key={option.key}
                    type="button"
                    disabled={isSaving}
                    title={option.label}
                    className={
                      isSelected
                        ? `${styles.iconPickerItem} ${styles.iconPickerItemSelected}`
                        : styles.iconPickerItem
                    }
                    onClick={() =>
                      setIcon(
                        option.key
                      )
                    }
                  >
                    <span
                      className={
                        styles.iconPickerIcon
                      }
                    >
                      <IconComponent />
                    </span>

                    <span
                      className={
                        styles.iconPickerLabel
                      }
                    >
                      {option.label}
                    </span>
                  </button>
                );
              }
            )}
          </div>
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
            !icon ||
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
            : 'Add Quick Action'}
        </button>
      </div>
    </div>
  );
};

export default QuickActionAddForm;