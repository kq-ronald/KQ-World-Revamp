import * as React from 'react';

import { IKqContentManagerProps } from '../IKqContentManagerProps';

import {
  QuickActionService
} from '../../services/QuickActionService';

import {
  IQuickAction
} from '../../models/IQuickAction';

import {
  QUICK_ACTION_ICONS,
  getQuickActionIcon
} from '../../../kqquickactions/data/quickActionIcons';

import QuickActionAddForm from './QuickActionAddForm';
import QuickActionEditForm from './QuickActionEditForm';

import styles from '../KqContentManager.module.scss';

const QuickActionManager: React.FC<
  IKqContentManagerProps
> = ({
  context
}) => {
  const [
    quickActions,
    setQuickActions
  ] = React.useState<IQuickAction[]>([]);

  const [
    isAddingQuickAction,
    setIsAddingQuickAction
  ] = React.useState<boolean>(false);

  const [
    selectedQuickAction,
    setSelectedQuickAction
  ] = React.useState<
    IQuickAction | undefined
  >(undefined);

  const [
    isLoading,
    setIsLoading
  ] = React.useState<boolean>(true);

  const [
    errorMessage,
    setErrorMessage
  ] = React.useState<string>('');

  const [
    successMessage,
    setSuccessMessage
  ] = React.useState<string>('');

  const [
    updatingItemId,
    setUpdatingItemId
  ] = React.useState<number | undefined>(
    undefined
  );

  const service = React.useMemo(
    () => new QuickActionService(context),
    [context]
  );

  const loadQuickActions =
    React.useCallback(
      async (): Promise<void> => {
        try {
          setIsLoading(true);
          setErrorMessage('');

          const items =
            await service.getQuickActions();

          setQuickActions(items);
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to load Quick Actions.'
          );
        } finally {
          setIsLoading(false);
        }
      },
      [service]
    );

  React.useEffect(() => {
    void loadQuickActions();
  }, [loadQuickActions]);

  const handleAdded = (): void => {
    setIsAddingQuickAction(false);

    setSuccessMessage(
      'Quick Action added successfully.'
    );

    void loadQuickActions();
  };

  const handleUpdated = (): void => {
    setSelectedQuickAction(undefined);

    setSuccessMessage(
      'Quick Action updated successfully.'
    );

    void loadQuickActions();
  };

  const handlePublishToggle =
    async (
      quickAction: IQuickAction
    ): Promise<void> => {
      try {
        setUpdatingItemId(
          quickAction.id
        );

        setErrorMessage('');
        setSuccessMessage('');

        const newPublishedState =
          !quickAction.isPublished;

        await service.setQuickActionPublished(
          quickAction.id,
          newPublishedState
        );

        setQuickActions(
          (currentQuickActions) =>
            currentQuickActions.map(
              (item) =>
                item.id ===
                quickAction.id
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
            ? `"${quickAction.title}" published successfully.`
            : `"${quickAction.title}" unpublished successfully.`
        );
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Unable to update Quick Action status.'
        );
      } finally {
        setUpdatingItemId(undefined);
      }
    };

  if (isAddingQuickAction) {
    return (
      <QuickActionAddForm
        context={context}
        onCancel={() =>
          setIsAddingQuickAction(false)
        }
        onSaved={handleAdded}
      />
    );
  }

  if (selectedQuickAction) {
    return (
      <QuickActionEditForm
        context={context}
        quickAction={
          selectedQuickAction
        }
        onCancel={() =>
          setSelectedQuickAction(
            undefined
          )
        }
        onSaved={handleUpdated}
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
            Quick Actions
          </h2>

          <p
            className={
              styles.sectionDescription
            }
          >
            Manage the shortcuts displayed on the KQ World homepage.
          </p>
        </div>

        <div
          className={
            styles.bannerHeaderActions
          }
        >
          <div className={styles.bannerCount}>
            {quickActions.length}
          </div>

          <button
            type="button"
            className={styles.primaryButton}
            disabled={isLoading}
            onClick={() => {
              setSuccessMessage('');
              setErrorMessage('');
              setIsAddingQuickAction(true);
            }}
          >
            Add Quick Action
          </button>
        </div>
      </div>

      {successMessage && (
        <div className={styles.successPanel}>
          ✓ {successMessage}
        </div>
      )}

      {!isLoading &&
        errorMessage && (
          <div className={styles.errorPanel}>
            {errorMessage}
          </div>
        )}

      {isLoading && (
        <div className={styles.statusPanel}>
          Loading Quick Actions...
        </div>
      )}

      {!isLoading &&
        !errorMessage &&
        quickActions.length === 0 && (
          <div className={styles.statusPanel}>
            No Quick Actions found.
          </div>
        )}

      {!isLoading &&
        !errorMessage &&
        quickActions.length > 0 && (
          <div className={styles.quickActionList}>
            {quickActions.map(
              (quickAction) => {
                const isUpdating =
                  updatingItemId ===
                  quickAction.id;

                const iconKey =
                  getQuickActionIcon(
                    quickAction.icon
                  );

                const IconComponent =
                  QUICK_ACTION_ICONS[
                    iconKey
                  ];

                return (
                  <div
                    key={quickAction.id}
                    className={
                      styles.quickActionRow
                    }
                  >
                    <div
                      className={
                        styles.quickActionRowActions
                      }
                    >
                      <button
                        type="button"
                        className={
                          styles.editButton
                        }
                        disabled={
                          isUpdating
                        }
                        onClick={() => {
                          setSuccessMessage('');
                          setErrorMessage('');

                          setSelectedQuickAction(
                            quickAction
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
                        disabled={
                          isUpdating
                        }
                        onClick={() => {
                          void handlePublishToggle(
                            quickAction
                          );
                        }}
                      >
                        {isUpdating
                          ? 'Updating...'
                          : quickAction.isPublished
                            ? 'Unpublish'
                            : 'Publish'}
                      </button>
                    </div>

                    <div
                      className={
                        styles.quickActionIconPreview
                      }
                    >
                      <IconComponent />
                    </div>

                    <div
                      className={
                        styles.quickActionDetails
                      }
                    >
                      <p
                        className={
                          styles.quickActionTitle
                        }
                      >
                        {quickAction.title}
                      </p>

                      <p
                        className={
                          styles.quickActionUrl
                        }
                      >
                        {quickAction.navigationUrl ||
                          'No destination URL'}
                      </p>
                    </div>

                    <div
                      className={
                        styles.quickActionOrder
                      }
                    >
                      {quickAction.displayOrder ||
                        '-'}
                    </div>

                    <div>
                      <span
                        className={
                          quickAction.isPublished
                            ? styles.statusPublished
                            : styles.statusDraft
                        }
                      >
                        {quickAction.isPublished
                          ? 'Published'
                          : 'Unpublished'}
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
    </div>
  );
};

export default QuickActionManager;