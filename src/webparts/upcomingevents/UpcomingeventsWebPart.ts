import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import Upcomingevents from './components/Upcomingevents';

export interface IUpcomingeventsWebPartProps {}

export default class UpcomingeventsWebPart extends BaseClientSideWebPart<IUpcomingeventsWebPartProps> {

  public render(): void {
    const element: React.ReactElement = React.createElement(Upcomingevents);

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }
}