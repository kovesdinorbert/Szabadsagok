import { EventModel } from './EventModel';
import { YearConfigModel } from './YearConfigModel';


export interface ICalendarBase {
  changeDayType(dayConfig: YearConfigModel): void;
  addNewEvent(event: EventModel): void;
}
