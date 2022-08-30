import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import * as AppContextStore from '../../../store/AppContextStore';
import CalendarBase from '../../Component/CalendarBase/CalendarBase';
import IncomingHolidays from '../../Component/IncomingHolidays/IncomingHolidays';

import './design.css';
import EventPage from '../EventPage/EventPage';

import "primereact/resources/themes/bootstrap4-dark-blue/theme.css";  //theme
import "primereact/resources/primereact.min.css";                  //core css
import "primeicons/primeicons.css";                                //icons
import { Dialog } from 'primereact/dialog';
import moment from 'moment';
import { ICalendarBase } from '../../Component/CalendarBase/ICalendarBase';

export interface IState {
}

function HomePage(props: any) {

  
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<any>(null);
  
  const calendarRef = useRef<ICalendarBase>(null);

  useEffect(() => {
    if (!props.token) {
    } else {
    }
  }, []);

  const dateClicked = (date: any): void => {
    setSelectedDay(date);
    setShowEventModal(true);
  }

    return (
      <React.Fragment>
        <div className='home-page-block'>
          <h1>Nyitólap</h1>
          <CalendarBase selectable={false} dateClick={dateClicked} ref={calendarRef}></CalendarBase>
        </div>
        <div className='home-page-block'>
          <IncomingHolidays></IncomingHolidays>
        </div>
        <Dialog header="Új esemény" visible={showEventModal} style={{ width: '50vw' }} footer={<></>} onHide={() => setShowEventModal(false)}>
          <EventPage selectedDay={selectedDay} calendarRef={calendarRef.current}></EventPage>
        </Dialog>
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
