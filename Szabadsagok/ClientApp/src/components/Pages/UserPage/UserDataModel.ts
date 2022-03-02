import { Guid } from "guid-typescript";
import { HolidayForYearModel } from "./HolidayForYearModel";

export class UserDataModel {
    id?: Guid;
    name: string = "";
    email: string = "";
    holidayForYear?: HolidayForYearModel[];
}