import * as React from 'react';
import * as ReactDom from 'react-dom';

import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import KqOnlineProcesses from './components/KqOnlineProcesses';
import { IKqOnlineProcessesProps } from './components/IKqOnlineProcessesProps';

export interface IKqOnlineProcessesWebPartProps {}

export default class KqOnlineProcessesWebPart
  extends BaseClientSideWebPart<IKqOnlineProcessesWebPartProps> {

  public render(): void {

    const element: React.ReactElement<IKqOnlineProcessesProps> =
      React.createElement(
        KqOnlineProcesses,
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