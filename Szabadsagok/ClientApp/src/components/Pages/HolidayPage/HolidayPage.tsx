import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import FullCalendar, { DateSelectArg } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import moment from 'moment';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { faEnvelopeSquare } from '@fortawesome/free-solid-svg-icons';
import { HolidayRequestModel } from './HolidayRequestModel';
import InputTextArea from '../../Common/InputTextArea/InputTextArea';
import { InputTextAreaModel } from '../../Common/InputTextArea/InputTextAreaModel';
import * as UserStore from '../../../store/AppContextStore';

import './design.css';
import { RouteComponentProps } from 'react-router';

    
class HolidayPage extends React.PureComponent<any> {

  public state: any = {
    start: Date,
    end: Date,
    formIsValid: false,
    blocking: false,
  };

  token: string = "";
  reason: string = "";
  isValidDict: {[key: string]: boolean} = {start: false, end: false, reason: false};

  toast: RefObject<Toast>;

  constructor(props: any) {
    super(props);
    this.mentesHandleClick = this.mentesHandleClick.bind(this);
    this.megseHandleClick = this.megseHandleClick.bind(this);
    this.showToast = this.showToast.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.reasonEnterPressed = this.reasonEnterPressed.bind(this);
    this.dateSelected = this.dateSelected.bind(this);
    this.setFormIsValid = this.setFormIsValid.bind(this);
    this.setReason = this.setReason.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this.auth = this.auth.bind(this);

    this.toast = React.createRef();
  }

  componentDidMount() {
    if (!this.props.token) {
     this.auth();
    } else {
      this.token = this.props.token;
      this.sendRequest();
    }
  }

  private dateSelected(e: DateSelectArg): void {
    this.setState({ start: moment(e.start).utc(), end: moment(e.end).utc() });
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

  private mentesHandleClick() {
    this.showToast('success', 'Success Message', 'Order submitted');
  }

  private megseHandleClick() {
    this.showToast('info', 'Nem Success Message', 'Nem Order submitted');
  }

  private reasonEnterPressed() {
    this.sendRequest();
  }

  private showToast(severity: string, summary: string, detail: string) {
    if (this.toast.current !== null)
      this.toast.current.show({ severity: severity, summary: summary, detail: detail, life: 3000 });
  }

  private handleEmailChange(email: string) {
    this.setState({ email: email });
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
          this.showToast('error', 'Sikertelen művelet', 'Sikertelen művelet');
        } else {
          response.json().then((resp: any) => {
            this.token = resp.token;
            this.showToast('success', 'Sikeres művelet', 'Sikeres művelet');
          });
        }
        this.setState({ body: "", blocking: false, subject: "", name: "", email: "", showMessage: true });
      })
      .catch(error => {
        this.showToast('error', 'Sikertelen művelet', 'Sikertelen művelet');
      });
  }

  private sendRequest() {
    if (!this.state.formIsValid) {
      return;
    }
    this.props.setLoadingState(true);
    
    let url = `${process.env.REACT_APP_API_PATH}/holiday`;
    this.setState({ blocking: true });

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
          this.showToast('error', 'Sikertelen művelet', 'Sikertelen művelet');
        } else {
          this.showToast('success', 'Sikeres művelet', 'Sikeres művelet');
        }
        this.setState({ body: "", blocking: false, subject: "", name: "", email: "", showMessage: true });
        this.props.setLoadingState(false);
      })
      .catch(error => {
        this.showToast('error', 'Sikertelen művelet', 'Sikertelen művelet');
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
        <FullCalendar selectable={true}
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
        />
        {moment(this.state.start).isValid()
          ? <label>{moment(this.state.start).format('YYYY. MMMM DD.')} - {moment(this.state.end).format('YYYY. MMMM DD.')}</label> 
          : <></>}
        
        <div>
          <InputTextArea config={confReason} rows={5} cols={30} value={this.reason}
            onInputValueChange={this.setReason} enterPressed={this.reasonEnterPressed} />
        </div>
        <Button disabled={!this.state.formIsValid} className="btn-action" onClick={this.sendRequest}>Mentés</Button>
        <Toast ref={this.toast} />
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

