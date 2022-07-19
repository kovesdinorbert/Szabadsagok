import { DayTypeEnum } from "../../../enums/DayTypeEnum";

export class YearConfigModel {
    date: Date | null = null;
    type: DayTypeEnum = DayTypeEnum.Workday;
}