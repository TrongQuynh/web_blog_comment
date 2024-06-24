import { Module } from '@nestjs/common';
import { CommentModule } from './comment/comment.module';
import { GrpcModule } from './gRpc/grpc.module';

@Module({
  imports: [CommentModule]
})
export class V1Module {}
