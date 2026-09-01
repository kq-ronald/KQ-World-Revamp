import * as React from 'react';
import * as ReactDom from 'react-dom';

import {
  BaseClientSideWebPart
} from '@microsoft/sp-webpart-base';

import KqCalendar from './components/KqCalendar';

export interface IKqCalendarWebPartProps {
  // No configurable properties yet
}

export default class KqCalendarWebPart
  extends BaseClientSideWebPart<IKqCalendarWebPartProps> {

  public render(): void {
    const element: React.ReactElement =
      React.createElement(KqCalendar);

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