import { Guid } from "guid-typescript";
import { RoleEnum } from "../../../enums/RoleEnum";
import { HolidayForYearModel } from "./HolidayForYearModel";

export class UserDataModel {
    id?: string;
    name: string = "";
    email: string = "";
    holidayConfigs?: HolidayForYearModel[];
    roles?: RoleEnum[];
}