import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import InputField from '../../Common/InputField/InputField';
import { InputFieldModel } from '../../Common/InputField/InputFieldModel';
import { faEnvelopeSquare } from '@fortawesome/free-solid-svg-icons';
import { InputNumericModel } from '../../Common/InputNumeric/InputNumericModel';
import InputNumeric from '../../Common/InputNumeric/InputNumeric';
import { UserDataModel } from './UserDataModel';
import { Guid } from 'guid-typescript';
import * as UserStore from '../../../store/UserStore';

class EditUserPage extends React.Component<any> {

  public state: any = {
    formIsValid: false,
    blocking: false,
    holidays: 0,
    user: { name: "", email: "", id: Guid.EMPTY }
  };
  token: string = "";
  user :UserDataModel = { name: "", email: "", id: Guid.parse(Guid.EMPTY) };
  isValidDict: {[key: string]: boolean} = {name: true, email: true};

  toast: RefObject<Toast>;

  constructor(props: any) {
    super(props);
    this.mentesHandleClick = this.mentesHandleClick.bind(this);
    this.megseHandleClick = this.megseHandleClick.bind(this);
    this.showToast = this.showToast.bind(this);
    this.reasonEnterPressed = this.reasonEnterPressed.bind(this);
    this.setFormIsValid = this.setFormIsValid.bind(this);
    this.setEmail = this.setEmail.bind(this);
    this.setName = this.setName.bind(this);
    this.setHolidays = this.setHolidays.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this.auth = this.auth.bind(this);
    this.toast = React.createRef();
    if (props.selectedUser && props.selectedUser[0]) {
      this.user = {...props.selectedUser[0]};
    } else {
      this.user = { id: Guid.parse(Guid.EMPTY), email: '', name: '' };
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

  private auth() {
    let url = `${process.env.REACT_APP_API_PATH}/user/authenticate`;
    this.setState({ blocking: true });

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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
        this.setState({ body: "", blocking: false, subject: "", showMessage: true });
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

    let url = ``;
    this.setState({ blocking: true });

    let userDataReq: UserDataModel = this.user;
    let requestOptions = {};

    if (userDataReq.id && userDataReq.id.toString() !== Guid.EMPTY) {
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
            this.showToast('error', 'Sikertelen művelet', 'Sikertelen művelet');
          } else {
            this.showToast('success', 'Sikeres művelet', 'Sikeres művelet');
          }
          this.setState({ body: "", blocking: false, subject: "", showMessage: true });
          this.props.setLoadingState(false);
          this.props.updateListCb(this.user);
        })
        .catch(error => {
          this.showToast('error', 'Sikertelen művelet', 'Sikertelen művelet');
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
            this.showToast('error', 'Sikertelen művelet', 'Sikertelen művelet');
          } else {
            var data: UserDataModel = await response.json();
            this.setState({ user: data });
            this.showToast('success', 'Sikeres művelet', 'Sikeres művelet');
          }
          this.setState({ body: "", blocking: false, subject: "", showMessage: true });
          this.props.updateListCb(this.user);
          this.props.setLoadingState(false);
        })
        .catch(error => {
          this.showToast('error', 'Sikertelen művelet', 'Sikertelen művelet');
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
        <h1>Userek</h1>
        <div>
          <InputField config={confEmail} value={this.user.email}
            onInputValueChange={this.setEmail} />
        </div>
        <div>
          <InputField config={confName} value={this.user.name}
            onInputValueChange={this.setName} />
        </div>
        <div>
          <InputNumeric config={confAvailableHolidays} value={this.state.holidays}
            onInputValueChange={this.setHolidays} />
        </div>
        <Button disabled={!this.state.formIsValid} className="btn-action" onClick={this.sendRequest}>Mentés</Button>
        <Button className="btn-action" onClick={this.props.onModalClose}>Mégse</Button>
        <Toast ref={this.toast} />
      </React.Fragment>
    );
  }
};

function mapStateToProps(state :any) {
  const token = state.user.token;
  return {
    token
  };
}

export default connect(
  mapStateToProps,
  UserStore.actionCreators
)(EditUserPage);