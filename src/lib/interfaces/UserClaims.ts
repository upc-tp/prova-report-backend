import { singleton } from "tsyringe";

@singleton()
export class UserClaims {
    payload: any;
}