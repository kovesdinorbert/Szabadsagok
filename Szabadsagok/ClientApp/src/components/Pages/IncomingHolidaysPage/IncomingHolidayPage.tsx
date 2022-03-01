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

// import './design.css';
import InputField from '../../Common/InputField/InputField';
import { InputFieldModel } from '../../Common/InputField/InputFieldModel';
import { faEnvelopeSquare } from '@fortawesome/free-solid-svg-icons';
import { IncomingHolidayModel } from './IncomingHolidayModel';
import InputTextArea from '../../Common/InputTextArea/InputTextArea';
import { InputTextAreaModel } from '../../Common/InputTextArea/InputTextAreaModel';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
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

export interface IState {
    blocking: boolean;
    holidays?: IncomingHolidayModel[];
  }

// PureComponent vs Component
class IncomingHolidayPage extends React.PureComponent<any>/*<CounterProps>*/ {

    public state: IState = { holidays: undefined,
                             blocking : false};
    token: string = "";

    // toast = useRef(null);
    toast : RefObject<Toast>;

    constructor(props: any) {
        super(props);
        // this.mentesHandleClick = this.mentesHandleClick.bind(this);
        // this.megseHandleClick = this.megseHandleClick.bind(this);
        // this.showToast = this.showToast.bind(this);
        // this.handleEmailChange = this.handleEmailChange.bind(this);
        // this.reasonEnterPressed = this.reasonEnterPressed.bind(this);
        // this.dateSelected = this.dateSelected.bind(this);
        // this.setFormIsValid = this.setFormIsValid.bind(this);
        // this.setReason = this.setReason.bind(this);
        this.sendRequest = this.sendRequest.bind(this);
        this.auth = this.auth.bind(this);
        
        this.toast = React.createRef();
        this.auth();
      }


    private showToast(severity: string, summary: string, detail: string){
        if (this.toast.current !== null)
            this.toast.current.show({severity: severity, summary: summary, detail: detail, life: 3000});
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
                response.json().then((resp: any) => {
                  this.token = resp.token;
                  this.sendRequest();
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
        let url = `${process.env.REACT_APP_API_PATH}/holiday`;
        this.setState({blocking: true});
        
        const requestOptions = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 
                    'Authorization': 'Bearer ' + this.token 
                }
        };
          
        fetch(url, requestOptions)
          .then(async response => {
            if (!response.ok) {
                this.showToast('error', 'Sikertelen művelet', 'Sikertelen művelet');
              } else {
                const data: IncomingHolidayModel[] = await response.json();
                this.setState({holidays: data});
                this.showToast('success', 'Sikeres művelet', 'Sikeres művelet');
                // response.json().then((resp: any) => {
                //     debugger;
                //     this.setState({holidays: resp});
                //     this.showToast('success', 'Sikeres művelet', 'Sikeres művelet');
                //   });
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
                {this.state.holidays 
                ? <DataTable value={this.state.holidays}>
                    <Column field="start" header="start"></Column>
                    <Column field="end" header="end"></Column>
                    <Column field="userName" header="userName"></Column>
                  </DataTable>
                : <></>}
                <Toast ref={this.toast} />
            </React.Fragment>
        );
    }
};

export default connect(
    // (state: ApplicationState) => state.counter,
    // CounterStore.actionCreators
)(IncomingHolidayPage);
