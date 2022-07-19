import { HolidayDistanceEnum } from './HolidayDistanceEnum';

export class IncomingHolidayModel {
    start: Date | null = null;
    end: Date | null = null;
    userName: string = "";
    distance: HolidayDistanceEnum = HolidayDistanceEnum.DistantFuture;
}