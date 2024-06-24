import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmConfigService } from "./type-orm.config.service";
import { DataSource } from "typeorm";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useClass: TypeOrmConfigService
        })
    ],
    providers: []
})
export class DatabaseModule{
    constructor(private dataSource: DataSource){
        console.log(`[DB-CONNECTION]: Connect ${dataSource.isInitialized ? "Success" : "Failed"}`);
    }
}