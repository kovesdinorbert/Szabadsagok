import React, { RefObject } from 'react';
import { connect } from 'react-redux';
import { Toast } from 'primereact/toast';
import * as UserStore from '../../../store/AppContextStore';
import FullCalendar, { DateSelectArg } from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { YearConfigModel } from './YearConfigModel';
import moment from 'moment';
import { DayTypeEnum } from '../../../enums/DayTypeEnum';

import './design.css';

export interface IState {
  loaded: boolean
}

class ConfigYearPage extends React.Component<any> {

  public state: IState = {
    loaded: false
  };
  token: string = "";

  toast: RefObject<Toast>;
  yearData: YearConfigModel[] = [];

  constructor(props: any) {
    super(props);
    this.auth = this.auth.bind(this);
    this.sendRequest = this.sendRequest.bind(this);
    this.dateSelected = this.dateSelected.bind(this);
    this.dayRenderer = this.dayRenderer.bind(this);

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
    this.props.setLoadingState(true);
    
    let url = `${process.env.REACT_APP_API_PATH}/year/2022`;
    
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
          const data: YearConfigModel[] = await response.json();
          this.yearData = data;
          this.setState({loaded: true});
          this.props.showToastrMessage({severity: 'success', summary:'Sikeres művelet', detail: 'Sikeres művelet'});
        }
        // this.setState({ body: "", subject: "", name: "", email: "", showMessage: true });
        this.props.setLoadingState(false);
      })
      .catch(error => {
        this.props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        this.props.setLoadingState(false);
      });
  }
  
  private dayRenderer( date: any ) {
    const currentDay: YearConfigModel[] | undefined = this.yearData.filter(y => moment(y.date).isSame(moment(date.date)));
    if (currentDay.length > 0 && currentDay[0].type === DayTypeEnum.Weekend) {
      return [ 'weekend-day' ];
    } else if (currentDay.length > 0 && currentDay[0].type === DayTypeEnum.Freeday) {
      return [ 'freeday-day' ];
    } else {
      return ['workday-day'];
    }
   }

  private dateSelected(e: DateSelectArg): void {
    // this.setState({ start: moment(e.start).utc(), end: moment(e.end).utc() });
    // this.isValidDict["start"] = moment(e.start).isValid();
    // this.isValidDict["end"] = moment(e.end).isValid();
    // this.setFormIsValid();
  }


  public render() {
    return (
      <React.Fragment>
        <h1>Év beállítása</h1>
        {this.state.loaded ? 
        <FullCalendar selectable={true}
          locale={'hu'}
          headerToolbar={{
            right: 'prev,next',
            center: 'title',
            left: ''
          }}
          plugins={[interactionPlugin, dayGridPlugin]}
          initialView="dayGridMonth"
          select={this.dateSelected}
          selectOverlap={false}
          unselectAuto={false}
          selectMirror={true}
          dayCellClassNames={this.dayRenderer} 
        />: <></>
      }
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
