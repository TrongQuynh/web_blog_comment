import { Observable } from "rxjs"; 

export interface UserService {
    isValidToken(data: {token: string}): Observable<IBaseReponse>;
}

export interface IBaseReponse{
    status: number;
    message: string;
    data: any;
}