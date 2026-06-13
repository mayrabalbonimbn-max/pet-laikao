import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { validateEnv } from "./config/env.validation";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AppointmentsModule } from "./modules/appointments/appointments.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { FinanceModule } from "./modules/finance/finance.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { PromotionsModule } from "./modules/promotions/promotions.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { UploadsModule } from "./modules/uploads/uploads.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv
    }),
    PrismaModule,
    HealthModule,
    // Implementados nesta etapa
    AuthModule,
    AppointmentsModule,
    // Esqueletos (proximas fases)
    CatalogModule,
    PromotionsModule,
    UploadsModule,
    OrdersModule,
    PaymentsModule,
    InventoryModule,
    FinanceModule,
    ReportsModule,
    NotificationsModule
  ]
})
export class AppModule {}
