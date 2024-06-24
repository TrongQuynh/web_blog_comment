/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { CanActivate, ExecutionContext, HttpStatus, Injectable } from "@nestjs/common";
import { Request } from "express";
import { GrpcService } from "src/versions/v1/gRpc/grpc.service";
import { ExceptionResponse } from "web-blog-shared-resource";


@Injectable()
export class AuthGuard implements CanActivate{

    constructor(private readonly grpcService: GrpcService){}
    
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request:Request = context.switchToHttp().getRequest();
        const token = request.headers["authorization"];
        const tokenInfo: any = true;//await this.grpcService.isTokenValid(token);
        console.log("[GUARD]", tokenInfo);
        
        request.headers["user_id"] = '3';//tokenInfo.user_id + '';
        if(tokenInfo === null) throw new ExceptionResponse(HttpStatus.UNAUTHORIZED, "Token invalid", null);
        return true;
    }
}