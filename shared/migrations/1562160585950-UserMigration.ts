import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserMigration1562160585950 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TYPE "user_roles_enum" AS ENUM('admin', 'operator')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "username" character varying NOT NULL,
            "roles" "user_roles_enum" array NOT NULL,
            "passwordHash" character varying,
            CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
        )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "user_roles_enum"`);
  }
}
