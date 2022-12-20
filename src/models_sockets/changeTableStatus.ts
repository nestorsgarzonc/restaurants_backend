import { TableInfoDto } from "./tableInfo";

export class ChangeTableStatusDto extends TableInfoDto{
    status:  string;

    constructor(data: any){
        super(data);
        this.status = data.status;
        if(!this.status)throw new Error('No se informó el estado de la mesa');
    }
}
