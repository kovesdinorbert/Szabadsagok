import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import * as AppContextStore from '../../../store/AppContextStore';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { EventModel } from './EventModel';
import InputField from '../../Common/InputField/InputField';
import { InputFieldModel } from '../../Common/InputField/InputFieldModel';

function EventPage(props: any) {
  const [formIsValid, setFormIsValid] = useState<boolean>(false);
  const [start, setStart] = useState<any>(props.selectedDay.date);
  const [end, setEnd] = useState<any>(props.selectedDay.date);
  const [name, setName] = useState<string>('');
  const [isValidDict, setIsValidDict] = useState<any>({
    name: false,
  });

  
  useEffect(() => {
    if (!props.token) {
    } else {
      setFormIsValid(start != null && end != null && isValidDict.name);
    }
  });

  const sendRequest = () => {
    if (!formIsValid) {
      return;
    } 
    
    props.setLoadingState(true);
    
    let url = `${process.env.REACT_APP_API_PATH}/event`;

    let newEvent: EventModel = {
      startDate: start,
      endDate: end,
      description: name,
      subject: name
    };
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + props.token
      },
      body: JSON.stringify(newEvent)
    };

    fetch(url, requestOptions)
      .then(async response => {
        if (!response.ok) {
          props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        } else {
          const data: EventModel = await response.json();
          props.calendarRef.addNewEvent(data);
          props.showToastrMessage({severity: 'success', summary:'Sikeres művelet', detail: 'Sikeres művelet'});
        }
        props.setLoadingState(false);
        setStart(null);
        setEnd(null);
      })
      .catch(error => {
        props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        props.setLoadingState(false);
      });
  }
  
  const setNameInput = (e: string, v: boolean): void => {
    setIsValidDict({ name: v });
    setName(e);
  };

  const confEmail: InputFieldModel = {
    label: "Cím",
    id: "cim_id",
    required: true,
    icon: "pi-envelope",
    type: "text",
  };
  
    return (
      <React.Fragment>
        <div>
          <label>Kezdet</label>
          <Calendar id="time24" value={start} onChange={e => setStart(e.value)} showTime />
        </div>
        <div>
          <label>Vége</label>
          <Calendar id="time24" value={end} onChange={e => setEnd(e.value)} showTime />
        </div>
        <InputField
          config={confEmail}
          value={name}
          onInputValueChange={setNameInput}
        />
        <Button disabled={!formIsValid} className="btn-action" onClick={sendRequest}>Mentés</Button>
      </React.Fragment>
    );
};

function mapStateToProps(state: any) {
  const token = state.appcontext.token;
  return {
    token
  };
}

export default connect(
  mapStateToProps,
  AppContextStore.actionCreators
)(EventPage);
