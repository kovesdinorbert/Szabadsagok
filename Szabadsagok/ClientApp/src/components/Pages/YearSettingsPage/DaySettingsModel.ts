import { DayTypeEnum } from "../../../enums/DayTypeEnum";

export class DaySettingsModel {
    month: number = 0;
    day: number = 0;
    type: DayTypeEnum = DayTypeEnum.Workday;
}