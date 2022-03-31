import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import { Toast } from 'primereact/toast';
import * as UserStore from '../../../store/AppContextStore';

export interface IState {
}

class ConfigYearPage extends React.Component<any> {

  public state: IState = {
  };
  token: string = "";

  toast: RefObject<Toast>;

  constructor(props: any) {
    super(props);
    this.auth = this.auth.bind(this);

    this.toast = React.createRef();
  }

  componentDidMount() {
    if (!this.props.token) {
     this.auth();
    } else {
      this.token = this.props.token;
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
            this.showToast('success', 'Sikeres művelet', 'Sikeres művelet');
          });
        }
        this.setState({ body: "", blocking: false, subject: "", name: "", email: "", showMessage: true });
      })
      .catch(error => {
        this.showToast('error', 'Sikertelen művelet', 'Sikertelen művelet');
      });
  }


  public render() {
    return (
      <React.Fragment>
        <h1>Év beállítása</h1>
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
)(ConfigYearPage);
