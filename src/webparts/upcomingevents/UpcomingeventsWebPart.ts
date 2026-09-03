import * as React from 'react';
import * as ReactDom from 'react-dom';

import {
  BaseClientSideWebPart
} from '@microsoft/sp-webpart-base';

import Upcomingevents
  from './components/Upcomingevents';

import {
  IUpcomingeventsProps
} from './components/IUpcomingeventsProps';

export interface IUpcomingeventsWebPartProps {}

export default class UpcomingeventsWebPart
  extends BaseClientSideWebPart<IUpcomingeventsWebPartProps> {

  public render(): void {
    const element:
      React.ReactElement<IUpcomingeventsProps> =
      React.createElement(
        Upcomingevents,
        {
          context: this.context
        }
      );

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