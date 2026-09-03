import * as React from 'react';
import * as ReactDom from 'react-dom';

import {
  BaseClientSideWebPart
} from '@microsoft/sp-webpart-base';

import KqCalendar from './components/KqCalendar';

import {
  IKqCalendarProps
} from './components/IKqCalendarProps';

export interface IKqCalendarWebPartProps {}

export default class KqCalendarWebPart
  extends BaseClientSideWebPart<IKqCalendarWebPartProps> {

  public render(): void {
    const element:
      React.ReactElement<IKqCalendarProps> =
      React.createElement(
        KqCalendar,
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