import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4018),
  DATABASE_URL: z.string().min(1, "DATABASE_URL e obrigatorio"),
  API_GLOBAL_PREFIX: z.string().default("apiv2"),
  CORS_ORIGINS: z.string().default(""),
  ADMIN_SESSION_COOKIE: z.string().default("laikao_admin_session"),
  COOKIE_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true")
});

export type AppEnv = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): AppEnv {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(`Configuracao de ambiente invalida: ${issues}`);
  }

  return parsed.data;
}
