import React from 'react';
import { connect } from 'react-redux';
import FullCalendar, { DateSelectArg } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import moment from 'moment';
import { Button } from 'primereact/button';
import { faEnvelopeSquare } from '@fortawesome/free-solid-svg-icons';
import { HolidayRequestModel } from './HolidayRequestModel';
import InputTextArea from '../../Common/InputTextArea/InputTextArea';
import { InputTextAreaModel } from '../../Common/InputTextArea/InputTextAreaModel';
import * as UserStore from '../../../store/AppContextStore';
import jwt_decode from "jwt-decode";

import './design.css';
import CalendarBase from '../../Component/CalendarBase/CalendarBase';

    
class HolidayPage extends React.PureComponent<any> {

  public state: any = {
    start: Date,
    end: Date,
    formIsValid: false,
    availableHoliday: 0
  };

  token: string = "";
  reason: string = "";
  isValidDict: {[key: string]: boolean} = {start: false, end: false, reason: false};

  constructor(props: any) {
    super(props);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.reasonEnterPressed = this.reasonEnterPressed.bind(this);
    this.dateSelected = this.dateSelected.bind(this);
    this.setFormIsValid = this.setFormIsValid.bind(this);
    this.setReason = this.setReason.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this.getAvailableHolidays = this.getAvailableHolidays.bind(this);
  }

  componentDidMount() {
    if (!this.props.token) {
    } else {
      this.token = this.props.token;
      this.sendRequest();
    }
    this.getAvailableHolidays();
  }

  private dateSelected(e: DateSelectArg): void {
    this.setState({ start: moment(e.start).utc().add(10,'h'), end: moment(e.end).utc().add(-10,'h') });
    this.isValidDict["start"] = moment(e.start).isValid();
    this.isValidDict["end"] = moment(e.end).isValid();
    this.setFormIsValid();
  }


  private setReason(e: string, v: boolean): void {
    this.reason = e;
    this.isValidDict["reason"] = v;
    this.setFormIsValid();
  }

  private setFormIsValid() {
    this.setState({ formIsValid: Object.keys(this.isValidDict).filter(key => !this.isValidDict[key]).length === 0 });
  }

  private reasonEnterPressed() {
    this.sendRequest();
  }

  private handleEmailChange(email: string) {
    this.setState({ email: email });
  }

  private getAvailableHolidays() {
    const decoded : any = jwt_decode(this.token);
    const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    let url = `${process.env.REACT_APP_API_PATH}/holiday/availableholidayforuser/` + userId.toString();
    this.props.setLoadingState(true);

    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token
      },
    };

    fetch(url, requestOptions)
      .then(async response => {
        if (!response.ok) {
          this.props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        } else {
          const data: number = await response.json();
          this.setState({ availableHoliday: data });
        }
        this.props.setLoadingState(false);
      })
      .catch(error => {
        this.props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        this.props.setLoadingState(false);
      });
  }

  private sendRequest() {
    if (!this.state.formIsValid) {
      return;
    }
    this.props.setLoadingState(true);
    
    let url = `${process.env.REACT_APP_API_PATH}/holiday`;
    
    let holidayReq: HolidayRequestModel = {
      start: this.state.start,
      end: this.state.end,
      reason: this.reason
    }
    const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token
      },
      body: JSON.stringify(holidayReq)
    };

    fetch(url, requestOptions)
      .then(async response => {
        if (!response.ok) {
          this.props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        } else {
          this.props.showToastrMessage({severity: 'success', summary:'Sikeres művelet', detail: 'Sikeres művelet'});
        }
        this.setState({ body: "", subject: "", name: "", email: "", showMessage: true });
        this.props.setLoadingState(false);
      })
      .catch(error => {
        this.props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        this.props.setLoadingState(false);
      });
  }

  public render() {
    let confReason: InputTextAreaModel = {
      label: 'Kérelem oka',
      id: "reason_id",
      required: true,
      rows: 5,
      cols: 30,
      icon: { icon: faEnvelopeSquare },
      type: 'text',
    };
    
    return (
      <React.Fragment>
        <h1>Új igény rögzítése</h1>
        <h3>Elérhető szabadnapok - {this.state.availableHoliday}</h3>
        
        <CalendarBase dateSelected={this.dateSelected}></CalendarBase>
        {/* <FullCalendar selectable={true}
          locale={'hu'}
          headerToolbar={{
            right: 'prev,next',
            center: 'title',
            left: ''
          }}
          plugins={[interactionPlugin, dayGridPlugin]}
          initialView="dayGridMonth"
          select={this.dateSelected}
          selectOverlap={false}
          unselectAuto={false}
          selectMirror={true}
        /> */}
        {moment(this.state.start).isValid()
          ? <label>{moment(this.state.start).format('YYYY. MMMM DD.')} - {moment(this.state.end).format('YYYY. MMMM DD.')}</label> 
          : <></>}
        
        <div>
          <InputTextArea config={confReason} rows={5} cols={30} value={this.reason}
            onInputValueChange={this.setReason} enterPressed={this.reasonEnterPressed} />
        </div>
        <Button disabled={!this.state.formIsValid} className="btn-action" onClick={this.sendRequest}>Mentés</Button>
      </React.Fragment>
    );
  }
};

function mapStateToProps(state :any) {
  const token = state.appcontext.token;
  return {
    token
  };
}

export default connect(
  mapStateToProps,
  UserStore.actionCreators
)(HolidayPage);

