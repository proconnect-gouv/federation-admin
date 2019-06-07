import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as Joi from 'joi';

export interface EnvConfig {
  [key: string]: string;
}

export class EnvService {
  private readonly envConfig: EnvConfig;

  public constructor(path: string) {
    const config = dotenv.parse(fs.readFileSync(path));
    this.envConfig = this.validateInput(config);
  }

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      NODE_ENV: Joi.string()
        .valid(['development', 'production', 'test', 'provision'])
        .default('development'),
      DB_TYPE: Joi.string(),
      DB_HOST: Joi.string(),
      DB_PORT: Joi.number().default(5432),
      DB_USERNAME: Joi.string(),
      DB_PASSWORD: Joi.string(),
      DB_DATABASE: Joi.string(),
      DB_SYNCHRONIZE: Joi.boolean().default(true),
    });

    const { error, value: validatedEnvConfig } = Joi.validate(
      envConfig,
      envVarsSchema,
    );
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }

  public get NODE_ENV(): string {
    return String(this.envConfig.NODE_ENV);
  }
  public get DB_TYPE(): string {
    return String(this.envConfig.DB_TYPE);
  }
  public get DB_HOST(): string {
    return String(this.envConfig.DB_HOST);
  }
  public get DB_PORT(): number {
    return Number(this.envConfig.DB_PORT);
  }
  public get DB_USERNAME(): string {
    return String(this.envConfig.DB_USERNAME);
  }
  public get DB_PASSWORD(): string {
    return String(this.envConfig.DB_PASSWORD);
  }
  public get DB_DATABASE(): string {
    return String(this.envConfig.DB_DATABASE);
  }
  public get DB_SYNCHRONIZE(): boolean {
    return Boolean(this.envConfig.DB_SYNCHRONIZE);
  }
}
