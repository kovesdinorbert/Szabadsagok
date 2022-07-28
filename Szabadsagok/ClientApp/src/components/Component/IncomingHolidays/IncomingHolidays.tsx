import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { faEnvelopeSquare } from '@fortawesome/free-solid-svg-icons';
import { IncomingHolidayModel } from './IncomingHolidayModel';
import { InputTextAreaModel } from '../../Common/InputTextArea/InputTextAreaModel';
import { DataTable, DataTableRowClassNameOptions } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { HolidayDistanceEnum } from './HolidayDistanceEnum';
import * as UserStore from '../../../store/AppContextStore';
import './design.css';


function IncomingHolidays(props: any) {
  const [holidays, setHolidays] = useState<any[] | null>(null);

  useEffect(() => {
    if (!props.token) {
    } else {
      getIncomingHolidays();
    }
  }, []);

  const getIncomingHolidays = () => {
    let url = `${process.env.REACT_APP_API_PATH}/holiday`;
    props.setLoadingState(true);

    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + props.token
      }
    };

    fetch(url, requestOptions)
      .then(async response => {
        if (!response.ok) {
          props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        } else {
          const data: IncomingHolidayModel[] = await response.json();
          var mappedData = data.map((d: IncomingHolidayModel) => {
            return Object.assign({}, d, {
              distance: moment().add(7, 'days').isAfter(moment(d.start))
                ? HolidayDistanceEnum.Near
                : moment().add(1, 'months').isAfter(moment(d.start))
                  ? HolidayDistanceEnum.Future
                  : HolidayDistanceEnum.DistantFuture
            });
          });
          setHolidays(mappedData);
          props.showToastrMessage({severity: 'success', summary:'Sikeres művelet', detail: 'Sikeres művelet'});
        }
        props.setLoadingState(false);
      })
      .catch(error => {
        props.showToastrMessage({severity: 'error', summary:'Sikertelen művelet', detail: 'Sikertelen művelet'});
        props.setLoadingState(false);
      });
  }

  const getDistanceClass = (data: any, options: DataTableRowClassNameOptions): object | string => {
    if (data.distance === HolidayDistanceEnum.Near) {
      return "near-distance";
    } else if (data.distance === HolidayDistanceEnum.Future) {
      return "future-distance";
    }
    return "far-future-distance";
  }

    const confReason: InputTextAreaModel = {
      label: 'Email cím',
      id: "email_id",
      required: true,
      rows: 5,
      cols: 30,
      icon: { icon: faEnvelopeSquare },
      type: 'email',
    };

    return (
      <React.Fragment>
        <h1>Közelgő szabadságok</h1>
        {holidays !== null
          ? <DataTable value={holidays} rowClassName={getDistanceClass}>
              <Column field="userName" header="Felhasználó"></Column>
              <Column field="start" header="Kezdete"></Column>
              <Column field="end" header="Vége"></Column>
          </DataTable>
          : <></>}
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
)(IncomingHolidays);
