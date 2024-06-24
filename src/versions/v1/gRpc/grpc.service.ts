import { HttpStatus, Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { UserService } from "./proto-model/auth.model";
import { ClientGrpc } from "@nestjs/microservices";
import { CatchException } from "web-blog-shared-resource";
import { ConfigService } from "@nestjs/config";
import { IGrpcUploadReponse, UploadService } from "./proto-model/upload.model";
import { take } from "rxjs";

@Injectable()
export class GrpcService implements OnModuleInit{
    private userServiceClient: UserService;
    private uploadServiceClient: UploadService;

    constructor(
        private configService: ConfigService,
        @Inject('USER_PACKAGE') private grpcAuthService: ClientGrpc,
        @Inject('UPLOAD_PACKAGE') private grpcUpload: ClientGrpc
    ){}

    onModuleInit(){
        this.userServiceClient = this.grpcAuthService.getService<UserService>("UserService");
        this.uploadServiceClient = this.grpcUpload.getService<UploadService>("UploadService");
    }

    public async isTokenValid(token: string): Promise<number | null>{
        try {
         const response = await this.userServiceClient.isValidToken({token}).toPromise();
         // console.log("[isTokenValid]", response);
         
         const {status, data} = response;
         if(status !== HttpStatus.OK) return null;
         else return data;
         
        } catch (error) {
             console.log("[ERROR][gRPC-Service]isTokenValid", String(error));
             throw new CatchException({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: [String(error)], data: null });
        }
     }

    public async updateTargetIdOrMediaRecord(data: {target_id: number, _medias: number[], isUpdatePostId: boolean }): Promise<IGrpcUploadReponse>{
        try {
            return new Promise<any>((resolve, reject) => {
                this.uploadServiceClient.UpdateUploadRecord(data).pipe(take(1)).subscribe((response)=>{
                    console.log("[GRPC]: ", response); 
                    resolve(response)
                });
            })
            
        } catch (error) {
            console.log("[ERROR][gRPC-Service]updateTargetIdOrMediaRecord", String(error));
            throw new CatchException({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: [String(error)], data: null });
        }
    }

    public async handleDeleteAllMediaOfCommentNotHaveInListMediaId(data: {comment_id: number, _medias: number[]}) {
        try {
            this.uploadServiceClient.DeleteAllMediaOfCommentNotHaveInList(data).pipe(take(1)).subscribe((response)=>{
                console.log("[GRPC]: ", response);
            });
        } catch (error) {
            console.log("[ERROR][gRPC-Service]handleDeleteAllMediaOfCommentNotHaveInListMediaId", String(error));
            throw new CatchException({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: [String(error)], data: null });
        }
    }
}