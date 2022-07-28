import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import InputField from '../../Common/InputField/InputField';
import { InputFieldModel } from '../../Common/InputField/InputFieldModel';
import { faEnvelopeSquare, faQuran } from '@fortawesome/free-solid-svg-icons';
import { InputNumericModel } from '../../Common/InputNumeric/InputNumericModel';
import InputNumeric from '../../Common/InputNumeric/InputNumeric';
import { UserDataModel } from './UserDataModel';
import { Guid } from 'guid-typescript';
import * as UserStore from '../../../store/AppContextStore';
import { RoleEnum } from '../../../enums/RoleEnum';
import moment from 'moment';
import { HolidayForYearModel } from './HolidayForYearModel';

class EditUserPage extends React.Component<any> {

  public state: any = {
    formIsValid: false,
    holidays: 0,
    year: null,
    user: { name: "", email: "", id: "", roles: null }
  };
  token: string = "";
  user :UserDataModel = { name: "", email: "", id: "", roles: [] };
  year: number = 0;
  roles = [
    {label: 'Általános', value: RoleEnum.Common},
    {label: 'Elfogadó', value: RoleEnum.Accepter},
    {label: 'Adminisztrátor', value: RoleEnum.Admin}
  ];
  isValidDict: {[key: string]: boolean} = {name: false, email: false};

  constructor(props: any) {
    super(props);
    this.reasonEnterPressed = this.reasonEnterPressed.bind(this);
    this.setFormIsValid = this.setFormIsValid.bind(this);
    this.setEmail = this.setEmail.bind(this);
    this.setName = this.setName.bind(this);
    this.setYear = this.setYear.bind(this);
    this.setRoles = this.setRoles.bind(this);
    this.setHolidays = this.setHolidays.bind(this);
    this.sendRequest = this.sendRequest.bind(this);

    if (props.selectedUser && props.selectedUser[0]) {
      this.user = {...props.selectedUser[0]};
      this.isValidDict = {name: true, email: true};
    } else {
      this.user = { email: '', name: '', roles: [] };
    }
  }
  
  componentDidMount() {
    this.setState({user: {roles : this.user.roles}});
    if (!this.props.token) {
    } else {
      this.token = this.props.token;
      this.sendRequest();
    }
  }

  private setEmail(e: string, v: boolean): void {
    this.user.email = e;
    this.isValidDict["email"] = v;
     
     this.setFormIsValid();
    }
    
    private setName(e: string, v: boolean): void {
      this.user.name = e;
      this.isValidDict["name"] = v;
      
      this.setFormIsValid();
    }
    
    private setYear(e: number, v: boolean): void {
      this.year = e;
    }
    
    private async setRoles(e: any) {
      await this.setState({user: {roles: e}});

      this.setFormIsValid();
    }
    
    private setHolidays(e: number, v: boolean): void {
    this.setFormIsValid();
  }

  private setFormIsValid() {
    this.setState({ formIsValid: Object.keys(this.isValidDict).filter(key => !this.isValidDict[key]).length === 0
                                 && this.state.user.roles && this.state.user.roles.length > 0 });
  }

  private reasonEnterPressed() {
    this.sendRequest();
  }


  private sendRequest() {
    if (!this.state.formIsValid) {
      return;
    }
    
  this.props.setLoadingState(true);

    let url = ``;

    let userDataReq: UserDataModel = this.user;
    userDataReq.roles = this.state.user.roles;
    let holidayNumber: HolidayForYearModel = {
      year: moment().year(),
      maxHoliday: this.year
    };
    userDataReq.holidayConfigs = [];
    userDataReq.holidayConfigs.push(holidayNumber);
    let requestOptions = {};

    if (userDataReq.id) {
      url = `${process.env.REACT_APP_API_PATH}/user/updateuser`;
      requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.token
        },
        body: JSON.stringify(userDataReq)
      };
      fetch(url, requestOptions)
        .then(async response => {
          if (!response.ok) {
            this.props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
          } else {
            this.props.showToastrMessage({severity: 'success', summary:'Sikeres művelet', detail: 'Sikeres művelet'});
          }
          this.setState({ body: "", subject: "", showMessage: true });
          this.props.setLoadingState(false);
          this.props.updateListCb(this.user);
        })
        .catch(error => {
          this.props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
          this.props.setLoadingState(false);
        });
    } else {
      url = `${process.env.REACT_APP_API_PATH}/user/createuser`;
      requestOptions = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.token
        },
        body: JSON.stringify(userDataReq)
      };
      fetch(url, requestOptions)
        .then(async response => {
          if (!response.ok) {
            this.props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
          } else {
            var data: UserDataModel = await response.json();
            this.user = data;
            this.props.showToastrMessage({severity: 'success', summary:'Sikeres művelet', detail: 'Sikeres művelet'});
          }
          this.setState({ body: "", subject: "", showMessage: true });
          this.props.updateListCb(this.user);
          this.props.setLoadingState(false);
        })
        .catch(error => {
          this.props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
          this.props.setLoadingState(false);
        });
    }


  }

  public render() {
    let confEmail: InputFieldModel = {
      label: 'Email cím',
      id: "email_id",
      required: true,
      email: true,
      icon: { icon: faEnvelopeSquare },
      type: 'email',
    };
    let confName: InputFieldModel = {
      label: 'Név',
      id: "name_id",
      required: true,
      icon: { icon: faEnvelopeSquare },
      type: 'text',
    };
    let confAvailableHolidays: InputNumericModel = {
      label: 'Elhasználható szabadság',
      id: "availableholidays_id",
      required: true,
      min: 1,
      max: 40,
      icon: { icon: faEnvelopeSquare },
      type: 'text',
    };
    let confYear: InputNumericModel = {
      label: 'Év ' + moment().year(),
      id: "yearconf_id",
      required: false,
      icon: { icon: faEnvelopeSquare },
      type: 'text',
    };

    return (
      <React.Fragment>
        <div>
          <InputField config={confEmail} value={this.user.email} onInputValueChange={this.setEmail} />
        </div>
        <div>
          <InputField config={confName} value={this.user.name} onInputValueChange={this.setName} />
        </div>
        <div>
          <InputNumeric config={confAvailableHolidays} value={this.state.holidays} onInputValueChange={this.setHolidays} />
        </div>
        <div>
        <label htmlFor={"role_select"}>
            Szerepkörök
          </label>
          <MultiSelect id='role_select' value={this.state.user.roles} options={this.roles} onChange={(e) => this.setRoles(e.value)} optionLabel="label" placeholder="" display="chip" />
        </div>
        <div>
          <InputNumeric config={confYear} value={this.year} onInputValueChange={this.setYear} />
        </div>
        <Button disabled={!this.state.formIsValid} className="btn-action" onClick={this.sendRequest}>Mentés</Button>
        <Button className="btn-action" onClick={this.props.onModalClose}>Mégse</Button>
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
)(EditUserPage);