export class Presupuesto {
    id:number;
    doctor_id:number;
    patient_id:number;
    speciality_id:number;
    doctor: Doctor;
    patient: Patient;
    speciality: Speciality;
    user_id:number;
    amount:number;
    status:number;
    confimation:string;
    description:string;
    diagnostico:string;
    date_presupuesto:string;
    date_presupuesto_format:string;
    medical:object;
    presupuestoitems: PresupuestoItems[]; // Added property for presupuesto items

    
}
export class PresupuestoItems {
    id:number;
    item:string;
    cantidad:number;
    precio:number;

    
}
export class Doctor {
    id:number;
    full_name:string;
    speciality_id:number;
    speciality: Speciality;

    
}
export class Speciality {
    id:number;
        name:string;
        price:number;

    
}
export class Patient {
    id:number;
        patient_id:number;
        n_doc:number;
        full_name:string;
        name:string;
        surname:string;
        email:string;
        antecedent_alerg:string;

    
}
