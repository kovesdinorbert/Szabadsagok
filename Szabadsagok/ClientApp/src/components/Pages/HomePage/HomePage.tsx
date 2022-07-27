import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import * as AppContextStore from '../../../store/AppContextStore';
import CalendarBase from '../../Component/CalendarBase/CalendarBase';
import IncomingHolidays from '../../Component/IncomingHolidays/IncomingHolidays';
import { Calendar } from 'primereact/calendar';

import './design.css';
import EventPage from '../EventPage/EventPage';

export interface IState {
}

class HomePage extends React.Component<any> {

  public state: IState = {
  };
  token: string = "";
  date7: any = "";

  constructor(props: any) {
    super(props);
  }

  componentDidMount() {
    if (!this.props.token) {
    } else {
      this.token = this.props.token;
    }
  }


  public render() {
    return (
      <React.Fragment>
        <div className='home-page-block'>
          <h1>Nyitólap</h1>
          <CalendarBase selectable={false}></CalendarBase>
        </div>
        <div className='home-page-block'>
          <EventPage />
        </div>
        <div className='home-page-block'>
          <IncomingHolidays></IncomingHolidays>
        </div>
      </React.Fragment>
    );
  }
};

function mapStateToProps(state: any) {
  const token = state.appcontext.token;
  return {
    token
  };
}

export default connect(
  mapStateToProps,
  AppContextStore.actionCreators
)(HomePage);
