import * as React from 'react';
import * as ReactDom from 'react-dom';

import {
  Version
} from '@microsoft/sp-core-library';

import {
  BaseClientSideWebPart
} from '@microsoft/sp-webpart-base';

import KqWorldFooter from './components/KqWorldFooter';

import type {
  IKqWorldFooterProps
} from './components/IKqWorldFooterProps';

export interface IKqWorldFooterWebPartProps {
  description: string;
}

export default class KqWorldFooterWebPart
  extends BaseClientSideWebPart<IKqWorldFooterWebPartProps> {

  private _isDarkTheme: boolean = false;

  public render(): void {

    const element: React.ReactElement<IKqWorldFooterProps> =
      React.createElement(
        KqWorldFooter,
        {
          isDarkTheme: this._isDarkTheme
        }
      );

    ReactDom.render(
      element,
      this.domElement
    );
  }

  protected onThemeChanged(
    currentTheme: {
      isInverted?: boolean;
    } | undefined
  ): void {

    if (!currentTheme) {
      return;
    }

    this._isDarkTheme =
      !!currentTheme.isInverted;
  }

  protected onDispose(): void {

    ReactDom.unmountComponentAtNode(
      this.domElement
    );
  }

  protected get dataVersion(): Version {

    return Version.parse('1.0');
  }
}