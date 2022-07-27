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
import { Guid } from 'guid-typescript';
import * as UserStore from '../../../store/AppContextStore';
import { RoleEnum } from '../../../enums/RoleEnum';
import moment from 'moment';

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
          this.props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        } else {
          response.json().then((resp: any) => {
            this.token = resp.token;
            debugger;
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
      icon: { icon: faEnvelopeSquare },
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
