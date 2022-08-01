import React, { RefObject, useEffect, useState } from 'react';
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
import { ToastMessage } from 'primereact/toast';
import * as UserStore from '../../../store/AppContextStore';

function UserPage(props: any) {

  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
  const [formIsValid, setFormIsValid] = useState<boolean>(false);
  const [holidays, setHolidays] = useState<number>(0);
  const [users, setUsers] = useState<any>([]);
  const [selectedUser, setSelectedUser] = useState<any>({});
  const [toDeleteUserId, setToDeleteUserId] = useState<string>('');

  useEffect(() => {
    if (!props.token) {
    } else {
      sendRequest();
    }
  }, []);


  const newUserModalClick = () => {
    setSelectedUser({ email: '', name: '', roles: [], id:'' });
    setShowEditModal(!showEditModal);
  }

  const sendRequest = () => {
    let url = `${process.env.REACT_APP_API_PATH}/user/getallusers`;
    props.setLoadingState(true);

    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + props.token
      },
    };

    fetch(url, requestOptions)
      .then(async response => {
        if (!response.ok) {
          props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        } else {
          const data: UserListModel = await response.json();
          setUsers(data);
          props.showToastrMessage({severity: 'success', summary:'Sikeres művelet', detail: 'Sikeres művelet'});
        }
        props.setLoadingState(false);
      })
      .catch(error => {
        props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        props.setLoadingState(false);
      });
  }

  const editUserClick = (id: string) => {
    setSelectedUser(Object.assign( {}, users.filter((u: UserListModel) => u.id === id)[0]));
    if (selectedUser) {
      setShowEditModal(true);
    }
  }

  const deleteUser = () => {
    if (toDeleteUserId && toDeleteUserId !== "") {

      let url = `${process.env.REACT_APP_API_PATH}/user/` + toDeleteUserId.toString();
      props.setLoadingState(true);

      const requestOptions = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + props.token
        },
      };

      fetch(url, requestOptions)
        .then(async response => {
          if (!response.ok) {
            props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
          } else {
            props.showToastrMessage({severity: 'success', summary:'Sikeres művelet', detail: 'Sikeres művelet'});
            setUsers(users.filter((u: UserListModel) => u.id !== toDeleteUserId));
          }
          props.setLoadingState(false);
        })
        .catch(error => {
          props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
          props.setLoadingState(false);
        });
    }
  }

  const showDeleteUserDialog = (id?: string) => {
    if (id) {
      setShowDeleteConfirmModal(true);
      setToDeleteUserId(id);
    } else {
      setToDeleteUserId('');
    }
  }

  const editButtonTemplate = (rowData: any) => {
    return <Button value={rowData.id} label="Szerkesztés" icon="pi pi-external-link" onClick={() => editUserClick(rowData.id)} />
  }

  const deleteButtonTemplate = (rowData: any) => {
    return <Button value={rowData.id} label="Törlés" icon="pi pi-external-link" onClick={() => showDeleteUserDialog(rowData.id)} />
  }

  const hideDeleteDialog = (e: any) => {
    setShowDeleteConfirmModal(false);
  }

  const updateList = (user: UserDataModel) => {
    debugger;
    if (!user || !user.id || user.id.toString() === Guid.EMPTY)
      return;
    let list = users;
    const listUser = list.filter((u: UserListModel) => u.id == user.id);
    if (listUser && listUser.length > 0) {
      listUser[0].email = user.email;
      listUser[0].id = user.id;
      listUser[0].name = user.name;
    } else {
      list.push({ id: user.id, email: user.email, name: user.name });
    }
    setUsers(list);
  }

    return (
      <React.Fragment>
        <h1>Felhasználók</h1>

        {users
          ? <DataTable value={users}>
            <Column style={{ display: 'none' }} field="id" header="id"></Column>
            <Column field="name" header="Név"></Column>
            <Column field="email" header="Email"></Column>
            <Column body={editButtonTemplate}></Column>
            <Column body={deleteButtonTemplate}></Column>
          </DataTable>
          : <></>}
        <Dialog header="Adatok" visible={showEditModal} style={{ width: '50vw' }} footer={<></>} onHide={newUserModalClick}>
          <EditUserPage onModalClose={newUserModalClick} selectedUser={selectedUser} updateListCb={updateList}></EditUserPage>
        </Dialog>
        <Button label="Új felhasználó" icon="pi pi-external-link" onClick={newUserModalClick} />
        <Button disabled={!formIsValid} className="btn-action" onClick={sendRequest}>Mentés</Button>
        <ConfirmDialog visible={showDeleteConfirmModal} message="Biztos törli a felhasználót?" onHide={hideDeleteDialog}
          header="Megerősítés" icon="pi pi-exclamation-triangle" accept={deleteUser} rejectLabel="Mégse" acceptLabel="Ok"/>
      </React.Fragment>
    );
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