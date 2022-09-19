import React, { RefObject, useEffect, useState } from "react";
import { connect } from "react-redux";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { Calendar } from "primereact/calendar";
import InputField from "../../Common/InputField/InputField";
import { InputFieldModel } from "../../Common/InputField/InputFieldModel";
import {PrimeIconsOptions} from "primereact/api"
import { InputNumericModel } from "../../Common/InputNumeric/InputNumericModel";
import InputNumeric from "../../Common/InputNumeric/InputNumeric";
import { UserDataModel } from "./UserDataModel";
import { Guid } from "guid-typescript";
import * as UserStore from "../../../store/AppContextStore";
import { RoleEnum } from "../../../enums/RoleEnum";
import moment from "moment";
import { HolidayForYearModel } from "./HolidayForYearModel";

function EditUserPage(props: any) {
  const [formIsValid, setFormIsValid] = useState<boolean>(false);
  const [holidays, setHolidays] = useState<number>(0);
  const [year, setYear] = useState<number>(0);
  const [user, setUser] = useState(props.selectedUser);
  const [rendered, setRendered] = useState<boolean>(false);
  const [isValidDict, setIsValidDict] = useState<any>({
    name: false,
    email: false,
  });

  const roles = [
    { label: "Általános", value: RoleEnum.Common },
    { label: "Elfogadó", value: RoleEnum.Accepter },
    { label: "Adminisztrátor", value: RoleEnum.Admin },
  ];

  useEffect(() => {
    if (!props.token) {
    } else if (!rendered) {
      setIsValidDict({ name: true, email: true });
      setRendered(true);
    } else {
      setFormIsValidFv();
    }
  }, [rendered, isValidDict]);

  const setEmail = (e: string, v: boolean): void => {
    setIsValidDict({ email: v, name: isValidDict.name });
    setUser({ email: e, id: user.id, name: user.name, roles: user.roles });
  };

  const setName = (e: string, v: boolean): void => {
    setIsValidDict({ name: v, email: isValidDict.email });
    setUser({ roles: user.roles, name: e, email: user.email, id: user.id });
  };

  const setYearFv = (e: number, v: boolean): void => {
    setYear(e);
  };

  const setRoles = (e: any) => {
    setUser({ roles: e, name: user.name, email: user.email, id: user.id });
    setIsValidDict({ name: isValidDict.name, email: isValidDict.email });
  };

  const setHolidaysFv = (e: number, v: boolean): void => {
    // setFormIsValidFv();
  };

  const setFormIsValidFv = () => {
    setFormIsValid(
      Object.keys(isValidDict).filter((key) => !isValidDict[key]).length ===
        0 &&
        user.roles &&
        user.roles.length > 0
    );
  };

  const sendRequest = () => {
    if (!formIsValid) {
      return;
    }

    props.setLoadingState(true);

    let url = ``;
    let userDataReq: UserDataModel = user;
    // userDataReq.roles = user.roles;
    userDataReq.roles = [];
    let holidayNumber: HolidayForYearModel = {
      year: moment().year(),
      maxHoliday: year,
    };
    userDataReq.holidayConfigs = [];
    userDataReq.holidayConfigs.push(holidayNumber);
    let requestOptions = {};

    if (userDataReq.id) {
      url = `${process.env.REACT_APP_API_PATH}/user/updateuser`;
      requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + props.token,
        },
        body: JSON.stringify(userDataReq),
      };
      fetch(url, requestOptions)
        .then(async (response) => {
          if (!response.ok) {
            props.showToastrMessage({
              severity: "error",
              summary: "Sikertelen művelet",
              detail: "Sikertelen művelet",
            });
          } else {
            props.showToastrMessage({
              severity: "success",
              summary: "Sikeres művelet",
              detail: "Sikeres művelet",
            });
          }
          props.setLoadingState(false);
          props.updateListCb(user);
        })
        .catch((error) => {
          props.showToastrMessage({
            severity: "error",
            summary: "Sikertelen művelet",
            detail: "Sikertelen művelet",
          });
          props.setLoadingState(false);
        });
    } else {
      url = `${process.env.REACT_APP_API_PATH}/user/createuser`;
      requestOptions = {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + props.token,
        },
        body: JSON.stringify(userDataReq),
      };
      fetch(url, requestOptions)
        .then(async (response) => {
          if (!response.ok) {
            props.showToastrMessage({
              severity: "error",
              summary: "Sikertelen művelet",
              detail: "Sikertelen művelet",
            });
          } else {
            var data: UserDataModel = await response.json();
            props.showToastrMessage({
              severity: "success",
              summary: "Sikeres művelet",
              detail: "Sikeres művelet",
            });
            setUser(data);
            props.updateListCb(data);
          }
          props.setLoadingState(false);
        })
        .catch((error) => {
          props.showToastrMessage({
            severity: "error",
            summary: "Sikertelen művelet",
            detail: "Sikertelen művelet",
          });
          props.setLoadingState(false);
        });
    }
  };

  const confEmail: InputFieldModel = {
    label: "Email cím",
    id: "email_id",
    required: true,
    email: true,
    icon: "pi-envelope",
    type: "email",
  };
  const confName: InputFieldModel = {
    label: "Név",
    id: "name_id",
    required: true,
    icon: "pi-id-card",
    type: "text",
  };
  const confAvailableHolidays: InputNumericModel = {
    label: "Elhasználható szabadság",
    id: "availableholidays_id",
    required: true,
    min: 1,
    max: 60,
    icon: "pi-calendar",
    type: "text",
  };
  const confYear: InputNumericModel = {
    label: "Év " + moment().year(),
    id: "yearconf_id",
    required: false,
    icon: "pi-bell",
    type: "text",
  };

  return (
    <React.Fragment>
      <div>
        <InputField
          config={confEmail}
          value={user.email}
          onInputValueChange={setEmail}
        />
      </div>
      <div>
        <InputField
          config={confName}
          value={user.name}
          onInputValueChange={setName}
        />
      </div>
      <div>
        <InputNumeric
          config={confAvailableHolidays}
          value={holidays}
          onInputValueChange={setHolidaysFv}
        />
      </div>
      <div>
        <label htmlFor={"role_select"}>Szerepkörök</label>
        <MultiSelect
          id="role_select"
          value={user.roles}
          options={roles}
          onChange={(e) => setRoles(e.value)}
          optionLabel="label"
          placeholder=""
          display="chip"
        />
      </div>
      <div>
        <InputNumeric
          config={confYear}
          value={year}
          onInputValueChange={setYearFv}
        />
      </div>
      <Button
        disabled={!formIsValid}
        className="btn-action"
        onClick={sendRequest}
      >
        Mentés
      </Button>
      <Button className="btn-action" onClick={props.onModalClose}>
        Mégse
      </Button>
    </React.Fragment>
  );
}

function mapStateToProps(state: any) {
  const token = state.appcontext.token;
  return {
    token,
  };
}

export default connect(mapStateToProps, UserStore.actionCreators)(EditUserPage);
