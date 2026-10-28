
export type KqEnvironment = 'DEV' | 'UAT' | 'PROD';

const ENVIRONMENT_SITES: Record<KqEnvironment, string> = {
  DEV: 'https://kenyaairwaysplc.sharepoint.com/sites/KQWorlddev',
  UAT: 'https://kenyaairwaysplc.sharepoint.com/sites/KQWorldUAT',
  PROD: 'https://kenyaairwaysplc.sharepoint.com/sites/KQWorldhome'
};

export interface IKqDataConfig {
  environment: KqEnvironment;
  siteUrl: string;
  bannersLibrary: string;
  quickActionsList: string;
  notificationsList: string;
  adminsList: string;
  feedbackList: string;
}

export function getKqDataConfig(
  currentWebUrl: string
): IKqDataConfig {
  const normalize = (url: string): string =>
    url.replace(/\/+$/, '').toLowerCase();

  const current = normalize(currentWebUrl);

  const environment = (
    Object.keys(ENVIRONMENT_SITES) as KqEnvironment[]
  ).find(
    name => normalize(ENVIRONMENT_SITES[name]) === current
  );

  if (!environment) {
    throw new Error(
      `Unsupported KQ World site: ${currentWebUrl}`
    );
  }

  const siteUrl = ENVIRONMENT_SITES[environment];

  return {
    environment,
    siteUrl,
    bannersLibrary:
      environment === 'PROD'
        ? 'KQ Intranet Banners'
        : 'KQ Intranet Banners Dev', // Verify existing name

    quickActionsList:
      environment === 'PROD'
        ? 'KQ Quick Actions'
        : 'KQ Quick Actions Dev', // Verify existing name

    notificationsList:
      environment === 'PROD'
        ? 'KQ Notifications'
        : 'KQ Notifications Dev', // Verify existing name

    adminsList:
      environment === 'PROD'
        ? 'KQ World Admin'
        : 'KQ World Admin Dev', // Verify existing name

    feedbackList:
      environment === 'PROD'
        ? 'KQ Feedback'
        : 'KQ Feedback Dev' // Verify existing name
  };
}
