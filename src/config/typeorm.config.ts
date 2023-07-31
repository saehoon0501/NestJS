import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    if (process.env.NODE_ENV === "production") {
      return {
        type: "postgres",
        synchronize: false,
        database: this.configService.get<string>("DB_NAME"),
        entities: ["dist/**/*.entity.{ts,js}"],
        migrations: [__dirname + "/migrations/*.ts"],
        migrationsRun: true,
        keepConnectionAlive: false,
        url: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      };
    }
    return {
      type: "sqlite",
      synchronize: true,
      database: this.configService.get<string>("DB_NAME"),
      autoLoadEntities: true,
      migrationsRun: process.env.NODE_ENV === "test" ? true : false,
      keepConnectionAlive: process.env.NODE_ENV === "test" ? true : false,
      entities: ["dist/**/*.entity.{ts,js}"],
      migrations: [__dirname + "/migrations/*.ts"],
    };
  }
}
