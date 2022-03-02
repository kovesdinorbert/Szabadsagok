import { Guid } from "guid-typescript";

export class UserListModel {
    id?: Guid;
    name: Date | null = null;
    email: Date | null = null;
}