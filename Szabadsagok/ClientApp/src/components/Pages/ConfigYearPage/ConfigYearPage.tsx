import React, { RefObject  } from 'react';
import { connect } from 'react-redux';
import * as UserStore from '../../../store/AppContextStore';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { YearConfigModel } from '../../Component/CalendarBase/YearConfigModel';
import moment from 'moment';
import { DayTypeEnum } from '../../../enums/DayTypeEnum';
import CalendarBase from '../../Component/CalendarBase/CalendarBase';
import { Dialog } from 'primereact/dialog';
import { DayConfigModel } from './DayConfigModel';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'reactstrap';

export interface IState {
  selectedDay: Date | null;
  selectedType: {name: string, type: DayTypeEnum};
}

class ConfigYearPage extends React.Component<any> {

  public state: IState = {
    selectedDay: null,
    selectedType: {name: "", type: DayTypeEnum.Freeday},
  };
  token: string = "";

  yearData: YearConfigModel[] = [];
  types: any = [];
  calendarRef: RefObject<typeof CalendarBase>;
  
  constructor(props: any) {
    super(props);
    this.sendRequest = this.sendRequest.bind(this);
    this.dayRenderer = this.dayRenderer.bind(this);
    this.dateClick = this.dateClick.bind(this);
    this.onTypeChange = this.onTypeChange.bind(this);
    this.getYearData = this.getYearData.bind(this);

    this.calendarRef = React.createRef();

    this.types = [
      { name: 'Hétköznap', type: DayTypeEnum.Workday },
      { name: 'Hétvége', type: DayTypeEnum.Weekend },
      { name: 'Ünnepnap', type: DayTypeEnum.Freeday },
    ];
  }

  componentDidMount() {
    if (!this.props.token) {
    } else {
      this.token = this.props.token;
      this.sendRequest();
    }
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
          var bla = this.calendarRef;
          debugger;
          //ref működik?
          // this.calendarRef?.current?.changeDayType(new YearConfigModel());
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
  
  private dayRenderer() {
    debugger;
    const currentDay: YearConfigModel[] | undefined = this.yearData.filter(y => moment(y.date).isSame(moment(this.state.selectedDay)));
    if (currentDay.length > 0) {
      currentDay[0].type = this.state.selectedType.type;
      // this.calendarRef?.current?.changeDayType();
    } 
   }
  
  private getYearData( dates: YearConfigModel[] ) {
    debugger;
    this.yearData = dates;
    // const currentDay: YearConfigModel[] | undefined = this.yearData.filter(y => moment(y.date).isSame(moment(date.date)));
    // if (currentDay.length > 0 && currentDay[0].type === DayTypeEnum.Weekend) {
    //   return [ 'weekend-day' ];
    // } else if (currentDay.length > 0 && currentDay[0].type === DayTypeEnum.Freeday) {
    //   return [ 'freeday-day' ];
    // } else {
    //   return ['workday-day'];
    // }
   }

  dateClick(info: any){
    this.setState({selectedDay: moment(info.date).toDate()});
  }

  onTypeChange(type: any) {
    this.setState({selectedType: type.value});
  }

  public render() {
    return (
      <React.Fragment>
        <h1>Év beállítása</h1>
        <CalendarBase ref={this.calendarRef} selectable={false} dateClick={this.dateClick} getYearData={this.getYearData}></CalendarBase>
        <label>Nap típusa:</label>
        <Dropdown value={this.state.selectedType} options={this.types} onChange={this.onTypeChange} optionLabel="name"/>
        <Button label="Mentés" onClick={this.dayRenderer} />
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
) (ConfigYearPage);
