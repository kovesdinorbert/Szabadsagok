import { Guid } from "guid-typescript";
import { RoleEnum } from "../../../enums/RoleEnum";
import { HolidayForYearModel } from "./HolidayForYearModel";

export class UserListModel {
    id?: string;
    name: Date | null = null;
    email: Date | null = null;
    holidayForYear?: HolidayForYearModel[];
    roles?: RoleEnum[];
}