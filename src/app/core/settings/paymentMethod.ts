export class PaymentMethod {
   id:number;
   sandboxMode:boolean;
   paypalSecret:string;
   bankAccount:string;
   clientId:string;
   ciorif:string;
   telefono:string;
   bankName:string;
   email:string;
   user:string;
   bankAccountType?:'ahorro' | 'corriente'|'cheques' ;
   type?: 'paypal' | 'transferencia'|'pagomovil' ;
   status?: 'ACTIVE' | 'INACTIVE' ;

   updated_at:Date;
   created_at:Date;


}
