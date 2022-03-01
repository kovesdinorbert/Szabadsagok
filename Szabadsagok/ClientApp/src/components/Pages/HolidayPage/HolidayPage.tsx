import React, { PureComponent, RefObject, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { addLocale } from 'primereact/api';
import FullCalendar, { DateSelectArg } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import moment from 'moment';
import { Toast } from 'primereact/toast';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';

import './design.css';
import InputField from '../../Common/InputField/InputField';
import { InputFieldModel } from '../../Common/InputField/InputFieldModel';
import { faEnvelopeSquare } from '@fortawesome/free-solid-svg-icons';
import { HolidayRequestModel } from './HolidayRequestModel';
import InputTextArea from '../../Common/InputTextArea/InputTextArea';
import { InputTextAreaModel } from '../../Common/InputTextArea/InputTextAreaModel';
// import '@fullcalendar/common/main.css';
// import '@fullcalendar/daygrid/main.css';
// import '@fullcalendar/timegrid/main.css';
// import '@fullcalendar/list/main.css';
// import { ApplicationState } from '../store';
// import * as CounterStore from '../store/Counter';

// type CounterProps =
//     CounterStore.CounterState &
//     typeof CounterStore.actionCreators &
//     RouteComponentProps<{}>;

// PureComponent vs Component
class HolidayPage extends React.PureComponent<any>/*<CounterProps>*/ {

    public state: any = { start: Date, 
                          end: Date,
                          reason: "",
                          formIsValid : false,
                          blocking : false,
                          email: "" };
    token: string = "";

    // toast = useRef(null);
    toast : RefObject<Toast>;

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
        this.auth();
      }

    private dateSelected (e: DateSelectArg): void {
        this.setState({ start: moment(e.start).add(1,'hour').utc(), end: moment(e.end).utc()});
        // this.setState({ start: moment(e.start).add(1,'hour'), end: moment(e.end).add(-1,'hour')});
        this.setFormIsValid();
    }


    private setReason (e: string): void {
        this.setState({reason: e});
        this.setFormIsValid();
    }

    private setFormIsValid() {
        this.setState({formIsValid : this.state.reason && this.state.start && this.state.end});
    }

    private mentesHandleClick(){
        this.showToast('success', 'Success Message', 'Order submitted');
    }

    private megseHandleClick(){
        this.showToast('info', 'Nem Success Message', 'Nem Order submitted');
    }

    private reasonEnterPressed(){
        // this.showToast('info', 'Email enter pressed', 'Email enter pressed');
        this.sendRequest();
    }

    private showToast(severity: string, summary: string, detail: string){
        if (this.toast.current !== null)
            this.toast.current.show({severity: severity, summary: summary, detail: detail, life: 3000});
    }

    private handleEmailChange(email: string) {
        this.setState({email : email});
      }

      private auth() {
        let url = `${process.env.REACT_APP_API_PATH}/user/authenticate`;
        this.setState({blocking: true});
        
        // let holidayReq: HolidayRequestModel = {
        //   start: this.state.start,
        //   end: this.state.end,
        //   reason: this.state.reason
        // }
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 
                    //  'Authorization': 'Bearer ' + this.authenticationService.instance().currentUserSubject.getValue().token 
                },
          // body: JSON.stringify(holidayReq)
        };
          
        fetch(url, requestOptions)
          .then(async response => {
            if (!response.ok) {
                this.showToast('error', 'Sikertelen művelet', 'Sikertelen művelet');
              } else {
                debugger;
                response.json().then((resp: any) => {
                  this.token = resp.token;
                  this.showToast('success', 'Sikeres művelet', 'Sikeres művelet');
                });
                // this.token = response.formData().token;
              }
              this.setState({body: "", blocking: false, subject : "", name : "", email: "", showMessage: true });
            })
            .catch(error => {
                this.showToast('error', 'Sikertelen művelet', 'Sikertelen művelet');
            });
      }

    private sendRequest() {
        if (!this.state.formIsValid) {
          return;
        }
  // debugger;
        let url = `${process.env.REACT_APP_API_PATH}/holiday`;
        this.setState({blocking: true});
        
        let holidayReq: HolidayRequestModel = {
          start: this.state.start,
          end: this.state.end,
          reason: this.state.reason
        }
        const requestOptions = {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 
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
              this.setState({body: "", blocking: false, subject : "", name : "", email: "", showMessage: true });
            })
            .catch(error => {
                this.showToast('error', 'Sikertelen művelet', 'Sikertelen művelet');
            });
      }

    public render() {
        let confReason : InputTextAreaModel = {
            label: 'Email cím',
            id: "email_id",
            required: true,
            rows: 5,
            cols: 30,
            icon: {icon: faEnvelopeSquare},
            type: 'email',
          }; 

        return (
            <React.Fragment>
                <h1>Szabadságok</h1>
                {/* <Calendar value={this.state.date} onChange={(e) => this.setState({date: e.value})}></Calendar> */}
                <FullCalendar selectable={true}
                              locale={'hu'}
                              headerToolbar={{
                                right: 'prev,next',
                                center: 'title',
                                left: ''
                              }}
                              plugins={[ interactionPlugin, dayGridPlugin ]}
                              initialView="dayGridMonth"
                              select={this.dateSelected}
                />
                <div>
                    <InputTextArea config={confReason} rows={5} cols={30} value={this.state.reason} 
                                   onInputValueChange={this.setReason} enterPressed={this.reasonEnterPressed}/>
                    <label htmlFor="reasonTA">Oka</label>
                </div>
                {/* <div>
                    <><InputField config={confEmail} value={this.state.email} onInputValueChange={this.handleEmailChange} enterPressed={this.emailEnterPressed}></InputField></>
                </div> */}
                <Button disabled={!this.state.formIsValid} className="btn-action" onClick={this.sendRequest}>Mentés</Button>
                {/* <div>
                    <Button label="Mentés" onClick={this.mentesHandleClick} />
                    <Button label="Mégse" onClick={this.megseHandleClick} />
                </div> */}
                <Toast ref={this.toast} />
            </React.Fragment>
        );
    }
};

export default connect(
    // (state: ApplicationState) => state.counter,
    // CounterStore.actionCreators
)(HolidayPage);
