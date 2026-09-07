import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {
  BaseClientSideWebPart
} from '@microsoft/sp-webpart-base';

import KqVideoHub
  from './components/KqVideoHub';

import {
  IKqVideoHubProps
} from './components/IKqVideoHubProps';

export interface IKqVideoHubWebPartProps {
}

export default class KqVideoHubWebPart
  extends BaseClientSideWebPart<
    IKqVideoHubWebPartProps
  > {

  public render(): void {

    const element:
      React.ReactElement<
        IKqVideoHubProps
      > =
      React.createElement(
        KqVideoHub,
        {
          context:
            this.context
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