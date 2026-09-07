import {
    SPHttpClient,
    SPHttpClientResponse
} from '@microsoft/sp-http';

import { WebPartContext } from '@microsoft/sp-webpart-base';

import {
    IKqCompanyNewsItem
} from '../models/IKqCompanyNewsItem';

interface ISitePageItem {
    Id: number;
    Title: string;
    FileLeafRef: string;
    Created: string;
    Modified: string;
    Description?: string;
    BannerImageUrl?:
    | {
        Url?: string;
    }
    | string;
    FirstPublishedDate?: string;
}

interface IExternalBlogItem {
    id: number;
    title: string;
    description: string;
    category: string;
    imageUrl: string;
    itemUrl: string;
    publishedDate: Date;
}

export default class KqCompanyNewsService {
    private readonly _context: WebPartContext;
    private readonly _parentWebUrl: string;

    private readonly _blogLandingUrl: string =
        'https://corporate.kenya-airways.com/en/press-room/kq-blog/?types=External+Articles';

    public constructor(context: WebPartContext) {
        this._context = context;

        this._parentWebUrl =
            `${window.location.origin}/homepage`;
    }

    public async getTake3Items():
        Promise<IKqCompanyNewsItem[]> {

        const url =
            `${this._parentWebUrl}` +
            `/_api/web/lists/getbytitle('Site Pages')/items` +
            `?$select=Id,Title,FileLeafRef,Created,Modified,Description,BannerImageUrl,FirstPublishedDate` +
            `&$filter=(Title eq 'TAKE 3') or (Title eq 'Take 3')` +
            `&$orderby=Created desc` +
            `&$top=6`;

        const response: SPHttpClientResponse =
            await this._context.spHttpClient.get(
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
            throw new Error(
                `Failed to load Take 3 items. ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();

        const items: ISitePageItem[] =
            data.value || [];

        return items.map(
            (
                item: ISitePageItem
            ): IKqCompanyNewsItem => ({
                id: item.Id,

                type: 'take3',

                title:
                    this._getTake3DisplayTitle(
                        item
                    ),

                description:
                    item.Description || '',

                publishedDate:
                    this._parseDate(
                        item.FirstPublishedDate ||
                        item.Created
                    ),

                authorName: '',

                category: 'Take 3',

                imageUrl:
                    this._getUrlValue(
                        item.BannerImageUrl
                    ),

                itemUrl:
                    this._buildSitePageUrl(
                        item.FileLeafRef
                    ),

                fileName:
                    item.FileLeafRef
            })
        );
    }

    public async getPrideItems():
        Promise<IKqCompanyNewsItem[]> {

        const url =
            `${this._parentWebUrl}` +
            `/_api/web/lists/getbytitle('Site Pages')/items` +
            `?$select=Id,Title,FileLeafRef,Created,Modified,Description,BannerImageUrl,FirstPublishedDate` +
            `&$filter=Title eq 'THE PRIDE'` +
            `&$orderby=Created desc` +
            `&$top=8`;

        const response: SPHttpClientResponse =
            await this._context.spHttpClient.get(
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
            throw new Error(
                `Failed to load The Pride items. ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();

        const items: ISitePageItem[] =
            data.value || [];

        return items.map(
            (
                item: ISitePageItem
            ): IKqCompanyNewsItem => ({
                id: item.Id,

                type: 'pride',

                title:
                    item.Description ||
                    'The Pride',

                description: '',

                publishedDate:
                    this._parseDate(
                        item.FirstPublishedDate ||
                        item.Created
                    ),

                authorName: '',

                category:
                    'Quarterly Newsletter',

                imageUrl:
                    this._getUrlValue(
                        item.BannerImageUrl
                    ),

                itemUrl:
                    this._buildSitePageUrl(
                        item.FileLeafRef
                    ),

                fileName:
                    item.FileLeafRef,

                issueNumber:
                    this._extractPrideIssueNumber(
                        item.FileLeafRef
                    )
            })
        );
    }
    public async getBlogItems():
        Promise<IKqCompanyNewsItem[]> {

        return [
            {
                id: 1,
                type: 'blog',

                title:
                    'The Hidden Cost of Running an Airline',

                description:
                    'A look at the complex cost structure behind running an airline and the discipline required to build a sustainable carrier.',

                publishedDate:
                    new Date('2026-08-26'),

                authorName:
                    'Mary Mwenga',

                category:
                    'Blog',

                imageUrl: '',

                itemUrl:
                    'https://corporate.kenya-airways.com/en/press-room/kq-blog/2026/august/the-hidden-cost-of-running-an-airline/',

                readTimeMinutes: 4
            },

            {
                id: 2,
                type: 'blog',

                title:
                    "What Kenya Airways' Resilience Reveals About Aviation as Economic Infrastructure",

                description:
                    'How Kenya Airways maintained connectivity through airspace disruptions and why aviation should be treated as critical infrastructure.',

                publishedDate:
                    new Date('2026-08-19'),

                authorName: '',

                category:
                    'Blog',

                imageUrl: '',

                itemUrl:
                    'https://corporate.kenya-airways.com/en/press-room/kq-blog/2026/august/kenya-airways-aviation-as-ecnomic-infrastructure/',

                readTimeMinutes: 6
            },

            {
                id: 3,
                type: 'blog',

                title:
                    'From Cabin to Couture',

                description:
                    'The story of a Kenya Airways flight attendant balancing life in aviation with a passion for fashion and tailoring.',

                publishedDate:
                    new Date('2026-07-08'),

                authorName:
                    'Sharon Kiende',

                category:
                    'Blog',

                imageUrl: '',

                itemUrl:
                    'https://corporate.kenya-airways.com/en/press-room/kq-blog/2026/july/from-cabin-to-couture/',

                readTimeMinutes: 5
            }
        ];
    }

    public async getAllCompanyNews():
        Promise<{
            take3: IKqCompanyNewsItem[];
            blogs: IKqCompanyNewsItem[];
            pride: IKqCompanyNewsItem[];
        }> {

        const results =
            await Promise.all([
                this.getTake3Items(),
                this.getBlogItems(),
                this.getPrideItems()
            ]);

        return {
            take3: results[0],
            blogs: results[1],
            pride: results[2]
        };
    }

    public getBlogLandingUrl():
        string {
        return this._blogLandingUrl;
    }

    private _buildSitePageUrl(
        fileName: string
    ): string {

        return (
            `${this._parentWebUrl}/SitePages/` +
            encodeURIComponent(fileName)
        );
    }

    private _getUrlValue(
        value:
            | string
            | {
                Url?: string;
            }
            | undefined
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

        return value.Url || '';
    }

    private _parseDate(
        value: string
    ): Date {

        if (!value) {
            return new Date();
        }

        return new Date(value);
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
                .filter(Boolean)
                .length;

        return Math.max(
            1,
            Math.ceil(
                words / 200
            )
        );
    }

    private _extractPrideIssueNumber(
        fileName: string
    ): string {

        if (!fileName) {
            return '';
        }

        const match =
            fileName.match(
                /THE[\s-]*PRIDE\s*\(?(\d+)\)?/i
            );

        return match
            ? match[1]
            : '';
    }

    private _getTake3DisplayTitle(
        item: ISitePageItem
    ): string {

        const issue =
            this._extractTake3IssueNumber(
                item.FileLeafRef
            );

        if (issue) {
            return `Take 3 Issue ${issue}`;
        }

        return 'Take 3';
    }

    private _extractTake3IssueNumber(
        fileName: string
    ): string {

        if (!fileName) {
            return '';
        }

        const match =
            fileName.match(
                /TAKE[\s-]*3\s*\(?(\d+)\)?/i
            );

        return match
            ? match[1]
            : '';
    }
}