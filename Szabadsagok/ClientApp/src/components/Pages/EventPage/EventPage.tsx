import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import * as AppContextStore from '../../../store/AppContextStore';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { EventModel } from './EventModel';

function EventPage(props: any) {
  const [formIsValid, setFormIsValid] = useState<boolean>(false);
  const [start, setStart] = useState<any>(null);
  const [end, setEnd] = useState<any>(null);
  
  useEffect(() => {
    if (!props.token) {
    } else {
      setFormIsValid(start != null && end != null);
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
      description: 'teszt',
      subject: 'teszt'
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
          props.showToastrMessage({severity: 'success', summary:'Sikeres művelet', detail: 'Sikeres művelet'});
        }
        props.setLoadingState(false);
        setStart(null);
        setEnd(null);
        //TODO calendar frissítés az új eventtel
      })
      .catch(error => {
        props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        props.setLoadingState(false);
      });
  }

    return (
      <React.Fragment>
        <div className='home-page-block'>
          <h3>Kezdet</h3>
          <Calendar id="time24" value={start} onChange={e => setStart(e.value)} showTime />
        </div>
        <div className='home-page-block'>
          <h3>Befejezés</h3>
          <Calendar id="time24" value={end} onChange={e => setEnd(e.value)} showTime />
        </div>
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
