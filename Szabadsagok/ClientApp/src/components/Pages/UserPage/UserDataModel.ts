import { Guid } from "guid-typescript";
import { HolidayForYearModel } from "./HolidayForYearModel";

export class UserDataModel {
    id?: string;
    name: string = "";
    email: string = "";
    holidayForYear?: HolidayForYearModel[];
}