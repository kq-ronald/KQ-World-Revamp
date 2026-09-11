import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart
} from '@microsoft/sp-webpart-base';

import * as strings from 'KqContentManagerWebPartStrings';
import KqContentManager from './components/KqContentManager';
import { IKqContentManagerProps } from './components/IKqContentManagerProps';

export interface IKqContentManagerWebPartProps {
}

export default class KqContentManagerWebPart
  extends BaseClientSideWebPart<IKqContentManagerWebPartProps> {

  public render(): void {
    const element: React.ReactElement<IKqContentManagerProps> =
      React.createElement(
        KqContentManager,
        {
          context: this.context
        }
      );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }
}