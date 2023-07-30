import { Test, TestingModule } from "@nestjs/testing";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Report } from "./report.entity";

describe("ReportsController", () => {
  let controller: ReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [ReportsService],
      imports: [TypeOrmModule.forFeature([Report])],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
