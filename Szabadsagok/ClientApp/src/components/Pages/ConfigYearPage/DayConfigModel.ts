import { DayTypeEnum } from "../../../enums/DayTypeEnum";

export class DayConfigModel {
    id?: string;
    year: number = 0;
    date: Date | null = null;
    type: DayTypeEnum = DayTypeEnum.Workday;
}