import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAreaUniqueConstraint1715200000000 implements MigrationInterface {
    name = 'UpdateAreaUniqueConstraint1715200000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Eliminar la restricción única actual sobre nombre
        await queryRunner.query(`ALTER TABLE "areas" DROP CONSTRAINT IF EXISTS "UQ_area_nombre"`);

        // Crear una nueva restricción única compuesta (nombre, id_local)
        await queryRunner.query(`ALTER TABLE "areas" ADD CONSTRAINT "UQ_area_nombre_local" UNIQUE ("nombre", "id_local")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir los cambios
        await queryRunner.query(`ALTER TABLE "areas" DROP CONSTRAINT IF EXISTS "UQ_area_nombre_local"`);
        await queryRunner.query(`ALTER TABLE "areas" ADD CONSTRAINT "UQ_area_nombre" UNIQUE ("nombre")`);
    }
}
