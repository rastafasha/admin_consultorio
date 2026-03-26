export class Patient {
    id: number;
    patien_id: number;
    n_doc: number;
    name: string;
    surname: string;
    phone: number;
    name_companion: string;
    surname_companion: string;
    antecedent_alerg: string;
    email: string;
    birth_date: string;
    gender: number;
    education: string;
    address: string;
    avatar: string;
    antecedent_family: string;
    antecedent_personal: string;
    ta: number;
    temperature: number;
    fc: number;
    fr: number;
    peso: number;
    current_desease: string;
    location_id: number;
    doctor_id: number;
}
export class PatientPerson {
    patient_id: number;
    name_companion: string;
    surname_companion: string;
    mobile_companion: string;
    relationship_companion: string;
    name_responsable: string;
    surname_responsable: string;
    mobile_responsable: string;
    relationship_responsable: string;
}