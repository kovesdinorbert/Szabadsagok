import React, {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  memo,
} from "react";
import { connect } from "react-redux";
import * as UserStore from "../../../store/AppContextStore";
import FullCalendar, { DateSelectArg } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { YearConfigModel } from "./YearConfigModel";
import moment from "moment";
import { DayTypeEnum } from "../../../enums/DayTypeEnum";

import "./design.css";
import { EventModel } from "./EventModel";
import { ICalendarBase } from "./ICalendarBase";

const CalendarBase = forwardRef<ICalendarBase, any>((props: any, ref) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [events, setEvents] = useState<any>([]);
  const [yearData, setYearData] = useState<YearConfigModel[]>([]);

  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    if (!props.token) {
    } else {
      getDayConfigs();
    }
  }, []);

  const getDayConfigs = () => {
    props.setLoadingState(true);

    let url = `${process.env.REACT_APP_API_PATH}/year/2022`;

    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + props.token,
      },
    };
    fetch(url, requestOptions)
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 401) {
            props.saveToken("");
          }
          props.showToastrMessage({
            severity: "error",
            summary: "Sikertelen művelet",
            detail: "Sikertelen művelet",
          });
        } else {
          const data: YearConfigModel[] = await response.json();
          setYearData(data);
          if (props.getYearData) {
            props.getYearData(data);
          }
          setLoaded(true);
          getEvents();
          props.showToastrMessage({
            severity: "success",
            summary: "Sikeres művelet",
            detail: "Sikeres művelet",
          });
        }
      })
      .catch((error) => {
        props.showToastrMessage({
          severity: "error",
          summary: "Sikertelen művelet",
          detail: "Sikertelen művelet",
        });
        props.setLoadingState(false);
      });
  };

  const getEvents = () => {
    if (calendarRef == undefined || calendarRef == null) return;
    if (calendarRef.current == undefined || calendarRef.current == null) return;

    // let start = moment(calendarRef.current.getApi().view.activeStart).format(
    //   "LL"
    // );
    // let end = moment(calendarRef.current.getApi().view.activeEnd).format("LL");

    // const url = `${process.env.REACT_APP_API_PATH}/event/` + start + "/" + end;
    let url = `${process.env.REACT_APP_API_PATH}/event`;

    const requestOptions = {
      method: "GET",
      headers: { Authorization: "Bearer " + props.token },
    };

    fetch(url, requestOptions)
      .then(async (response) => {
        const data: EventModel[] = await response.json();
        if (!response.ok) {
          if (response.status == 401) {
          }
          props.showToastrMessage({
            severity: "error",
            summary: "Sikertelen művelet",
            detail: "Sikertelen művelet",
          });
        } else {
        }
        props.setLoadingState(false);
        setEvents(mapToCalendarEvents(data));
      })
      .catch((error) => {});
  };

  const mapToCalendarEvents = (events: EventModel[]) => {
    return events == null || events.length == 0
      ? []
      : events.map((event: any) => ({
          id: event.id,
          title: event.subject,
          start: event.startDate,
          end: event.endDate,
          className: "",
        }));
  };

  const dateSelected = (e: DateSelectArg): void => {
    if (props.dateSelected) {
      props.dateSelected(e);
    }
  };

  const dateClick = (info: any): void => {
    if (props.dateClick) {
      props.dateClick(info);
    }
  };

  const dayRenderer = (date: any) => {
    let currentDay: YearConfigModel[] | undefined = yearData.filter((y) =>
      moment(y.date).isSame(moment(date.date), "day")
    );
    if (currentDay.length > 0 && currentDay[0].type === DayTypeEnum.Weekend) {
      return ["weekend-day"];
    } else if (
      currentDay.length > 0 &&
      currentDay[0].type === DayTypeEnum.Freeday
    ) {
      return ["freeday-day"];
    } else {
      return ["workday-day"];
    }
  };

  useImperativeHandle(ref, () => ({
    changeDayType(dayConfig: YearConfigModel) {
      const currentDay = yearData.filter((y) =>
        moment(y.date).isSame(moment(dayConfig.date), "day")
      );
      if (currentDay.length > 0) {
        currentDay[0].type = dayConfig.type;
        setYearData(yearData);
      }
    },
  }));

  return (
    <div>
      {loaded ? (
        <FullCalendar
          selectable={props.selectable ? props.selectable : true}
          ref={calendarRef}
          locale={"hu"}
          headerToolbar={{
            right: "prev,next",
            center: "title",
            left: "",
          }}
          plugins={[interactionPlugin, dayGridPlugin]}
          initialView="dayGridMonth"
          select={dateSelected}
          dateClick={dateClick}
          selectOverlap={false}
          unselectAuto={false}
          selectMirror={true}
          dayCellClassNames={dayRenderer}
          firstDay={1}
          events={events}
        />
      ) : (
        <></>
      )}
    </div>
  );
});

function mapStateToProps(state: any) {
  const token = state.appcontext.token;
  return {
    token,
  };
}

export default memo(connect(mapStateToProps, UserStore.actionCreators, null, {
  forwardRef: true,
})(CalendarBase));
