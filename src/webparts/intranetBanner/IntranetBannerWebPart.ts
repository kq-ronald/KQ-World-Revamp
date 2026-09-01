import * as React from 'react';
import * as ReactDom from 'react-dom';

import {
  BaseClientSideWebPart
} from '@microsoft/sp-webpart-base';

import IntranetBanner from './components/IntranetBanner';

export interface IIntranetBannerWebPartProps {
  // No configurable properties yet
}

export default class IntranetBannerWebPart
  extends BaseClientSideWebPart<IIntranetBannerWebPartProps> {

  public render(): void {
    const element: React.ReactElement =
      React.createElement(IntranetBanner);

    ReactDom.render(
      element,
      this.domElement
    );
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(
      this.domElement
    );
  }
}