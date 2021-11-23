import { ValueTransformer } from "typeorm";

export class BoolTinyIntTransformer implements ValueTransformer {
    
    to(value: boolean | null): number | null {
        if (value === null) {
            return null;
        }
        return value? 1 : 0;
    }

    from(value: number) : boolean | null {
        if (value === null) {
            return null;
        }
        return value === 1;
    }

}