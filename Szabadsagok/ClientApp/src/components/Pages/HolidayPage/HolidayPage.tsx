import React, { memo, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { DateSelectArg } from '@fullcalendar/react';
import moment from 'moment';
import { Button } from 'primereact/button';
import { faEnvelopeSquare } from '@fortawesome/free-solid-svg-icons';
import { HolidayRequestModel } from './HolidayRequestModel';
import InputTextArea from '../../Common/InputTextArea/InputTextArea';
import { InputTextAreaModel } from '../../Common/InputTextArea/InputTextAreaModel';
import * as UserStore from '../../../store/AppContextStore';
import jwt_decode from "jwt-decode";

import './design.css';
import CalendarBase from '../../Component/CalendarBase/CalendarBase';

    
function HolidayPage(props: any) {

  const [formIsValid, setFormIsValid] = useState<boolean>(false);
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [reason, setReason] = useState<string>('');
  const [availableHoliday, setAvailableHoliday] = useState<number>(0);
  const [isValidDict, setIsValidDict] = useState<any>({start: false, end: false, reason: false});
  const [rendered, setRendered] = useState<boolean>(false);

  useEffect(() => {
    if (!props.token) {
    } else if (!rendered){
      setRendered(true);
      sendRequest();
      getAvailableHolidays();
    } else {
      setFormIsValidFv();
    }
  }, [rendered, start, end, reason]);
  

  const dateSelected = (e: DateSelectArg): void => {
    setStart(moment(e.start).utc().add(2,'h').toDate());
    setEnd(moment(e.end).utc().add(-2,'h').toDate());
    
    setIsValidDict({start : moment(e.start).isValid(), end : moment(e.end).isValid()})
  }


  const setReasonFv = (e: string, v: boolean): void => {
    setReason(e);
    setIsValidDict({reason : v})
  }

  const setFormIsValidFv = () => {
    setFormIsValid(Object.keys(isValidDict).filter(key => !isValidDict[key]).length === 0);
  }

  const reasonEnterPressed = () => {
    sendRequest();
  }

  const getAvailableHolidays = () => {
    const decoded : any = jwt_decode(props.token);
    const userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    let url = `${process.env.REACT_APP_API_PATH}/holiday/availableholidayforuser/` + userId.toString();
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
          const data: number = await response.json();
          setAvailableHoliday(data);
        }
        props.setLoadingState(false);
      })
      .catch(error => {
        props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        props.setLoadingState(false);
      });
  }

  const sendRequest = () => {
    if (!formIsValid) {
      return;
    }
    props.setLoadingState(true);
    
    let url = `${process.env.REACT_APP_API_PATH}/holiday`;
    
    let holidayReq: HolidayRequestModel = {
      start: start,
      end: end,
      reason: reason
    }
    const requestOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + props.token
      },
      body: JSON.stringify(holidayReq)
    };

    fetch(url, requestOptions)
      .then(async response => {
        if (!response.ok) {
          props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        } else {
          props.showToastrMessage({severity: 'success', summary:'Sikeres művelet', detail: 'Sikeres művelet'});
        };
        props.setLoadingState(false);
      })
      .catch(error => {
        props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        props.setLoadingState(false);
      });
  }

  const confReason: InputTextAreaModel = {
      label: 'Kérelem oka',
      id: "reason_id",
      required: true,
      rows: 5,
      cols: 30,
      icon: { icon: faEnvelopeSquare },
      type: 'text',
    };
    
    return (
      <React.Fragment>
        <h1>Új igény rögzítése</h1>
        <h3>Elérhető szabadnapok - {availableHoliday}</h3>
        
        <CalendarBase dateSelected={dateSelected}></CalendarBase>
        {moment(start).isValid()
          ? <label>{moment(start).format('YYYY. MMMM DD.')} - {moment(end).format('YYYY. MMMM DD.')}</label> 
          : <></>}
        
        <div>
          <InputTextArea config={confReason} rows={5} cols={30} value={reason}
            onInputValueChange={setReasonFv} enterPressed={reasonEnterPressed} />
        </div>
        <Button disabled={!formIsValid} className="btn-action" onClick={sendRequest}>Mentés</Button>
      </React.Fragment>
    );
};

function mapStateToProps(state :any) {
  const token = state.appcontext.token;
  return {
    token
  };
}

export default memo(connect(
  mapStateToProps,
  UserStore.actionCreators
)(HolidayPage));

