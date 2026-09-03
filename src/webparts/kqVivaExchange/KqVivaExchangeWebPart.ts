import * as React from 'react';
import * as ReactDOM from 'react-dom';

import {
  BaseClientSideWebPart
} from '@microsoft/sp-webpart-base';

import KqVivaExchange
  from './components/KqVivaExchange';

import {
  IKqVivaExchangeProps
} from './components/IKqVivaExchangeProps';

export interface IKqVivaExchangeWebPartProps {
}

export default class KqVivaExchangeWebPart
  extends BaseClientSideWebPart<
    IKqVivaExchangeWebPartProps
  > {

  public render(): void {

    const element:
      React.ReactElement<
        IKqVivaExchangeProps
      > =
      React.createElement(
        KqVivaExchange,
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