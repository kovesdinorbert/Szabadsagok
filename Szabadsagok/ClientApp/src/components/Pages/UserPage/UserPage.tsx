import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import { DateSelectArg } from '@fullcalendar/react';
import moment from 'moment';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { UserDataModel } from './UserDataModel';
import { Dialog } from 'primereact/dialog';
import EditUserPage from './EditUserPage';
import { UserListModel } from './UserListModel';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Guid } from 'guid-typescript';
import { ConfirmDialog } from 'primereact/confirmdialog';
import * as UserStore from '../../../store/AppContextStore';
class UserPage extends React.PureComponent<any> {

  public state: any = {
    formIsValid: false,
    blocking: false,
    holidays: 0,
    users: [],
    name: "",
    showEditModal: false,
    showDeleteConfirmModal: false,
    email: ""
  };
  selectedUser = {};
  token: string = "";
  toDeleteUserId: string = "";

  toast: RefObject<Toast>;

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
    this.newUserModalClick = this.newUserModalClick.bind(this);
    this.editButtonTemplate = this.editButtonTemplate.bind(this);
    this.editUserClick = this.editUserClick.bind(this);
    this.updateList = this.updateList.bind(this);
    this.showDeleteUserDialog = this.showDeleteUserDialog.bind(this);
    this.deleteButtonTemplate = this.deleteButtonTemplate.bind(this);
    this.hideDeleteDialog = this.hideDeleteDialog.bind(this);
    this.deleteUser = this.deleteUser.bind(this);

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

  private dateSelected(e: DateSelectArg): void {
    this.setState({ start: moment(e.start).add(1, 'hour').utc(), end: moment(e.end).utc() });
    this.setFormIsValid();
  }


  private setEmail(e: string): void {
    this.setState({ email: e });
    this.setFormIsValid();
  }

  private setName(e: string): void {
    this.setState({ name: e });
    this.setFormIsValid();
  }

  private setHolidays(e: number): void {
    this.setState({ holidays: e });
    this.setFormIsValid();
  }

  private setFormIsValid() {
    this.setState({ formIsValid: this.state.name && this.state.email });
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

  private newUserModalClick() {
    this.selectedUser = {};
    this.setState({ showEditModal: !this.state.showEditModal });
  }

  private showToast(severity: string, summary: string, detail: string) {
    if (this.toast.current !== null)
      this.toast.current.show({ severity: severity, summary: summary, detail: detail, life: 3000 });
  }

  private handleEmailChange(email: string) {
    this.setState({ email: email });
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
            this.showToast('success', 'Sikeres művelet', 'Sikeres művelet');
            this.sendRequest();
          });
        }
        this.setState({ body: "", blocking: false, subject: "", name: "", email: "", showMessage: true });
      })
      .catch(error => {
        this.showToast('error', 'Sikertelen művelet', 'Sikertelen művelet');
      });
  }

  private sendRequest() {
    let url = `${process.env.REACT_APP_API_PATH}/user/getallusers`;
    this.setState({ blocking: true });
    this.props.setLoadingState(true);

    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token
      },
    };

    fetch(url, requestOptions)
      .then(async response => {
        if (!response.ok) {
          this.showToast('error', 'Sikertelen művelet', 'Sikertelen művelet');
          this.setState({ blocking: false });
        } else {
          const data: UserListModel = await response.json();
          this.setState({ users: data, blocking: false });
          this.showToast('success', 'Sikeres művelet', 'Sikeres művelet');
        }
        this.props.setLoadingState(false);
      })
      .catch(error => {
        this.showToast('error', 'Sikertelen művelet', 'Sikertelen művelet');
        this.props.setLoadingState(false);
      });
  }

  editUserClick(id: string) {
    this.selectedUser = Object.assign( {}, this.state.users.filter((u: UserListModel) => u.id === id));
    if (this.selectedUser) {
      this.setState({ showEditModal: true });
    }
  }

  deleteUser() {
    if (this.toDeleteUserId && this.toDeleteUserId !== "") {

      let url = `${process.env.REACT_APP_API_PATH}/user/` + this.toDeleteUserId.toString();
      this.setState({ blocking: true });

      const requestOptions = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.token
        },
      };

      fetch(url, requestOptions)
        .then(async response => {
          if (!response.ok) {
            this.showToast('error', 'Sikertelen művelet', 'Sikertelen művelet');
            this.setState({ blocking: false });
          } else {
            this.setState({ users: this.state.users.filter((u: UserListModel) => u.id !== this.toDeleteUserId), blocking: false });
            this.showToast('success', 'Sikeres művelet', 'Sikeres művelet');
          }
        })
        .catch(error => {
          this.showToast('error', 'Sikertelen művelet', 'Sikertelen művelet');
        });
    }
  }

  showDeleteUserDialog(id?: string) {
    if (id) {
      this.setState({ showDeleteConfirmModal: true });
      this.toDeleteUserId = id;
    } else {
      this.toDeleteUserId = "";
    }
  }

  editButtonTemplate(rowData: any) {
    return <Button value={rowData.id} label="Szerkesztés" icon="pi pi-external-link" onClick={() => this.editUserClick(rowData.id)} />
  }

  deleteButtonTemplate(rowData: any) {
    return <Button value={rowData.id} label="Törlés" icon="pi pi-external-link" onClick={() => this.showDeleteUserDialog(rowData.id)} />
  }

  hideDeleteDialog(e: any) {
    this.setState({ showDeleteConfirmModal: false });
  }

  updateList(user: UserDataModel) {
    if (!user || !user.id || user.id.toString() === Guid.EMPTY)
      return;
    let list = this.state.users;
    const listUser = list.filter((u: UserListModel) => u.id == user.id);
    if (listUser && listUser.length > 0) {
      listUser[0].email = user.email;
      listUser[0].id = user.id;
      listUser[0].name = user.name;
    } else {
      list.push({ id: user.id, email: user.email, name: user.name });
    }
    this.setState({ users: list });
  }

  public render() {
    return (
      <React.Fragment>
        <h1>Felhasználók</h1>

        {this.state.users
          ? <DataTable value={this.state.users}>
            <Column style={{ display: 'none' }} field="id" header="id"></Column>
            <Column field="name" header="Név"></Column>
            <Column field="email" header="Email"></Column>
            <Column body={this.editButtonTemplate}></Column>
            <Column body={this.deleteButtonTemplate}></Column>
          </DataTable>
          : <></>}
        <Dialog header="Adatok" visible={this.state.showEditModal} style={{ width: '50vw' }} footer={<></>} onHide={this.newUserModalClick}>
          <EditUserPage onModalClose={this.newUserModalClick} selectedUser={this.selectedUser} updateListCb={this.updateList}></EditUserPage>
        </Dialog>
        <Button label="Új felhasználó" icon="pi pi-external-link" onClick={this.newUserModalClick} />
        <Button disabled={!this.state.formIsValid} className="btn-action" onClick={this.sendRequest}>Mentés</Button>
        <ConfirmDialog visible={this.state.showDeleteConfirmModal} message="Biztos törli a felhasználót?" onHide={this.hideDeleteDialog}
          header="Megerősítés" icon="pi pi-exclamation-triangle" accept={this.deleteUser} rejectLabel="Mégse" acceptLabel="Ok"/>
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
)(UserPage);