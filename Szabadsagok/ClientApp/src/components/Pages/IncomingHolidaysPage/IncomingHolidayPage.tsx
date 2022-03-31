import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { faEnvelopeSquare } from '@fortawesome/free-solid-svg-icons';
import { IncomingHolidayModel } from './IncomingHolidayModel';
import { InputTextAreaModel } from '../../Common/InputTextArea/InputTextAreaModel';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { HolidayDistanceEnum } from './HolidayDistanceEnum';
import * as UserStore from '../../../store/AppContextStore';
import { RouteComponentProps } from 'react-router';
export interface IState {
  holidays?: IncomingHolidayModel[];
}

// type UserProps =
//     UserStore.UserState &
//     typeof UserStore.actionCreators &
//     RouteComponentProps<{}>;
class IncomingHolidayPage extends React.Component<any>/*<CounterProps>*/ {

  public state: IState = {
    holidays: undefined
  };
  token: string = "";

  constructor(props: any) {
    super(props);
    this.sendRequest = this.sendRequest.bind(this);
    this.auth = this.auth.bind(this);
  }

  componentDidMount() {
    if (!this.props.token) {
     this.auth();
    } else {
      this.token = this.props.token;
      this.sendRequest();
    }
  }

  private auth() {
    let url = `${process.env.REACT_APP_API_PATH}/user/authenticate`;

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    fetch(url, requestOptions)
      .then(async response => {
        if (!response.ok) {
          this.props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        } else {
          response.json().then((resp: any) => {
            this.token = resp.token;
            this.props.saveToken(this.token);
            this.sendRequest();
            this.props.showToastrMessage({severity: 'success', summary:'Sikeres művelet', detail: 'Sikeres művelet'});
          });
        }
        this.setState({ body: "", subject: "", name: "", email: "", showMessage: true });
      })
      .catch(error => {
        this.props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
      });
  }

  private sendRequest() {
    let url = `${process.env.REACT_APP_API_PATH}/holiday`;
    this.props.setLoadingState(true);

    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token
      }
    };

    fetch(url, requestOptions)
      .then(async response => {
        if (!response.ok) {
          this.props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        } else {
          const data: IncomingHolidayModel[] = await response.json();
          this.setState({
            holidays: data.map((d: IncomingHolidayModel) => {
              return Object.assign({}, d, {
                distance: moment().add(7, 'days').isAfter(moment(d.start))
                  ? HolidayDistanceEnum.Near
                  : moment().add(1, 'months').isAfter(moment(d.start))
                    ? HolidayDistanceEnum.Future
                    : HolidayDistanceEnum.DistantFuture
              });
            })
          });
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
      label: 'Email cím',
      id: "email_id",
      required: true,
      rows: 5,
      cols: 30,
      icon: { icon: faEnvelopeSquare },
      type: 'email',
    };

    return (
      <React.Fragment>
        <h1>Közelgő szabadságok</h1>
        {this.state.holidays
          ? <DataTable value={this.state.holidays}>
            <Column field="start" header="Kezdete"></Column>
            <Column field="end" header="Vége"></Column>
            <Column field="userName" header="Felhasználó"></Column>
            <Column field="distance" header="Távolság"></Column>
          </DataTable>
          : <></>}
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
)(IncomingHolidayPage);
