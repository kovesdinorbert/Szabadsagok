import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Toast } from 'primereact/toast';
import { faEnvelopeSquare } from '@fortawesome/free-solid-svg-icons';
import { IncomingHolidayModel } from './IncomingHolidayModel';
import { InputTextAreaModel } from '../../Common/InputTextArea/InputTextAreaModel';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { HolidayDistanceEnum } from './HolidayDistanceEnum';
import * as UserStore from '../../../store/AppContextStore';
import { RouteComponentProps } from 'react-router';
export interface IState {
  blocking: boolean;
  holidays?: IncomingHolidayModel[];
}

// type UserProps =
//     UserStore.UserState &
//     typeof UserStore.actionCreators &
//     RouteComponentProps<{}>;
class IncomingHolidayPage extends React.Component<any>/*<CounterProps>*/ {

  public state: IState = {
    holidays: undefined,
    blocking: false,
  };
  token: string = "";

  toast: RefObject<Toast>;

  constructor(props: any) {
    super(props);
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
            this.props.saveToken(this.token);
            this.sendRequest();
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
    let url = `${process.env.REACT_APP_API_PATH}/holiday`;
    this.setState({ blocking: true });
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
          this.showToast('error', 'Sikertelen művelet', 'Sikertelen művelet');
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
)(IncomingHolidayPage);
