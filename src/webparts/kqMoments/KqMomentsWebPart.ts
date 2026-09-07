import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {
  BaseClientSideWebPart
} from '@microsoft/sp-webpart-base';

import KqMoments
  from './components/KqMoments';

import {
  IKqMomentsProps
} from './components/IKqMomentsProps';

export interface IKqMomentsWebPartProps {
}

export default class KqMomentsWebPart
  extends BaseClientSideWebPart<
    IKqMomentsWebPartProps
  > {

  public render(): void {

    const element:
      React.ReactElement<
        IKqMomentsProps
      > =
      React.createElement(
        KqMoments,
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