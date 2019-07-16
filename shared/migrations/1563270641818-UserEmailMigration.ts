import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserEmailMigration1563270641818 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "email" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "email"`);
  }
}
