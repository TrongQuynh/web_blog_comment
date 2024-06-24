import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity, UserCommentReactionEntity, PostEntity, UserEntity } from "web-blog-shared-resource";
import { GrpcModule } from '../gRpc/grpc.module';
import { GrpcService } from '../gRpc/grpc.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentEntity, UserCommentReactionEntity, PostEntity, UserEntity]), 
    GrpcModule
  ],
  controllers: [CommentController,],
  providers: [CommentService, GrpcService],
})
export class CommentModule {}
