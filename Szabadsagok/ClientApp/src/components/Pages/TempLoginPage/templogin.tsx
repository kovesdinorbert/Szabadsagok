import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import { Button } from 'primereact/button';
import { MultiSelect } from 'primereact/multiselect';
import { Calendar } from 'primereact/calendar';
import InputField from '../../Common/InputField/InputField';
import { InputFieldModel } from '../../Common/InputField/InputFieldModel';
import { InputNumericModel } from '../../Common/InputNumeric/InputNumericModel';
import InputNumeric from '../../Common/InputNumeric/InputNumeric';
import { Guid } from 'guid-typescript';
import * as UserStore from '../../../store/AppContextStore';
import { RoleEnum } from '../../../enums/RoleEnum';
import moment from 'moment';
import AuthenticationService from '../../../services/authentication.service';
import qs from 'qs';
import { useAuth0 } from '@auth0/auth0-react';

class TempLoginPage extends React.Component<any> {

  public state: any = {
    email: ""
  };
  token: string = "";
  email: string = "";
  isValidDict: {[key: string]: boolean} = {email: false};

  constructor(props: any) {
    super(props);
    this.setFormIsValid = this.setFormIsValid.bind(this);
    this.setEmail = this.setEmail.bind(this);
    this.auth = this.auth.bind(this);

  }
  
  componentDidMount() {
    const authenticationService: AuthenticationService = new AuthenticationService();
    const auth0_token = qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).session_token;
    this.email = authenticationService.getEmailFromAuth0(auth0_token?.toString());
    this.auth();
  }

  private setEmail(e: string, v: boolean): void {
    this.email = e;
    this.isValidDict["email"] = v;
     
     this.setFormIsValid();
    }
    

  private setFormIsValid() {
    this.setState({ formIsValid: true });
  }


  private auth() {
    let url = `${process.env.REACT_APP_API_PATH}/user/authenticate`;
    let userDataReq = {email: this.email};

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userDataReq)
    };

    fetch(url, requestOptions)
      .then(async response => {
        if (!response.ok) {
          if (response.status == 401) {
            this.props.showToastrMessage({severity: 'error', summary:'Nem jogosult user', detail: 'Nem jogosult user'});
          }
          this.props.removeToken();
          useAuth0().logout();
        } else {
          response.json().then((resp: any) => {
            this.token = resp.token;
            this.props.saveToken(this.token);
            this.props.showToastrMessage({severity: 'succcess', summary:'Sikeres művelet', detail: 'Sikeres művelet'});
          });
        }
        this.setState({ body: "", subject: "", showMessage: true });
      })
      .catch(error => {
        this.props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
      });
  }


  public render() {
    let confEmail: InputFieldModel = {
      label: 'Email cím',
      id: "email_id",
      required: true,
      email: true,
      icon: 'pi-envelope',
      type: 'email',
    };

    return (
      <React.Fragment>
        <div>
          <InputField config={confEmail} value={this.email} onInputValueChange={this.setEmail} />
        </div>
        <Button disabled={!this.state.formIsValid} className="btn-action" onClick={this.auth}>Mentés</Button>
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
)(TempLoginPage);
