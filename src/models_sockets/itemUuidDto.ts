import { TableInfoDto } from "./tableInfo";

export class ItemUuidDto extends TableInfoDto {
    uuid:    string;
    constructor(data: any){
        super(data);
        this.uuid = data.uuid;
        if(!this.uuid)throw new Error('No se recibió en uuid');
    }

}