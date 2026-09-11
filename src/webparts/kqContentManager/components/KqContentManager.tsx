import * as React from 'react';
import styles from './KqContentManager.module.scss';
import { IKqContentManagerProps } from './IKqContentManagerProps';
import MomentsManager from './moments/MomentsManager';
import BannerManager from './banners/BannerManager';
import QuickActionManager from './quickActions/QuickActionManager';
import CompanyNewsManager from './companyNews/CompanyNewsManager';
import VideoManager
    from './videos/VideoManager';

type CmsSection =
    | 'dashboard'
    | 'banners'
    | 'quickActions'
    | 'news'
    | 'videos'
    | 'moments';

interface ICmsNavItem {
    key: CmsSection;
    label: string;
    shortLabel: string;
}

const navItems: ICmsNavItem[] = [
    { key: 'dashboard', label: 'Dashboard', shortLabel: 'DB' },
    { key: 'banners', label: 'Hero Banners', shortLabel: 'HB' },
    { key: 'quickActions', label: 'Quick Actions', shortLabel: 'QA' },
    { key: 'news', label: 'Company News', shortLabel: 'CN' },
    { key: 'videos', label: 'Videos', shortLabel: 'VD' },
    { key: 'moments', label: 'KQ Moments', shortLabel: 'KM' }
];

const KqContentManager: React.FC<IKqContentManagerProps> = ({ context }) => {
    const [activeSection, setActiveSection] =
        React.useState<CmsSection>('dashboard');

    const renderDashboard = (): React.ReactElement => {
        const cards = [
            {
                key: 'banners' as CmsSection,
                eyebrow: 'HERO BANNERS',
                title: 'Hero Banners',
                count: '0',
                description: 'Manage homepage banner content'
            },
            {
                key: 'quickActions' as CmsSection,
                eyebrow: 'QUICK ACTIONS',
                title: 'Quick Actions',
                count: '0',
                description: 'Manage homepage shortcuts'
            },
            {
                key: 'news' as CmsSection,
                eyebrow: 'COMPANY NEWS',
                title: 'Company News',
                count: '0',
                description: 'Manage news and updates'
            },
            {
                key: 'videos' as CmsSection,
                eyebrow: 'VIDEOS',
                title: 'Videos',
                count: '0',
                description: 'Manage homepage videos'
            },
            {
                key: 'moments' as CmsSection,
                eyebrow: 'KQ MOMENTS',
                title: 'KQ Moments',
                count: '0',
                description: 'Manage gallery content'
            }
        ];

        return (
            <>
                <div className={styles.pageHeading}>
                    <div>
                        <p className={styles.sectionEyebrow}>OVERVIEW</p>
                        <h2 className={styles.sectionTitle}>Content Overview</h2>
                        <p className={styles.sectionDescription}>
                            Manage content displayed across the KQ World homepage.
                        </p>
                    </div>
                </div>

                <div className={styles.dashboardGrid}>
                    {cards.map((card) => (
                        <button
                            key={card.key}
                            type="button"
                            className={styles.dashboardCard}
                            onClick={() => setActiveSection(card.key)}
                        >
                            <div className={styles.cardTop}>
                                <div>
                                    <p className={styles.cardEyebrow}>{card.eyebrow}</p>
                                    <h3 className={styles.cardTitle}>{card.title}</h3>
                                </div>

                                <span className={styles.cardCount}>{card.count}</span>
                            </div>

                            <p className={styles.cardDescription}>
                                {card.description}
                            </p>

                            <span className={styles.manageLink}>
                                Manage content →
                            </span>
                        </button>
                    ))}
                </div>
            </>
        );
    };

    const renderPlaceholder = (): React.ReactElement => {
        const currentItem = navItems.find(
            (item) => item.key === activeSection
        );

        return (
            <div className={styles.placeholder}>
                <p className={styles.sectionEyebrow}>CONTENT MANAGEMENT</p>

                <h2 className={styles.sectionTitle}>
                    {currentItem ? currentItem.label : 'Content'}
                </h2>

                <p className={styles.sectionDescription}>
                    This content manager will be connected next.
                </p>
            </div>
        );
    };

    return (
        <div className={styles.contentManager}>
            <div className={styles.topHeader}>
                <p className={styles.eyebrow}>KQ WORLD</p>

                <h1 className={styles.title}>Content Management</h1>

                <p className={styles.description}>
                    Manage content displayed on the KQ World homepage.
                </p>
            </div>

            <div className={styles.cmsShell}>
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarHeading}>
                        <span className={styles.sidebarBadge}>CMS</span>
                        <span>Homepage Content</span>
                    </div>

                    <nav className={styles.navigation}>
                        {navItems.map((item) => {
                            const isActive = activeSection === item.key;

                            return (
                                <button
                                    key={item.key}
                                    type="button"
                                    className={
                                        isActive
                                            ? styles.navButtonActive
                                            : styles.navButton
                                    }
                                    onClick={() => setActiveSection(item.key)}
                                >
                                    <span className={styles.navIcon}>
                                        {item.shortLabel}
                                    </span>

                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>

                <main
                    className={
                        styles.mainContent
                    }
                >
                    {activeSection ===
                        'dashboard' &&
                        renderDashboard()}

                    {activeSection ===
                        'banners' && (
                            <BannerManager
                                context={context}
                            />
                        )}

                    {activeSection ===
                        'quickActions' && (
                            <QuickActionManager
                                context={context}
                            />
                        )}

                    {activeSection ===
                        'news' && (
                            <CompanyNewsManager
                                context={context}
                            />
                        )}

                    {activeSection ===
                        'videos' && (
                            <VideoManager
                                context={context}
                            />
                        )}

                    {activeSection ===
                        'moments' && (
                            <MomentsManager
                                context={context}
                            />
                        )}

                    {activeSection !== 'dashboard' &&
                        activeSection !== 'banners' &&
                        activeSection !== 'quickActions' &&
                        activeSection !== 'news' &&
                        activeSection !== 'videos' &&
                        activeSection !== 'moments' &&
                        renderPlaceholder()}
                </main>
            </div>
        </div>
    );
};

export default KqContentManager;