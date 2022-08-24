import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import * as AppContextStore from '../../../store/AppContextStore';
import CalendarBase from '../../Component/CalendarBase/CalendarBase';
import IncomingHolidays from '../../Component/IncomingHolidays/IncomingHolidays';

import './design.css';
import EventPage from '../EventPage/EventPage';

import "primereact/resources/themes/bootstrap4-dark-blue/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";                                //icons

export interface IState {
}

function HomePage(props: any) {

  useEffect(() => {
    if (!props.token) {
    } else {
    }
  }, []);

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
