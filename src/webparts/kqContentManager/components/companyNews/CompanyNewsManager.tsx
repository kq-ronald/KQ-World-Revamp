import * as React from 'react';
import {
  IKqContentManagerProps
} from '../IKqContentManagerProps';

import {
  CompanyNewsService
} from '../../services/CompanyNewsService';

import {
  ICompanyNews
} from '../../models/ICompanyNews';

import CompanyNewsAddForm from './CompanyNewsAddForm';
import CompanyNewsEditForm from './CompanyNewsEditForm';

import styles from '../KqContentManager.module.scss';

const CompanyNewsManager:
  React.FC<IKqContentManagerProps> = ({
    context
  }) => {
    const [
      newsItems,
      setNewsItems
    ] = React.useState<
      ICompanyNews[]
    >([]);

    const [
      isAdding,
      setIsAdding
    ] = React.useState<boolean>(
      false
    );

    const [
      selectedItem,
      setSelectedItem
    ] = React.useState<
      ICompanyNews | undefined
    >(undefined);

    const [
      isLoading,
      setIsLoading
    ] = React.useState<boolean>(
      true
    );

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
    ] = React.useState<
      number | undefined
    >(undefined);

    const service =
      React.useMemo(
        () =>
          new CompanyNewsService(
            context
          ),
        [context]
      );

    const loadNews =
      React.useCallback(
        async (): Promise<void> => {
          try {
            setIsLoading(true);
            setErrorMessage('');

            const items =
              await service
                .getCompanyNews();

            setNewsItems(items);
          } catch (error) {
            setErrorMessage(
              error instanceof Error
                ? error.message
                : 'Unable to load Company News.'
            );
          } finally {
            setIsLoading(false);
          }
        },
        [service]
      );

    React.useEffect(() => {
      void loadNews();
    }, [loadNews]);

    const handleAdded =
      (): void => {
        setIsAdding(false);

        setSuccessMessage(
          'Company News item added successfully.'
        );

        void loadNews();
      };

    const handleUpdated =
      (): void => {
        setSelectedItem(undefined);

        setSuccessMessage(
          'Company News item updated successfully.'
        );

        void loadNews();
      };

    const handlePublishToggle =
      async (
        item: ICompanyNews
      ): Promise<void> => {
        try {
          setUpdatingItemId(
            item.id
          );

          setErrorMessage('');
          setSuccessMessage('');

          const newState =
            !item.isPublished;

          await service
            .setCompanyNewsPublished(
              item.id,
              newState
            );

          setNewsItems(
            (currentItems) =>
              currentItems.map(
                (currentItem) =>
                  currentItem.id ===
                  item.id
                    ? {
                        ...currentItem,
                        isPublished:
                          newState
                      }
                    : currentItem
              )
          );

          setSuccessMessage(
            newState
              ? `"${item.title}" published successfully.`
              : `"${item.title}" unpublished successfully.`
          );
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to update Company News status.'
          );
        } finally {
          setUpdatingItemId(
            undefined
          );
        }
      };

    if (isAdding) {
      return (
        <CompanyNewsAddForm
          context={context}
          onCancel={() =>
            setIsAdding(false)
          }
          onSaved={handleAdded}
        />
      );
    }

    if (selectedItem) {
      return (
        <CompanyNewsEditForm
          context={context}
          newsItem={selectedItem}
          onCancel={() =>
            setSelectedItem(
              undefined
            )
          }
          onSaved={
            handleUpdated
          }
        />
      );
    }

    return (
      <div>
        <div
          className={
            styles.pageHeading
          }
        >
          <div>
            <p
              className={
                styles.sectionEyebrow
              }
            >
              HOMEPAGE CONTENT
            </p>

            <h2
              className={
                styles.sectionTitle
              }
            >
              Company News
            </h2>

            <p
              className={
                styles.sectionDescription
              }
            >
              Manage Take 3, Blogs and The Pride content displayed on KQ World.
            </p>
          </div>

          <div
            className={
              styles.bannerHeaderActions
            }
          >
            <div
              className={
                styles.bannerCount
              }
            >
              {newsItems.length}
            </div>

            <button
              type="button"
              className={
                styles.primaryButton
              }
              disabled={isLoading}
              onClick={() => {
                setSuccessMessage('');
                setErrorMessage('');
                setIsAdding(true);
              }}
            >
              Add News
            </button>
          </div>
        </div>

        {successMessage && (
          <div
            className={
              styles.successPanel
            }
          >
            ✓ {successMessage}
          </div>
        )}

        {!isLoading &&
          errorMessage && (
            <div
              className={
                styles.errorPanel
              }
            >
              {errorMessage}
            </div>
          )}

        {isLoading && (
          <div
            className={
              styles.statusPanel
            }
          >
            Loading Company News...
          </div>
        )}

        {!isLoading &&
          !errorMessage &&
          newsItems.length === 0 && (
            <div
              className={
                styles.statusPanel
              }
            >
              No Company News items found.
            </div>
          )}

        {!isLoading &&
          !errorMessage &&
          newsItems.length > 0 && (
            <div
              className={
                styles.companyNewsList
              }
            >
              {newsItems.map(
                (item) => {
                  const isUpdating =
                    updatingItemId ===
                    item.id;

                  return (
                    <div
                      key={item.id}
                      className={
                        styles.companyNewsRow
                      }
                    >
                      <div
                        className={
                          styles.companyNewsActions
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
                            setSuccessMessage(
                              ''
                            );

                            setErrorMessage(
                              ''
                            );

                            setSelectedItem(
                              item
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
                              item
                            );
                          }}
                        >
                          {isUpdating
                            ? 'Updating...'
                            : item.isPublished
                              ? 'Unpublish'
                              : 'Publish'}
                        </button>
                      </div>

                      <div
                        className={
                          styles.companyNewsPreview
                        }
                      >
                        {item.featuredImageUrl ? (
                          <img
                            src={
                              item.featuredImageUrl
                            }
                            alt={
                              item.title
                            }
                          />
                        ) : (
                          <div
                            className={
                              styles.companyNewsPreviewEmpty
                            }
                          >
                            No image
                          </div>
                        )}
                      </div>

                      <div
                        className={
                          styles.companyNewsDetails
                        }
                      >
                        <p
                          className={
                            styles.companyNewsTitle
                          }
                        >
                          {item.title}
                        </p>

                        <p
                          className={
                            styles.companyNewsMeta
                          }
                        >
                          {item.category}
                          {item.startDate
                            ? ` · ${new Date(
                                item.startDate
                              ).toLocaleDateString()}`
                            : ''}
                        </p>

                       
                      </div>

                      <div
                        className={
                          styles.companyNewsOrder
                        }
                      >
                        {item.displayOrder ||
                          '-'}
                      </div>

                      <div>
                        <span
                          className={
                            item.isPublished
                              ? styles.statusPublished
                              : styles.statusDraft
                          }
                        >
                          {item.isPublished
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

export default CompanyNewsManager;