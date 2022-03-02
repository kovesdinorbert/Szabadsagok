import { StatusEnum } from "../../../enums/StatusEnum";

export class HolidayRequestListModel {
    start: Date | null = null;
    end: Date | null = null;
    reason: string = "";
    status: StatusEnum = StatusEnum.Requested;
}