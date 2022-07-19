import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import * as AppContextStore from '../../../store/AppContextStore';
import CalendarBase from '../../Component/CalendarBase/CalendarBase';
import IncomingHolidays from '../../Component/IncomingHolidays/IncomingHolidays';
import { Calendar } from 'primereact/calendar';

import './design.css';
import EventPage from '../../Component/EventPage/EventPage';

export interface IState {
}

class HomePage extends React.Component<any> {

  public state: IState = {
  };
  token: string = "";
  date7: any = "";

  constructor(props: any) {
    super(props);
    this.auth = this.auth.bind(this);
    this.setDate7 = this.setDate7.bind(this);
  }

  componentDidMount() {
    if (!this.props.token) {
      this.auth();
    } else {
      this.token = this.props.token;
    }
  }

  private auth() {
    let url = `${process.env.REACT_APP_API_PATH}/user/authenticate`;
    this.setState({ blocking: true });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    fetch(url, requestOptions)
      .then(async response => {
        if (!response.ok) {
        } else {
          response.json().then((resp: any) => {
            this.token = resp.token;
            this.props.saveToken(this.token);
          });
        }
        this.setState({ body: "", blocking: false, subject: "", name: "", email: "", showMessage: true });
      })
      .catch(error => {
      });
  }

  setDate7(value: any) {
    debugger;
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
