import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {
  BaseClientSideWebPart
} from '@microsoft/sp-webpart-base';

import KqCompanyNews from './components/KqCompanyNews';

import {
  IKqCompanyNewsProps
} from './components/IKqCompanyNewsProps';

export interface IKqCompanyNewsWebPartProps {
}

export default class KqCompanyNewsWebPart
  extends BaseClientSideWebPart<IKqCompanyNewsWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IKqCompanyNewsProps> =
      React.createElement(
        KqCompanyNews,
        {
          context: this.context
        }
      );

    ReactDOM.render(
      element,
      this.domElement
    );
  }

  protected onDispose(): void {
    ReactDOM.unmountComponentAtNode(
      this.domElement
    );
  }
}