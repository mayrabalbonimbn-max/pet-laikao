import { Controller, Get } from "@nestjs/common";

import { ReportsService } from "./reports.service";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("status")
  status() {
    return this.reportsService.status();
  }
}
