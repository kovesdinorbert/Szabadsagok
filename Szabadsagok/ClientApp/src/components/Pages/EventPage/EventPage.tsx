import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import * as AppContextStore from '../../../store/AppContextStore';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { EventModel } from './EventModel';

export interface IState {
}

class EventPage extends React.Component<any> {

  public state: any = {
    formIsValid: false,
  };
  token: string = "";
  start: any;
  end: any;

  constructor(props: any) {
    super(props);
    this.setDateStart = this.setDateStart.bind(this);
    this.setDateEnd = this.setDateEnd.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
  }

  componentDidMount() {
    if (!this.props.token) {
    } else {
      this.token = this.props.token;
    }
  }

  setDateStart(value: any) {
    this.start = value.value;
    this.setState({formIsValid: this.start != null && this.end != null});
  }

  setDateEnd(value: any) {
    this.end = value.value;
    this.setState({formIsValid: this.start != null && this.end != null});
  }
  
  private sendRequest() {
    if (!this.state.formIsValid) {
      return;
    } 
    this.props.setLoadingState(true);
    
    let url = `${process.env.REACT_APP_API_PATH}/event`;

    let newEvent: EventModel = {
      startDate: this.start,
      endDate: this.end,
      description: 'teszt',
      subject: 'teszt'
    };
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.token
      },
      body: JSON.stringify(newEvent)
    };

    fetch(url, requestOptions)
      .then(async response => {
        if (!response.ok) {
          this.props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        } else {
          this.props.showToastrMessage({severity: 'success', summary:'Sikeres művelet', detail: 'Sikeres művelet'});
        }
        this.setState({ showMessage: true });
        this.props.setLoadingState(false);
      })
      .catch(error => {
        this.props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        this.props.setLoadingState(false);
      });
  }

  public render() {
    return (
      <React.Fragment>
        <div className='home-page-block'>
          <h3>Kezdet</h3>
          <Calendar id="time24" value={this.start} onChange={this.setDateStart} showTime />
        </div>
        <div className='home-page-block'>
          <h3>Befejezés</h3>
          <Calendar id="time24" value={this.end} onChange={this.setDateEnd} showTime />
        </div>
        <Button disabled={!this.state.formIsValid} className="btn-action" onClick={this.sendRequest}>Mentés</Button>
      </React.Fragment>
    );
  }
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
