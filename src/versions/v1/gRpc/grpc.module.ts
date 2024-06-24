import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { join } from "path";

@Module({
    imports: [
        ConfigModule.forRoot({}),
        ClientsModule.register([
            {
                name: process.env.GRPC_AUTH_INJECTION_NAME, //This name is used for dependency injection and doesn't directly affect the client connection.
                transport: Transport.GRPC,
                options: {
                    loader: {
                        keepCase: true
                    },
                    url: process.env.GRPC_AUTH_CONNECTION_URL,
                    package: "user",
                    protoPath: join(__dirname, '../../../../src/versions/v1/gRpc/proto/user.proto')
                },
            },
            {
                name: process.env.GRPC_UPLOAD_INJECTION_NAME,  //This name is used for dependency injection and doesn't directly affect the client connection.
                transport: Transport.GRPC,
                options: {
                  loader: {
                    keepCase: true
                  },
                  url: process.env.GRPC_UPLOAD_CONNECTION_URL,
                  package: "upload", // This property specifies the package name within your .proto file that defines the gRPC service.
                  protoPath: join(__dirname, '../../../../src/versions/v1/gRpc/proto/upload.proto')
                }
              },
        ])
    ],
    exports: [ClientsModule]
})
export class GrpcModule {
    constructor(){
        console.log("[PROTO-PATH][AUTH]: ", join(__dirname, '../../../../src/versions/v1/grpc-auth/proto/user.proto'));
        
    }
}