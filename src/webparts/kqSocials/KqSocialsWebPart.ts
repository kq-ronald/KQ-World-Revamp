import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {
  BaseClientSideWebPart
} from '@microsoft/sp-webpart-base';

import KqSocials
  from './components/KqSocials';

import {
  IKqSocialsProps
} from './components/IKqSocialsProps';

export interface IKqSocialsWebPartProps {
}

export default class KqSocialsWebPart
  extends BaseClientSideWebPart<
    IKqSocialsWebPartProps
  > {

  public render(): void {

    const element:
      React.ReactElement<
        IKqSocialsProps
      > =
      React.createElement(
        KqSocials,
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