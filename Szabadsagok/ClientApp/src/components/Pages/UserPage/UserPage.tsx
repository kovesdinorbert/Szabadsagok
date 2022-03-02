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

import InputField from '../../Common/InputField/InputField';
import { InputFieldModel } from '../../Common/InputField/InputFieldModel';
import { faEnvelopeSquare } from '@fortawesome/free-solid-svg-icons';
import InputTextArea from '../../Common/InputTextArea/InputTextArea';
import { InputTextAreaModel } from '../../Common/InputTextArea/InputTextAreaModel';
import { InputNumericModel } from '../../Common/InputNumeric/InputNumericModel';
import InputNumeric from '../../Common/InputNumeric/InputNumeric';
import { UserDataModel } from './UserDataModel';
import { Dialog } from 'primereact/dialog';
import EditUserPage from './EditUserPage';
import { UserListModel } from './UserListModel';
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

// PureComponent vs Component
class UserPage extends React.PureComponent<any>/*<CounterProps>*/ {

    public state: any = { formIsValid : false,
                          blocking : false,
                          holidays : 0,
                          users: [],
                          name : "",
                          showEditModal: false,
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
        this.setEmail = this.setEmail.bind(this);
        this.setName = this.setName.bind(this);
        this.setHolidays = this.setHolidays.bind(this);
        this.sendRequest = this.sendRequest.bind(this);
        this.auth = this.auth.bind(this);
        this.editModalClick = this.editModalClick.bind(this);
        
        this.toast = React.createRef();
        this.auth();
      }

    private dateSelected (e: DateSelectArg): void {
        this.setState({ start: moment(e.start).add(1,'hour').utc(), end: moment(e.end).utc()});
        // this.setState({ start: moment(e.start).add(1,'hour'), end: moment(e.end).add(-1,'hour')});
        this.setFormIsValid();
    }


    private setEmail (e: string): void {
        this.setState({email: e});
        this.setFormIsValid();
    }

    private setName (e: string): void {
        this.setState({name: e});
        this.setFormIsValid();
    }

    private setHolidays (e: number): void {
        this.setState({holidays: e});
        this.setFormIsValid();
    }

    private setFormIsValid() {
        this.setState({formIsValid : this.state.name && this.state.email});
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

    private editModalClick(){
      this.setState({showEditModal : !this.state.showEditModal});
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
                response.json().then((resp: any) => {
                  this.token = resp.token;
                  this.showToast('success', 'Sikeres művelet', 'Sikeres művelet');
                  this.sendRequest();
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
        let url = `${process.env.REACT_APP_API_PATH}/user/getallusers`;
        this.setState({blocking: true});
        
        const requestOptions = {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 
                    'Authorization': 'Bearer ' + this.token 
                },
        };
          
        fetch(url, requestOptions)
          .then(async response => {
            if (!response.ok) {
                this.showToast('error', 'Sikertelen művelet', 'Sikertelen művelet');
                this.setState({blocking: false});
              } else {
                debugger;
                const data: UserListModel = await response.json();
                this.setState({users: data, blocking: false});
                this.showToast('success', 'Sikeres művelet', 'Sikeres művelet');
              }
            })
            .catch(error => {
                this.showToast('error', 'Sikertelen művelet', 'Sikertelen művelet');
            });
      }

    public render() {
        let confEmail : InputFieldModel = {
            label: 'Email cím',
            id: "email_id",
            required: true,
            email: true,
            icon: {icon: faEnvelopeSquare},
            type: 'email',
          }; 
          let confName : InputFieldModel = {
              label: 'Név',
              id: "name_id",
              required: true,
              icon: {icon: faEnvelopeSquare},
              type: 'text',
            }; 
            let confAvailableHolidays : InputNumericModel = {
                label: 'Elhasználható szabadság',
                id: "availableholidays_id",
                required: true,
                min: 1,
                max: 40,
                icon: {icon: faEnvelopeSquare},
                type: 'text',
              }; 

        return (
            <React.Fragment>
                <h1>Userek</h1>

                {this.state.users 
                ? <DataTable value={this.state.users}>
                    <Column field="name" header="name"></Column>
                    <Column field="email" header="email"></Column>
                  </DataTable>
                : <></>}
                {/* <div>
                    <><InputField config={confEmai
                      l} value={this.state.email} onInputValueChange={this.handleEmailChange} enterPressed={this.emailEnterPressed}></InputField></>
                </div> */}
                <Dialog header="Header" visible={this.state.showEditModal} style={{ width: '50vw' }} footer={<></>} onHide={this.editModalClick}>
                    <EditUserPage onModalClose={this.editModalClick}></EditUserPage>
                </Dialog>
                <Button label="Show" icon="pi pi-external-link" onClick={this.editModalClick} />
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
)(UserPage);
