import React, { RefObject, forwardRef, useRef, useImperativeHandle } from 'react';
import { connect } from 'react-redux';
import { Toast } from 'primereact/toast';
import * as UserStore from '../../../store/AppContextStore';
import FullCalendar, { DateSelectArg } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { YearConfigModel } from './YearConfigModel';
import moment from 'moment';
import { DayTypeEnum } from '../../../enums/DayTypeEnum';

import './design.css';
import { EventModel } from './EventModel';

export interface IState {
  loaded: boolean,
  events?: any;
}

class CalendarBase extends React.Component<any> {

  public state: IState = {
    loaded: false,
    events: null
  };
  token: string = "";

  yearData: YearConfigModel[] = [];
  calendarRef : RefObject<FullCalendar>;

  constructor(props: any) {
    super(props);
    this.calendarRef = React.createRef();
    this.auth = this.auth.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this.dateSelected = this.dateSelected.bind(this);
    this.dayRenderer = this.dayRenderer.bind(this);
    this.dateClick = this.dateClick.bind(this);
    this.changeDayType = this.changeDayType.bind(this);
    this.mapToCalendarEvents = this.mapToCalendarEvents.bind(this);
    this.getEvents = this.getEvents.bind(this);
  }

  componentDidMount() {
    // debugger;
    // if (this.props.ref) {

    //   this.props.ref(this);
    // }
    if (!this.props.token) {
     this.auth();
    } else {
      this.token = this.props.token;
      this.sendRequest();
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

  private getEvents() {
    if (this.calendarRef == undefined || this.calendarRef == null) return;
    if (this.calendarRef.current == undefined || this.calendarRef.current == null) return;
    // debugger;
    let start = moment(this.calendarRef.current.getApi().view.activeStart).format('LL');
    let end = moment(this.calendarRef.current.getApi().view.activeEnd).format('LL');

    const url = `${process.env.REACT_APP_API_PATH}/event/`+start+'/'+ end;
    const requestOptions = {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + this.token },
    };
    
    fetch(url, requestOptions)
      .then(async response => {
        const data: EventModel[] = await response.json();
        if (!response.ok) {
          if (response.status == 401) {
            // logout
            } this.props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
          } else {
          }
          
          this.setState({events: this.mapToCalendarEvents(data) });
        })
        .catch(error => {
        });
  }

  mapToCalendarEvents(events?: EventModel[]) {
    return events == null || events.length == 0 
      ? {} 
      : events.map((event: any) =>( { id: event.id,
                                      title: event.subject,
                                      start: event.startDate,
                                      end: event.endDate,
                                      className: '' }));
  }

  private async sendRequest() {
    this.props.setLoadingState(true);
    
    let url = `${process.env.REACT_APP_API_PATH}/year/2022`;
    
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token
      }
    };
    fetch(url, requestOptions)
      .then(async response => {
        if (!response.ok) {
          this.props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        } else {
          const data: YearConfigModel[] = await response.json();
          this.yearData = data;
          if (this.props.getYearData) {
            this.props.getYearData(data);
          }
          await this.setState({loaded: true})
          await this.getEvents();
          this.props.showToastrMessage({severity: 'success', summary:'Sikeres művelet', detail: 'Sikeres művelet'});
        }
        // this.setState({ body: "", subject: "", name: "", email: "", showMessage: true });
        this.props.setLoadingState(false);
      })
      .catch(error => {
        this.props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        this.props.setLoadingState(false);
      });
  }
  
  private dateSelected(e: DateSelectArg): void {
    if (this.props.dateSelected) {
        this.props.dateSelected(e);
    }
  }
  
  private dateClick(info: any): void {
    if (this.props.dateClick) {
        this.props.dateClick(info);
    }
  }

  private dayRenderer(date: any) {
    const currentDay: YearConfigModel[] | undefined = this.yearData.filter(y => moment(y.date).isSame(moment(date.date)));
    if (currentDay.length > 0 && currentDay[0].type === DayTypeEnum.Weekend) {
      return [ 'weekend-day' ];
    } else if (currentDay.length > 0 && currentDay[0].type === DayTypeEnum.Freeday) {
      return [ 'freeday-day' ];
    } else {
      return ['workday-day'];
    }
  }

  changeDayType(dayConfig:YearConfigModel) {
    debugger;
    const currentDay: YearConfigModel[] | undefined = this.yearData.filter(y => moment(y.date).isSame(moment(dayConfig.date)));
    if (currentDay.length > 0) {
      currentDay[0].type = dayConfig.type;
    }
   }

  public render() {
    return (
      <div>
        {this.state.loaded ? 
        <FullCalendar selectable={this.props.selectable? this.props.selectable: true}
          ref={this.calendarRef} 
          locale={'hu'}
          headerToolbar={{
            right: 'prev,next',
            center: 'title',
            left: ''
          }}
          plugins={[interactionPlugin, dayGridPlugin]}
          initialView="dayGridMonth"
          select={this.dateSelected}
          dateClick={this.dateClick}
          selectOverlap={false}
          unselectAuto={false}
          selectMirror={true}
          dayCellClassNames={this.dayRenderer} 
          firstDay={1}
          events={this.state.events}
        /> : <></>
        }
      </div>
    );
  }
};

function mapStateToProps(state :any) {
  const token = state.appcontext.token;
  return {
    token,
  };
}

export default connect(
  mapStateToProps,
  UserStore.actionCreators, null, { forwardRef: true }
)(CalendarBase);
