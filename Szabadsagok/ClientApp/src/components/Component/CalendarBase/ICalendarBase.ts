import { YearConfigModel } from './YearConfigModel';


export interface ICalendarBase {
  changeDayType(dayConfig: YearConfigModel): void;
}
