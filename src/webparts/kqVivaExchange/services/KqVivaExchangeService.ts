import {
  WebPartContext
} from '@microsoft/sp-webpart-base';

import {
  AadHttpClient,
  HttpClientResponse
} from '@microsoft/sp-http';

import {
  IKqVivaPost
} from '../models/IKqVivaPost';

interface IVivaMessage {
  id: number;

  body?: {
    plain?: string;
  };

  sender_id?: number;

  created_at?: string;

  liked_by?: {
    count?: number;
  };

  web_url?: string;

  thread_id?: number;
}

interface IVivaUserReference {
  id: number;

  full_name?: string;

  job_title?: string;
}

interface IVivaMessagesResponse {
  messages?: IVivaMessage[];

  references?: IVivaUserReference[];
}

export default class KqVivaExchangeService {

  private readonly _context:
    WebPartContext;

  /*
   * Replace this with the numeric feed/group ID
   * for the KQ Viva community.
   */
  private readonly _communityGroupId:
    number = 182243524608;

  public constructor(
    context: WebPartContext
  ) {

    this._context =
      context;
  }

  public async getLatestPosts():
    Promise<IKqVivaPost[]> {

    if (
      this._communityGroupId === 0
    ) {

      return [];
    }

    const client:
      AadHttpClient =
      await this._context
        .aadHttpClientFactory
        .getClient(
          'https://www.yammer.com'
        );

    const url =
      'https://www.yammer.com' +
      '/api/v1/messages/in_group/' +
      `${this._communityGroupId}.json`;

    const response:
      HttpClientResponse =
      await client.get(
        url,
        AadHttpClient
          .configurations
          .v1
      );

    if (!response.ok) {

      throw new Error(
        `Unable to load Viva Engage posts. ${response.status}`
      );
    }

    const data:
      IVivaMessagesResponse =
      await response.json();

    const messages =
      data.messages || [];

    const references =
      data.references || [];

    return messages
      .slice(0, 3)
      .map(
        (
          message:
            IVivaMessage
        ): IKqVivaPost => {

          const author =
            references.find(
              (
                reference:
                  IVivaUserReference
              ) =>
                reference.id ===
                message.sender_id
            );

          const name =
            author &&
            author.full_name
              ? author.full_name
              : 'KQ Employee';

          return {
            id:
              message.id,

            authorName:
              name,

            authorInitials:
              this._getInitials(
                name
              ),

            authorRole:
              author &&
              author.job_title
                ? author.job_title
                : '',

            createdAt:
              message.created_at
                ? new Date(
                    message.created_at
                  )
                : new Date(),

            body:
              message.body &&
              message.body.plain
                ? message.body.plain
                : '',

            likes:
              message.liked_by &&
              message.liked_by.count
                ? message.liked_by.count
                : 0,

            comments:
              0,

            webUrl:
              message.web_url || ''
          };
        }
      );
  }

  public async createPost(
    body: string
  ): Promise<void> {

    const cleanBody =
      body.trim();

    if (
      !cleanBody ||
      this._communityGroupId === 0
    ) {
      return;
    }

    const client:
      AadHttpClient =
      await this._context
        .aadHttpClientFactory
        .getClient(
          'https://www.yammer.com'
        );

    const formData =
      new URLSearchParams();

    formData.append(
      'body',
      cleanBody
    );

    formData.append(
      'group_id',
      `${this._communityGroupId}`
    );

    const response =
      await client.post(
        'https://www.yammer.com/api/v1/messages.json',
        AadHttpClient
          .configurations
          .v1,
        {
          headers: {
            'Content-Type':
              'application/x-www-form-urlencoded'
          },

          body:
            formData.toString()
        }
      );

    if (!response.ok) {

      throw new Error(
        `Unable to publish Viva Engage post. ${response.status}`
      );
    }
  }

  private _getInitials(
    name: string
  ): string {

    const parts =
      name
        .trim()
        .split(/\s+/);

    if (
      parts.length === 1
    ) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[
        parts.length - 1
      ].charAt(0)
    ).toUpperCase();
  }
}