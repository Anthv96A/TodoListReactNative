export class BoolConverter implements IBoolConverter {

    convertToInt(checked: boolean): number {
        return checked ? 1 : 0;
    }   
    
    convertToBool(checked: number): boolean {
        return checked == 1;
    }
}


export interface IBoolConverter {
    convertToInt(checked: boolean) : number;
    convertToBool(checked: number) : boolean;
}