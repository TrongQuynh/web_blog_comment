import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { PostEntity, ReactionEntity, CategoryEntity, CommentEntity,HashtagEntity,MediaEntity,UserEntity,ViewsEntiy, UserPostReactionEntity, UserCommentReactionEntity } from "web-blog-shared-resource";

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory{

    constructor(private configService: ConfigService){}

    createTypeOrmOptions(connectionName?: string): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
        return {
            type: "mysql",
            host: this.configService.get('DATABASE_HOST'),
            port: this.configService.get('DATABASE_PORT'),
            username: this.configService.get('DATABASE_USERNAME'),
            password: this.configService.get('DATABASE_PWD'),
            database: this.configService.get('DATABASE'),
            entities: [
                // "dist/**/*.entity{.ts,.js}"
                PostEntity, CategoryEntity, UserEntity,CommentEntity, HashtagEntity, 
                MediaEntity, ViewsEntiy, ReactionEntity, UserPostReactionEntity, UserCommentReactionEntity
            ],
            // synchronize: true,
            logging: false,
            autoLoadEntities: true,
            maxQueryExecutionTime: 1000
        }
    }


}