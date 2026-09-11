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

import VideoAddForm
  from './VideoAddForm';

import VideoEditForm
  from './VideoEditForm';

import styles
  from '../KqContentManager.module.scss';

interface IVideoManagerProps {
  context:
    WebPartContext;
}

type VideoView =
  'list' |
  'add' |
  'edit';

const VideoManager:
  React.FC<
    IVideoManagerProps
  > = ({
    context
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
      videos,
      setVideos
    ] =
      React.useState<
        IVideo[]
      >([]);

    const [
      view,
      setView
    ] =
      React.useState<
        VideoView
      >(
        'list'
      );

    const [
      selectedVideo,
      setSelectedVideo
    ] =
      React.useState<
        IVideo | undefined
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

    const loadVideos =
      React.useCallback(
        async (): Promise<void> => {

          setIsLoading(
            true
          );

          setErrorMessage(
            ''
          );

          try {
            const items =
              await service.getVideos();

            setVideos(
              items
            );
          } catch (
            error
          ) {
            setErrorMessage(
              error instanceof Error
                ? error.message
                : 'Unable to load Videos.'
            );
          } finally {
            setIsLoading(
              false
            );
          }
        },
        [service]
      );

    React.useEffect(
      () => {
        void loadVideos();
      },
      [loadVideos]
    );

    const handleSaved =
      async (): Promise<void> => {

        setView(
          'list'
        );

        setSelectedVideo(
          undefined
        );

        await loadVideos();
      };

    const handleEdit =
      (
        video:
          IVideo
      ): void => {

        setSelectedVideo(
          video
        );

        setView(
          'edit'
        );
      };

    const handlePublishToggle =
      async (
        video:
          IVideo
      ): Promise<void> => {

        setErrorMessage(
          ''
        );

        try {
          await service.setPublished(
            video.id,
            !video.isPublished
          );

          await loadVideos();
        } catch (
          error
        ) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Unable to update Video.'
          );
        }
      };

    if (
      view ===
      'add'
    ) {
      return (
        <VideoAddForm
          context={
            context
          }
          onCancel={
            () =>
              setView(
                'list'
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
      selectedVideo
    ) {
      return (
        <VideoEditForm
          context={
            context
          }
          video={
            selectedVideo
          }
          onCancel={
            () => {
              setSelectedVideo(
                undefined
              );

              setView(
                'list'
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
              Videos
            </h2>

            <p
              className={
                styles.sectionDescription
              }
            >
              Manage Beyond The Terminal and Corporate Stories videos.
            </p>
          </div>

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
          >
            Add Video
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

        {isLoading && (
          <div
            className={
              styles.statusPanel
            }
          >
            Loading Videos...
          </div>
        )}

        {!isLoading &&
          videos.length === 0 && (
            <div
              className={
                styles.statusPanel
              }
            >
              No Videos have been added yet.
            </div>
          )}

        {!isLoading &&
          videos.length > 0 && (
            <div
              className={
                styles.companyNewsList
              }
            >
              {videos.map(
                (
                  video
                ) => (
                  <div
                    key={
                      video.id
                    }
                    className={
                      styles.companyNewsRow
                    }
                  >
                    <div
                      className={
                        video.isPublished
                          ? styles.statusPublished
                          : styles.statusDraft
                      }
                    >
                      {video.isPublished
                        ? 'Published'
                        : 'Draft'}
                    </div>

                    {video.thumbnailUrl
                      ? (
                        <img
                          src={
                            video.thumbnailUrl
                          }
                          alt={
                            video.title
                          }
                          className={
                            styles.companyNewsPreview
                          }
                        />
                      )
                      : (
                        <div
                          className={
                            styles.companyNewsPreviewEmpty
                          }
                        >
                          No Thumbnail
                        </div>
                      )}

                    <div
                      className={
                        styles.companyNewsDetails
                      }
                    >
                      <div
                        className={
                          styles.companyNewsTitle
                        }
                      >
                        {video.title}
                      </div>

                      <div
                        className={
                          styles.companyNewsMeta
                        }
                      >
                        {video.category}
                      </div>

                      <div
                        className={
                          styles.companyNewsDescription
                        }
                      >
                        {video.videoUrl}
                      </div>
                    </div>

                    <div
                      className={
                        styles.companyNewsOrder
                      }
                    >
                      {video.displayOrder}
                    </div>

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
                        onClick={
                          () =>
                            handleEdit(
                              video
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
                              video
                            )
                        }
                      >
                        {video.isPublished
                          ? 'Unpublish'
                          : 'Publish'}
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
      </div>
    );
  };

export default VideoManager;