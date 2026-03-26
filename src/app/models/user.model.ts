import { Role } from "./role.model";

export class User {
    id: number;
    name: string;
    email: string;
    password: string;
    n_doc: string;
    surname: string;
    mobile: string;
    birth_date: Date;
    gender: number;
    designation: string;
    address: string;
    avatar: string;
    speciality_id: number;
    pais_id: number;
    precio_cita: number;
    status: string;
    roles:Role;
    permissions:Permissions;
}
export type Permissions = string[];
