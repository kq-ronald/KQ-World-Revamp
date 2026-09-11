import {
    WebPartContext
} from '@microsoft/sp-webpart-base';

import {
    SPHttpClient,
    SPHttpClientResponse
} from '@microsoft/sp-http';

import {
    ICompanyNews
} from '../models/ICompanyNews';

export interface IAddCompanyNewsInput {
    imageFile: File;
    title: string;
    moreInfo: string;
    category: string;
    articleUrl: string;
    isPublished: boolean;
    startDate?: string;
    displayOrder: number;
}

export interface IUpdateCompanyNewsInput {
    id: number;
    imageFile?: File;
    currentFileName: string;
    currentFileUrl: string;
    title: string;
    moreInfo: string;
    category: string;
    articleUrl: string;
    isPublished: boolean;
    startDate?: string;
    displayOrder: number;
}

interface ISharePointNewsItem {
    Id: number;
    Title?: string;
    MoreInfo?: string;
    Category?: string;
    FeaturedImage?: string;

    ArticleUrl?:
    | string
    | {
        Url?: string;
        Description?: string;
    };

    IsPublished?: boolean;
    StartDate?: string;
    DisplayOrder?: number;
    FileLeafRef?: string;
    FileRef?: string;
}

interface IUploadedFileResponse {
    ServerRelativeUrl?: string;

    ListItemAllFields?: {
        Id?: number;
    };
}

export class CompanyNewsService {
    private readonly context:
        WebPartContext;

    private readonly libraryName =
        'KQ Company News Dev';

    private readonly allowedCategories = [
        'Take 3',
        'Blogs',
        'The Pride'
    ];

    public constructor(
        context: WebPartContext
    ) {
        this.context = context;
    }

    public async getCompanyNews():
        Promise<ICompanyNews[]> {
        const webUrl =
            this.context.pageContext.web.absoluteUrl;

        const endpoint =
            `${webUrl}/_api/web/lists/getbytitle(` +
            `'${this.libraryName}')/items` +
            `?$select=` +
            `Id,` +
            `Title,` +
            `MoreInfo,` +
            `Category,` +
            `FeaturedImage,` +
            `ArticleUrl,` +
            `IsPublished,` +
            `StartDate,` +
            `DisplayOrder,` +
            `FileLeafRef,` +
            `FileRef` +
            `&$orderby=DisplayOrder asc`;

        const response =
            await this.context.spHttpClient.get(
                endpoint,
                SPHttpClient.configurations.v1
            );

        await this.ensureSuccess(
            response,
            'Unable to load Company News.'
        );

        const data: {
            value: ISharePointNewsItem[];
        } = await response.json();

        return data.value.map(
            (item): ICompanyNews => {
                const fileUrl =
                    item.FileRef || '';

                const featuredImageUrl =
                    this.getImageUrl(
                        item.FeaturedImage
                    ) ||
                    this.toAbsoluteUrl(
                        fileUrl
                    );

                return {
                    id:
                        item.Id,

                    title:
                        item.Title ||
                        item.FileLeafRef ||
                        '',

                    moreInfo:
                        item.MoreInfo || '',

                    category:
                        item.Category || '',

                    featuredImageUrl,

                    articleUrl:
                        this.getUrlValue(
                            item.ArticleUrl
                        ),

                    isPublished:
                        item.IsPublished === true,

                    startDate:
                        item.StartDate,

                    displayOrder:
                        item.DisplayOrder || 0,

                    fileName:
                        item.FileLeafRef || '',

                    fileUrl
                };
            }
        );
    }

    public async addCompanyNews(
        input: IAddCompanyNewsInput
    ): Promise<void> {
        this.validateInput(input);

        await this.ensureUniqueDisplayOrder(
            input.displayOrder
        );

        const uploaded =
            await this.uploadImageFile(
                input.imageFile
            );

        await this.updateMetadata(
            uploaded.itemId,
            {
                title:
                    input.title,

                moreInfo:
                    input.moreInfo,

                category:
                    input.category,

                articleUrl:
                    input.articleUrl,

                isPublished:
                    input.isPublished,

                startDate:
                    input.startDate,

                displayOrder:
                    input.displayOrder,

                imageFileName:
                    uploaded.fileName,

                imageServerRelativeUrl:
                    uploaded.serverRelativeUrl
            }
        );
    }

    public async updateCompanyNews(
        input: IUpdateCompanyNewsInput
    ): Promise<void> {
        this.validateInput(input);

        await this.ensureUniqueDisplayOrder(
            input.displayOrder,
            input.id
        );

        let itemId =
            input.id;

        let imageFileName =
            input.currentFileName;

        let imageServerRelativeUrl =
            input.currentFileUrl;

        if (input.imageFile) {
            const uploaded =
                await this.uploadImageFile(
                    input.imageFile
                );

            itemId =
                uploaded.itemId;

            imageFileName =
                uploaded.fileName;

            imageServerRelativeUrl =
                uploaded.serverRelativeUrl;

            await this.updateMetadata(
                itemId,
                {
                    title:
                        input.title,

                    moreInfo:
                        input.moreInfo,

                    category:
                        input.category,

                    articleUrl:
                        input.articleUrl,

                    isPublished:
                        input.isPublished,

                    startDate:
                        input.startDate,

                    displayOrder:
                        input.displayOrder,

                    imageFileName,

                    imageServerRelativeUrl
                }
            );

            await this.deleteOldFile(
                input.currentFileUrl
            );

            return;
        }

        await this.updateMetadata(
            itemId,
            {
                title:
                    input.title,

                moreInfo:
                    input.moreInfo,

                category:
                    input.category,

                articleUrl:
                    input.articleUrl,

                isPublished:
                    input.isPublished,

                startDate:
                    input.startDate,

                displayOrder:
                    input.displayOrder,

                imageFileName,

                imageServerRelativeUrl
            }
        );
    }

    public async setCompanyNewsPublished(
        id: number,
        isPublished: boolean
    ): Promise<void> {
        const webUrl =
            this.context.pageContext.web.absoluteUrl;

        const endpoint =
            `${webUrl}/_api/web/lists/getbytitle(` +
            `'${this.libraryName}')/items(` +
            `${id})`;

        const response =
            await this.context.spHttpClient.post(
                endpoint,
                SPHttpClient.configurations.v1,
                {
                    headers: {
                        Accept:
                            'application/json;odata=nometadata',

                        'Content-Type':
                            'application/json;odata=nometadata',

                        'IF-MATCH': '*',

                        'X-HTTP-Method':
                            'MERGE'
                    },

                    body:
                        JSON.stringify({
                            IsPublished:
                                isPublished
                        })
                }
            );

        await this.ensureSuccess(
            response,
            'Unable to update Company News status.'
        );
    }

    private async uploadImageFile(
        file: File
    ): Promise<{
        itemId: number;
        fileName: string;
        serverRelativeUrl: string;
    }> {
        const webUrl =
            this.context.pageContext.web.absoluteUrl;

        const rootFolder =
            await this.getLibraryRootFolder();

        const safeFileName =
            this.createUniqueFileName(
                file.name
            );

        const escapedFolder =
            rootFolder.replace(
                /'/g,
                "''"
            );

        const escapedFileName =
            safeFileName.replace(
                /'/g,
                "''"
            );

        const endpoint =
            `${webUrl}/_api/web/GetFolderByServerRelativeUrl(` +
            `'${escapedFolder}')/Files/add(` +
            `url='${escapedFileName}',overwrite=false)` +
            `?$expand=ListItemAllFields`;

        const buffer =
            await file.arrayBuffer();

        const response =
            await this.context.spHttpClient.post(
                endpoint,
                SPHttpClient.configurations.v1,
                {
                    headers: {
                        Accept:
                            'application/json;odata=nometadata'
                    },

                    body:
                        buffer
                }
            );

        await this.ensureSuccess(
            response,
            'Unable to upload Company News image.'
        );

        const uploaded:
            IUploadedFileResponse =
            await response.json();

        const itemId =
            uploaded.ListItemAllFields &&
                uploaded.ListItemAllFields.Id
                ? uploaded.ListItemAllFields.Id
                : 0;

        const serverRelativeUrl =
            uploaded.ServerRelativeUrl || '';

        if (
            !itemId ||
            !serverRelativeUrl
        ) {
            throw new Error(
                'The image uploaded but SharePoint did not return the required file information.'
            );
        }

        return {
            itemId,

            fileName:
                safeFileName,

            serverRelativeUrl
        };
    }

    private async updateMetadata(
        itemId: number,
        input: {
            title: string;
            moreInfo: string;
            category: string;
            articleUrl: string;
            isPublished: boolean;
            startDate?: string;
            displayOrder: number;
            imageFileName: string;
            imageServerRelativeUrl: string;
        }
    ): Promise<void> {
        const webUrl =
            this.context.pageContext.web.absoluteUrl;

        const endpoint =
            `${webUrl}/_api/web/lists/getbytitle(` +
            `'${this.libraryName}')/items(` +
            `${itemId})`;

        const featuredImage =
            this.buildImageFieldValue(
                input.imageFileName,
                input.imageServerRelativeUrl
            );

        const payload = {
            Title:
                input.title.trim(),

            MoreInfo:
                input.moreInfo.trim(),

            Category:
                input.category,

            FeaturedImage:
                featuredImage,

            ArticleUrl:
                input.articleUrl.trim()
                    ? {
                        Url:
                            input.articleUrl.trim(),

                        Description:
                            input.title.trim()
                    }
                    : null,

            IsPublished:
                input.isPublished,

            StartDate:
                input.startDate
                    ? new Date(
                        input.startDate
                    ).toISOString()
                    : null,

            DisplayOrder:
                input.displayOrder
        };

        const response =
            await this.context.spHttpClient.post(
                endpoint,
                SPHttpClient.configurations.v1,
                {
                    headers: {
                        Accept:
                            'application/json;odata=nometadata',

                        'Content-Type':
                            'application/json;odata=nometadata',

                        'IF-MATCH': '*',

                        'X-HTTP-Method':
                            'MERGE'
                    },

                    body:
                        JSON.stringify(payload)
                }
            );

        await this.ensureSuccess(
            response,
            'Unable to save Company News metadata.'
        );
    }

    private async getLibraryRootFolder():
        Promise<string> {
        const webUrl =
            this.context.pageContext.web.absoluteUrl;

        const endpoint =
            `${webUrl}/_api/web/lists/getbytitle(` +
            `'${this.libraryName}')/RootFolder` +
            `?$select=ServerRelativeUrl`;

        const response =
            await this.context.spHttpClient.get(
                endpoint,
                SPHttpClient.configurations.v1
            );

        await this.ensureSuccess(
            response,
            'Unable to locate the Company News library.'
        );

        const data: {
            ServerRelativeUrl?: string;
        } = await response.json();

        if (!data.ServerRelativeUrl) {
            throw new Error(
                'Company News library root folder could not be found.'
            );
        }

        return data.ServerRelativeUrl;
    }

    private async deleteOldFile(
        serverRelativeUrl: string
    ): Promise<void> {
        if (!serverRelativeUrl) {
            return;
        }

        const webUrl =
            this.context.pageContext.web.absoluteUrl;

        const escapedUrl =
            serverRelativeUrl.replace(
                /'/g,
                "''"
            );

        const endpoint =
            `${webUrl}/_api/web/GetFileByServerRelativeUrl(` +
            `'${escapedUrl}')`;

        const response =
            await this.context.spHttpClient.post(
                endpoint,
                SPHttpClient.configurations.v1,
                {
                    headers: {
                        Accept:
                            'application/json;odata=nometadata',

                        'IF-MATCH': '*',

                        'X-HTTP-Method':
                            'DELETE'
                    }
                }
            );

        await this.ensureSuccess(
            response,
            'The new image was saved, but the previous image could not be removed.'
        );
    }

    private buildImageFieldValue(
        fileName: string,
        serverRelativeUrl: string
    ): string {
        return JSON.stringify({
            type:
                'thumbnail',

            fileName,

            serverUrl:
                window.location.origin,

            serverRelativeUrl
        });
    }

    private validateInput(
        input: {
            title: string;
            category: string;
            articleUrl: string;
            displayOrder: number;
        }
    ): void {
        if (!input.title.trim()) {
            throw new Error(
                'Company News title is required.'
            );
        }

        const validCategory =
            this.allowedCategories.some(
                (category) =>
                    category === input.category
            );

        if (!validCategory) {
            throw new Error(
                'Please select a valid Company News category.'
            );
        }

        if (!input.articleUrl.trim()) {
            throw new Error(
                'Article URL is required.'
            );
        }

        if (
            !this.isValidUrl(
                input.articleUrl
            )
        ) {
            throw new Error(
                'Please enter a valid Article URL.'
            );
        }

        if (
            !Number.isInteger(
                input.displayOrder
            ) ||
            input.displayOrder < 1
        ) {
            throw new Error(
                'Display order must be a whole number greater than 0.'
            );
        }
    }

    private async ensureUniqueDisplayOrder(
        displayOrder: number,
        excludeId?: number
    ): Promise<void> {
        const news =
            await this.getCompanyNews();

        const duplicate =
            news.some(
                (item) =>
                    item.displayOrder ===
                    displayOrder &&
                    item.id !== excludeId
            );

        if (duplicate) {
            throw new Error(
                `Display order ${displayOrder} is already in use.`
            );
        }
    }

    private getUrlValue(
        value:
            ISharePointNewsItem['ArticleUrl']
    ): string {
        if (!value) {
            return '';
        }

        if (
            typeof value === 'string'
        ) {
            return value;
        }

        return value.Url || '';
    }

    private getImageUrl(
        value?: string
    ): string {
        if (!value) {
            return '';
        }

        try {
            const parsed =
                JSON.parse(value);

            if (
                parsed &&
                typeof parsed === 'object'
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
                    return this.toAbsoluteUrl(
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
            return this.toAbsoluteUrl(
                value
            );
        }

        return '';
    }

    private toAbsoluteUrl(
        value: string
    ): string {
        if (!value) {
            return '';
        }

        if (
            value.indexOf('http://') === 0 ||
            value.indexOf('https://') === 0
        ) {
            return value;
        }

        if (
            value.indexOf('/') === 0
        ) {
            return (
                window.location.origin +
                value
            );
        }

        return value;
    }

    private isValidUrl(
        value: string
    ): boolean {
        try {
            const url =
                new URL(
                    value,
                    window.location.origin
                );

            return (
                url.protocol === 'http:' ||
                url.protocol === 'https:'
            );
        } catch {
            return false;
        }
    }

    private createUniqueFileName(
        originalName: string
    ): string {
        const cleanName =
            originalName.replace(
                /[^a-zA-Z0-9._-]/g,
                '-'
            );

        const timestamp =
            new Date().getTime();

        const dotIndex =
            cleanName.lastIndexOf('.');

        if (dotIndex === -1) {
            return (
                `${timestamp}-${cleanName}`
            );
        }

        const baseName =
            cleanName.substring(
                0,
                dotIndex
            );

        const extension =
            cleanName.substring(
                dotIndex
            );

        return (
            `${timestamp}-${baseName}${extension}`
        );
    }

    private async ensureSuccess(
        response: SPHttpClientResponse,
        message: string
    ): Promise<void> {
        if (response.ok) {
            return;
        }

        const errorText =
            await response.text();

        console.error(
            message,
            response.status,
            errorText
        );

        throw new Error(
            `${message} SharePoint returned ${response.status}.`
        );
    }
}