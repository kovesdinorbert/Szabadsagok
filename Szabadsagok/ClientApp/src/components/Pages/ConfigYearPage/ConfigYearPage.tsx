import React, { useEffect, useRef, useState  } from 'react';
import { connect } from 'react-redux';
import * as UserStore from '../../../store/AppContextStore';
import { YearConfigModel } from '../../Component/CalendarBase/YearConfigModel';
import moment from 'moment';
import { DayTypeEnum } from '../../../enums/DayTypeEnum';
import CalendarBase from '../../Component/CalendarBase/CalendarBase';
import { ICalendarBase } from "../../Component/CalendarBase/ICalendarBase";
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'reactstrap';
import { DayConfigModel } from './DayConfigModel';


function ConfigYearPage(props: any) {

  const [selectedDay, setSelectedDay] = useState<Date|null>(null);
  const [selectedType, setSelectedType] = useState({name: "", type: DayTypeEnum.Freeday});
  const [yearData, setYearData] = useState<YearConfigModel[] >([]);

  const types: any = [
    { name: 'Hétköznap', type: DayTypeEnum.Workday },
    { name: 'Hétvége', type: DayTypeEnum.Weekend },
    { name: 'Ünnepnap', type: DayTypeEnum.Freeday },
  ];
  
  const calendarRef = useRef<ICalendarBase>(null);
  
  useEffect(() => {
    if (!props.token) {
    } else {
    }
  }, []);


  const saveDayConfig = () => {
    if (!selectedDay) return;

    props.setLoadingState(true);
    
    let url = `${process.env.REACT_APP_API_PATH}/year`;

    const data: DayConfigModel = {
      year: selectedDay.getFullYear(),
      date: selectedDay,
      type: selectedType.type
    };
    
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + props.token
      },
      body: JSON.stringify(data)
    };
    fetch(url, requestOptions)
      .then(async response => {
        if (!response.ok) {
          props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        } else {
          props.showToastrMessage({severity: 'success', summary:'Sikeres művelet', detail: 'Sikeres művelet'});
          var data: DayConfigModel = await response.json();
          if (calendarRef == undefined || calendarRef == null) return;
          if (calendarRef.current == undefined || calendarRef.current == null) return;
          calendarRef.current.changeDayType(data);

        };
        props.setLoadingState(false);
      })
      .catch(error => {
        props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        props.setLoadingState(false);
      });
  }
  
  const dayRenderer = () => {
    const currentDay = yearData.filter(y => moment(y.date).isSame(moment(selectedDay), 'day'));
    if (currentDay.length > 0) {
      saveDayConfig();
    } 
   }
  
  const getYearData = ( dates: YearConfigModel[] ) => {
    setYearData(dates);
   }

  const dateClick = (info: any) => {
    setSelectedDay(moment(info.date).utc().add(2,'h').toDate());
  }

    return (
      <React.Fragment>
        <h1>Év beállítása</h1>
        <CalendarBase ref={calendarRef} selectable={false} dateClick={dateClick} getYearData={getYearData}></CalendarBase>
        <label>Nap típusa:</label>
        <Dropdown value={selectedType} options={types} onChange={(e) => setSelectedType(e.value)} optionLabel="name"/>
        <Button className="btn-action" onClick={dayRenderer}>Mentés</Button>
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
) (ConfigYearPage);
