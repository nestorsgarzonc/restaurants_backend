export class TableInfoDto {
    token:   string;
    tableId: string;

    constructor(data: any){
        this.token = data.token;
        this.tableId = data.tableId;
        if(!this.token)throw new Error('Autenticación requerida');
        if(!this.tableId)throw new Error('Se requiere alguna mesa');
    }
}
