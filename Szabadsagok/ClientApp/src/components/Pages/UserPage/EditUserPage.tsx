import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import { Button } from 'primereact/button';
import InputField from '../../Common/InputField/InputField';
import { InputFieldModel } from '../../Common/InputField/InputFieldModel';
import { faEnvelopeSquare } from '@fortawesome/free-solid-svg-icons';
import { InputNumericModel } from '../../Common/InputNumeric/InputNumericModel';
import InputNumeric from '../../Common/InputNumeric/InputNumeric';
import { UserDataModel } from './UserDataModel';
import { Guid } from 'guid-typescript';
import * as UserStore from '../../../store/AppContextStore';

class EditUserPage extends React.Component<any> {

  public state: any = {
    formIsValid: false,
    holidays: 0,
    user: { name: "", email: "", id: Guid.EMPTY }
  };
  token: string = "";
  user :UserDataModel = { name: "", email: "", id: "" };
  isValidDict: {[key: string]: boolean} = {name: false, email: false};

  constructor(props: any) {
    super(props);
    this.reasonEnterPressed = this.reasonEnterPressed.bind(this);
    this.setFormIsValid = this.setFormIsValid.bind(this);
    this.setEmail = this.setEmail.bind(this);
    this.setName = this.setName.bind(this);
    this.setHolidays = this.setHolidays.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this.auth = this.auth.bind(this);
    
    if (props.selectedUser && props.selectedUser[0]) {
      this.user = {...props.selectedUser[0]};
      this.isValidDict = {name: true, email: true};
    } else {
      this.user = { email: '', name: '' };
    }
  }
  
  componentDidMount() {
    if (!this.props.token) {
     this.auth();
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
    
    private setHolidays(e: number, v: boolean): void {
    this.setFormIsValid();
  }

  private setFormIsValid() {
    this.setState({ formIsValid: Object.keys(this.isValidDict).filter(key => !this.isValidDict[key]).length === 0 });
  }

  private reasonEnterPressed() {
    this.sendRequest();
  }

  private auth() {
    let url = `${process.env.REACT_APP_API_PATH}/user/authenticate`;

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    };

    fetch(url, requestOptions)
      .then(async response => {
        if (!response.ok) {
          this.props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        } else {
          response.json().then((resp: any) => {
            this.token = resp.token;
            this.props.showToastrMessage({severity: 'succcess', summary:'Sikeres művelet', detail: 'Sikeres művelet'});
          });
        }
        this.setState({ body: "", subject: "", showMessage: true });
      })
      .catch(error => {
        this.props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
      });
  }

  private sendRequest() {
    if (!this.state.formIsValid) {
      return;
    }
    
this.props.setLoadingState(true);

    let url = ``;

    let userDataReq: UserDataModel = this.user;
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