import { Controller, Get } from "@nestjs/common";

import { AppointmentsService } from "./appointments.service";

@Controller("appointments")
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get("services")
  listServices() {
    return this.appointmentsService.listPublicServices();
  }
}
