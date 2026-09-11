import {
    SPHttpClient,
    SPHttpClientResponse
} from '@microsoft/sp-http';

import {
    WebPartContext
} from '@microsoft/sp-webpart-base';

import {
    IKqCompanyNewsItem
} from '../models/IKqCompanyNewsItem';

interface ISharePointCompanyNewsItem {
    Id: number;
    Title?: string;
    MoreInfo?: string;
    Category?: string;
    FeaturedImage?: string;

    ArticleURL?:
    | string
    | {
        Url?: string;
        Description?: string;
    };

    IsPublished?:
    | boolean
    | number
    | string;

    StartDate?: string;
    DisplayOrder?: number;

    FileLeafRef?: string;
    FileRef?: string;
}

export default class KqCompanyNewsService {
    private readonly _context:
        WebPartContext;

    private readonly _libraryName =
        'KQ Company News Dev';

    private readonly _blogLandingUrl =
        'https://corporate.kenya-airways.com/en/press-room/kq-blog/?types=External+Articles';

    public constructor(
        context: WebPartContext
    ) {
        this._context = context;
    }

    public async getAllCompanyNews():
        Promise<{
            take3: IKqCompanyNewsItem[];
            blogs: IKqCompanyNewsItem[];
            pride: IKqCompanyNewsItem[];
        }> {

        const allItems =
            await this._getAllItems();

        console.table(
            allItems.map(
                (item) => ({
                    id:
                        item.Id,

                    title:
                        item.Title,

                    category:
                        item.Category,

                    isPublished:
                        item.IsPublished,

                    startDate:
                        item.StartDate,

                    displayOrder:
                        item.DisplayOrder,

                    articleUrl:
                        this._getUrlValue(
                            item.ArticleURL
                        )
                })
            )
        );

        const now =
            new Date();

        const publishedItems =
            allItems.filter(
                (item) => {

                    const isPublished =
                        item.IsPublished === true ||
                        item.IsPublished === 1 ||
                        String(
                            item.IsPublished
                        ).toLowerCase() === 'true';

                    if (!isPublished) {
                        return false;
                    }

                    if (!item.StartDate) {
                        return true;
                    }

                    const startDate =
                        new Date(
                            item.StartDate
                        );

                    if (
                        Number.isNaN(
                            startDate.getTime()
                        )
                    ) {
                        return true;
                    }

                    return (
                        startDate.getTime() <=
                        now.getTime()
                    );
                }
            );

        const take3 =
            publishedItems
                .filter(
                    (item) => {

                        const category =
                            this._normaliseCategory(
                                item.Category
                            );

                        return (
                            category === 'take 3' ||
                            category === 'take3'
                        );
                    }
                )
                .sort(
                    this._sortByDisplayOrder
                )
                .slice(
                    0,
                    6
                )
                .map(
                    (item) =>
                        this._mapItem(
                            item,
                            'take3'
                        )
                );

        const blogs =
            publishedItems
                .filter(
                    (item) => {

                        const category =
                            this._normaliseCategory(
                                item.Category
                            );

                        return (
                            category === 'blogs' ||
                            category === 'blog'
                        );
                    }
                )
                .sort(
                    this._sortByDisplayOrder
                )
                .slice(
                    0,
                    3
                )
                .map(
                    (item) =>
                        this._mapItem(
                            item,
                            'blog'
                        )
                );

        const pride =
            publishedItems
                .filter(
                    (item) => {

                        const category =
                            this._normaliseCategory(
                                item.Category
                            );

                        return (
                            category === 'the pride' ||
                            category === 'pride'
                        );
                    }
                )
                .sort(
                    this._sortByDisplayOrder
                )
                .slice(
                    0,
                    4
                )
                .map(
                    (item) =>
                        this._mapItem(
                            item,
                            'pride'
                        )
                );

        console.log(
            'KQ Company News DEV mapped:',
            {
                take3,
                blogs,
                pride
            }
        );

        return {
            take3,
            blogs,
            pride
        };
    }

    public async getTake3Items():
        Promise<IKqCompanyNewsItem[]> {

        const result =
            await this.getAllCompanyNews();

        return result.take3;
    }

    public async getBlogItems():
        Promise<IKqCompanyNewsItem[]> {

        const result =
            await this.getAllCompanyNews();

        return result.blogs;
    }

    public async getPrideItems():
        Promise<IKqCompanyNewsItem[]> {

        const result =
            await this.getAllCompanyNews();

        return result.pride;
    }

    public getBlogLandingUrl():
        string {

        return this._blogLandingUrl;
    }

    private async _getAllItems():
        Promise<
            ISharePointCompanyNewsItem[]
        > {

        const webUrl =
            this._context
                .pageContext
                .web
                .absoluteUrl;

        console.log(
            'KQ Company News web:',
            webUrl
        );

        console.log(
            'KQ Company News library:',
            this._libraryName
        );

        const url =
            `${webUrl}` +
            `/_api/web/lists/getbytitle('${this._libraryName}')/items`;

        console.log(
            'KQ Company News request:',
            url
        );

        const response:
            SPHttpClientResponse =
            await this._context
                .spHttpClient
                .get(
                    url,
                    SPHttpClient.configurations.v1,
                    {
                        headers: {
                            Accept:
                                'application/json;odata=nometadata'
                        }
                    }
                );

        if (!response.ok) {
            const errorText =
                await response.text();

            console.error(
                'KQ Company News SharePoint error:',
                response.status,
                response.statusText,
                errorText
            );

            throw new Error(
                `Unable to load Company News. SharePoint returned ${response.status}.`
            );
        }

        const data:
            {
                value:
                ISharePointCompanyNewsItem[];
            } =
            await response.json();

        console.log(
            'KQ Company News FULL SharePoint response:',
            data.value
        );

        if (
            data.value &&
            data.value.length > 0
        ) {
            console.log(
                'KQ Company News FIRST ITEM:',
                data.value[0]
            );

            console.log(
                'KQ Company News FIELD NAMES:',
                Object.keys(
                    data.value[0]
                )
            );
        }

        return (
            data.value || []
        );
    }

    private _mapItem(
        item:
            ISharePointCompanyNewsItem,

        type:
            'take3' |
            'blog' |
            'pride'
    ): IKqCompanyNewsItem {

        return {
            id:
                item.Id,

            type,

            title:
                item.Title || '',

            moreInfo:
                item.MoreInfo || '',

            publishedDate:
                this._parseDate(
                    item.StartDate
                ),

            authorName:
                '',

            category:
                item.Category || '',

            imageUrl:
                this._getImageUrl(
                    item.FeaturedImage,
                    item.FileRef
                ),

            itemUrl:
                this._getUrlValue(
                    item.ArticleURL
                ),

            fileName:
                item.FileLeafRef || '',

            readTimeMinutes:
                type === 'blog'
                    ? this._estimateReadTime(
                        item.MoreInfo || ''
                    )
                    : undefined,

            issueNumber:
                type === 'pride'
                    ? this._extractIssueNumber(
                        item.Title || ''
                    )
                    : undefined
        };
    }

    private _normaliseCategory(
        value?: string
    ): string {

        return (
            value || ''
        )
            .trim()
            .toLowerCase();
    }

    private _sortByDisplayOrder = (
        first:
            ISharePointCompanyNewsItem,

        second:
            ISharePointCompanyNewsItem
    ): number => {

        const firstOrder =
            typeof first.DisplayOrder ===
                'number'
                ? first.DisplayOrder
                : 9999;

        const secondOrder =
            typeof second.DisplayOrder ===
                'number'
                ? second.DisplayOrder
                : 9999;

        return (
            firstOrder -
            secondOrder
        );
    };

    private _getUrlValue(
        value:
            ISharePointCompanyNewsItem[
            'ArticleURL'
            ]
    ): string {

        if (!value) {
            return '';
        }

        if (
            typeof value ===
            'string'
        ) {
            return value;
        }

        return (
            value.Url || ''
        );
    }

    private _getImageUrl(
        value?: string,
        fileRef?: string
    ): string {

        if (value) {
            try {
                const parsed =
                    JSON.parse(
                        value
                    );

                if (
                    parsed &&
                    typeof parsed ===
                    'object'
                ) {

                    if (
                        typeof parsed.serverUrl ===
                        'string' &&
                        typeof parsed.serverRelativeUrl ===
                        'string'
                    ) {
                        return (
                            parsed.serverUrl +
                            parsed.serverRelativeUrl
                        );
                    }

                    if (
                        typeof parsed.serverRelativeUrl ===
                        'string'
                    ) {
                        return (
                            window.location.origin +
                            parsed.serverRelativeUrl
                        );
                    }

                    if (
                        typeof parsed.Url ===
                        'string'
                    ) {
                        return parsed.Url;
                    }

                    if (
                        typeof parsed.url ===
                        'string'
                    ) {
                        return parsed.url;
                    }
                }
            } catch {
                if (
                    value.indexOf(
                        'http://'
                    ) === 0 ||
                    value.indexOf(
                        'https://'
                    ) === 0
                ) {
                    return value;
                }
            }
        }

        if (fileRef) {
            if (
                fileRef.indexOf(
                    '/'
                ) === 0
            ) {
                return (
                    window.location.origin +
                    fileRef
                );
            }

            return fileRef;
        }

        return '';
    }

    private _parseDate(
        value?: string
    ): Date {

        if (!value) {
            return new Date();
        }

        const date =
            new Date(
                value
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return new Date();
        }

        return date;
    }

    private _estimateReadTime(
        text: string
    ): number {

        if (!text) {
            return 1;
        }

        const words =
            text
                .trim()
                .split(/\s+/)
                .filter(
                    Boolean
                )
                .length;

        return Math.max(
            1,
            Math.ceil(
                words / 200
            )
        );
    }

    private _extractIssueNumber(
        value: string
    ): string {

        if (!value) {
            return '';
        }

        const match =
            value.match(
                /(\d+)/
            );

        return match
            ? match[1]
            : '';
    }
}