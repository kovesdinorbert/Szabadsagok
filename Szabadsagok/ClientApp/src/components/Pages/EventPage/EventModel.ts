export class EventModel {
    id?: string;
    subject: string = "";
    description: string = "";
    startDate: Date | null = null;
    endDate: Date | null = null;
}