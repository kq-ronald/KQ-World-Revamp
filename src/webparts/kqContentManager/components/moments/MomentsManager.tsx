import * as React from 'react';

import {
  WebPartContext
} from '@microsoft/sp-webpart-base';

import {
  IKqMoment,
  IKqMomentFolder,
  IKqMomentFolderContents
} from '../../models/IKqMoment';

import MomentsService
  from '../../services/MomentsService';

import MomentsAddForm
  from './MomentsAddForm';

import MomentsEditForm
  from './MomentsEditForm';

import styles
  from '../KqContentManager.module.scss';

interface IMomentsManagerProps {
  context:
    WebPartContext;
}

type MomentsView =
  | 'browse'
  | 'add'
  | 'edit';

interface IBreadcrumbItem {
  name: string;
  url: string;
}

const MomentsManager:
  React.FC<IMomentsManagerProps> = ({
    context
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
      view,
      setView
    ] =
      React.useState<MomentsView>(
        'browse'
      );

    const [
      rootFolderUrl,
      setRootFolderUrl
    ] =
      React.useState(
        ''
      );

    const [
      currentFolderUrl,
      setCurrentFolderUrl
    ] =
      React.useState(
        ''
      );

    const [
      contents,
      setContents
    ] =
      React.useState<
        IKqMomentFolderContents | undefined
      >();

    const [
      selectedMoment,
      setSelectedMoment
    ] =
      React.useState<
        IKqMoment | undefined
      >();

    const [
      isLoading,
      setIsLoading
    ] =
      React.useState(
        true
      );

    const [
      errorMessage,
      setErrorMessage
    ] =
      React.useState(
        ''
      );

    const [
      showNewFolder,
      setShowNewFolder
    ] =
      React.useState(
        false
      );

    const [
      newFolderName,
      setNewFolderName
    ] =
      React.useState(
        ''
      );

    const [
      isCreatingFolder,
      setIsCreatingFolder
    ] =
      React.useState(
        false
      );

    const loadFolder =
      React.useCallback(
        async (
          folderUrl?: string
        ): Promise<void> => {

          setIsLoading(
            true
          );

          setErrorMessage(
            ''
          );

          try {

            const root =
              rootFolderUrl ||
              await service
                .getRootFolderUrl();

            if (
              !rootFolderUrl
            ) {
              setRootFolderUrl(
                root
              );
            }

            const targetFolder =
              folderUrl ||
              currentFolderUrl ||
              root;

            const result =
              await service
                .getFolderContents(
                  targetFolder
                );

            setContents(
              result
            );

            setCurrentFolderUrl(
              result.folderUrl
            );

          } catch (
            error
          ) {

            setErrorMessage(
              error instanceof Error
                ? error.message
                : 'Unable to load KQ Moments.'
            );

          } finally {

            setIsLoading(
              false
            );
          }
        },
        [
          service,
          rootFolderUrl,
          currentFolderUrl
        ]
      );

    React.useEffect(
      () => {

        void loadFolder();

      },
      []
    );

    const getBreadcrumbs =
      (): IBreadcrumbItem[] => {

        if (
          !rootFolderUrl ||
          !currentFolderUrl
        ) {
          return [];
        }

        const breadcrumbs:
          IBreadcrumbItem[] = [
            {
              name:
                'KQ Moments',

              url:
                rootFolderUrl
            }
          ];

        const relative =
          currentFolderUrl
            .substring(
              rootFolderUrl.length
            )
            .replace(
              /^\/+/,
              ''
            );

        if (
          !relative
        ) {
          return breadcrumbs;
        }

        const segments =
          relative
            .split(
              '/'
            )
            .filter(
              (
                value
              ) =>
                !!value
            );

        let runningUrl =
          rootFolderUrl;

        segments.forEach(
          (
            segment
          ) => {

            runningUrl =
              `${runningUrl}/${segment}`;

            breadcrumbs.push({
              name:
                decodeURIComponent(
                  segment
                ),

              url:
                runningUrl
            });
          }
        );

        return breadcrumbs;
      };

    const handleOpenFolder =
      async (
        folder:
          IKqMomentFolder
      ): Promise<void> => {

        setSelectedMoment(
          undefined
        );

        await loadFolder(
          folder.serverRelativeUrl
        );
      };

    const handleSaved =
      async (): Promise<void> => {

        setView(
          'browse'
        );

        setSelectedMoment(
          undefined
        );

        await loadFolder(
          currentFolderUrl
        );
      };

    const handleEdit =
      (
        moment:
          IKqMoment
      ): void => {

        setSelectedMoment(
          moment
        );

        setView(
          'edit'
        );
      };

    const handlePublishToggle =
      async (
        moment:
          IKqMoment
      ): Promise<void> => {

        setErrorMessage(
          ''
        );

        try {

          await service
            .setPublished(
              moment.id,
              !moment.isPublished
            );

          await loadFolder(
            currentFolderUrl
          );

        } catch (
          error
        ) {

          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to update this Moment.'
          );
        }
      };

    const handleCreateFolder =
      async (): Promise<void> => {

        if (
          !newFolderName.trim()
        ) {
          return;
        }

        setIsCreatingFolder(
          true
        );

        setErrorMessage(
          ''
        );

        try {

          await service
            .createFolder(
              currentFolderUrl,
              newFolderName
            );

          setNewFolderName(
            ''
          );

          setShowNewFolder(
            false
          );

          await loadFolder(
            currentFolderUrl
          );

        } catch (
          error
        ) {

          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to create folder.'
          );

        } finally {

          setIsCreatingFolder(
            false
          );
        }
      };

    const formatDate =
      (
        value?:
          string
      ): string => {

        if (
          !value
        ) {
          return (
            'No publish date'
          );
        }

        const date =
          new Date(
            value
          );

        if (
          isNaN(
            date.getTime()
          )
        ) {
          return (
            'No publish date'
          );
        }

        return (
          date.toLocaleDateString(
            undefined,
            {
              day:
                '2-digit',

              month:
                'short',

              year:
                'numeric'
            }
          )
        );
      };

    if (
      view ===
      'add'
    ) {

      return (
        <MomentsAddForm
          context={
            context
          }
          folderUrl={
            currentFolderUrl
          }
          onCancel={
            () =>
              setView(
                'browse'
              )
          }
          onSaved={
            () =>
              void handleSaved()
          }
        />
      );
    }

    if (
      view ===
        'edit' &&
      selectedMoment
    ) {

      return (
        <MomentsEditForm
          context={
            context
          }
          moment={
            selectedMoment
          }
          onCancel={
            () => {
              setSelectedMoment(
                undefined
              );

              setView(
                'browse'
              );
            }
          }
          onSaved={
            () =>
              void handleSaved()
          }
        />
      );
    }

    const breadcrumbs =
      getBreadcrumbs();

    const folders =
      contents?.folders ||
      [];

    const moments =
      contents?.moments ||
      [];

    return (
      <div>
        <div
          className={
            styles.pageHeading
          }
        >
          <div>
            <div
              className={
                styles.sectionEyebrow
              }
            >
              HOMEPAGE CONTENT
            </div>

            <h2
              className={
                styles.sectionTitle
              }
            >
              KQ Moments
            </h2>

            <p
              className={
                styles.sectionDescription
              }
            >
              Browse folders, upload images and control which moments appear on the homepage.
            </p>
          </div>

          <div
            className={
              styles.momentsHeaderActions
            }
          >
            <button
              type="button"
              className={
                styles.secondaryButton
              }
              onClick={
                () =>
                  setShowNewFolder(
                    true
                  )
              }
              disabled={
                !currentFolderUrl
              }
            >
              New Folder
            </button>

            <button
              type="button"
              className={
                styles.primaryButton
              }
              onClick={
                () =>
                  setView(
                    'add'
                  )
              }
              disabled={
                !currentFolderUrl
              }
            >
              Add Moment
            </button>
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
            styles.momentsBreadcrumbs
          }
        >
          {breadcrumbs.map(
            (
              breadcrumb,
              index
            ) => (
              <React.Fragment
                key={
                  breadcrumb.url
                }
              >
                {index > 0 && (
                  <span
                    className={
                      styles.breadcrumbSeparator
                    }
                  >
                    ›
                  </span>
                )}

                <button
                  type="button"
                  className={
                    index ===
                    breadcrumbs.length - 1
                      ? styles.breadcrumbCurrent
                      : styles.breadcrumbButton
                  }
                  onClick={
                    () =>
                      void loadFolder(
                        breadcrumb.url
                      )
                  }
                >
                  {breadcrumb.name}
                </button>
              </React.Fragment>
            )
          )}
        </div>

        {showNewFolder && (
          <div
            className={
              styles.newFolderPanel
            }
          >
            <div>
              <div
                className={
                  styles.newFolderTitle
                }
              >
                Create Folder
              </div>

              <div
                className={
                  styles.newFolderPath
                }
              >
                Inside {currentFolderUrl}
              </div>
            </div>

            <input
              type="text"
              value={
                newFolderName
              }
              onChange={
                (
                  event
                ) =>
                  setNewFolderName(
                    event.target.value
                  )
              }
              placeholder="Folder name"
            />

            <div
              className={
                styles.newFolderActions
              }
            >
              <button
                type="button"
                className={
                  styles.secondaryButton
                }
                onClick={
                  () => {
                    setShowNewFolder(
                      false
                    );

                    setNewFolderName(
                      ''
                    );
                  }
                }
                disabled={
                  isCreatingFolder
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
                    void handleCreateFolder()
                }
                disabled={
                  isCreatingFolder ||
                  !newFolderName.trim()
                }
              >
                {isCreatingFolder
                  ? 'Creating...'
                  : 'Create'}
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <div
            className={
              styles.statusPanel
            }
          >
            Loading KQ Moments...
          </div>
        )}

        {!isLoading &&
          folders.length > 0 && (
            <>
              <div
                className={
                  styles.momentsSectionLabel
                }
              >
                FOLDERS
              </div>

              <div
                className={
                  styles.momentsFolderGrid
                }
              >
                {folders.map(
                  (
                    folder
                  ) => (
                    <button
                      key={
                        folder.serverRelativeUrl
                      }
                      type="button"
                      className={
                        styles.momentFolderCard
                      }
                      onClick={
                        () =>
                          void handleOpenFolder(
                            folder
                          )
                      }
                    >
                      <div
                        className={
                          styles.folderIcon
                        }
                      >
                        📁
                      </div>

                      <div
                        className={
                          styles.folderName
                        }
                      >
                        {folder.name}
                      </div>

                      <div
                        className={
                          styles.folderArrow
                        }
                      >
                        →
                      </div>
                    </button>
                  )
                )}
              </div>
            </>
          )}

        {!isLoading &&
          moments.length > 0 && (
            <>
              <div
                className={
                  styles.momentsSectionLabel
                }
              >
                IMAGES
              </div>

              <div
                className={
                  styles.momentsGrid
                }
              >
                {moments.map(
                  (
                    moment
                  ) => (
                    <article
                      key={
                        moment.id
                      }
                      className={
                        styles.momentCard
                      }
                    >
                      <div
                        className={
                          styles.momentImageWrap
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
                            styles.momentImage
                          }
                        />

                        <div
                          className={
                            moment.isPublished
                              ? styles.momentPublishedBadge
                              : styles.momentDraftBadge
                          }
                        >
                          {moment.isPublished
                            ? 'Published'
                            : 'Draft'}
                        </div>
                      </div>

                      <div
                        className={
                          styles.momentCardBody
                        }
                      >
                        <div
                          className={
                            styles.momentTitle
                          }
                        >
                          {moment.title}
                        </div>

                        <div
                          className={
                            styles.momentDate
                          }
                        >
                          {formatDate(
                            moment.publishDate
                          )}
                        </div>

                        {moment.description && (
                          <div
                            className={
                              styles.momentDescription
                            }
                          >
                            {moment.description}
                          </div>
                        )}

                        <div
                          className={
                            styles.momentActions
                          }
                        >
                          <button
                            type="button"
                            className={
                              styles.editButton
                            }
                            onClick={
                              () =>
                                handleEdit(
                                  moment
                                )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className={
                              styles.secondaryButton
                            }
                            onClick={
                              () =>
                                void handlePublishToggle(
                                  moment
                                )
                            }
                          >
                            {moment.isPublished
                              ? 'Unpublish'
                              : 'Publish'}
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>
            </>
          )}

        {!isLoading &&
          folders.length === 0 &&
          moments.length === 0 && (
            <div
              className={
                styles.statusPanel
              }
            >
              This folder is empty.
            </div>
          )}
      </div>
    );
  };

export default MomentsManager;