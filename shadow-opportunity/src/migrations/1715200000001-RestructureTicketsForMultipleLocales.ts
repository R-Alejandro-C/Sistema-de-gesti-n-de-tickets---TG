import { MigrationInterface, QueryRunner } from "typeorm";

export class RestructureTicketsForMultipleLocales1715200000001 implements MigrationInterface {
    name = 'RestructureTicketsForMultipleLocales1715200000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Crear tabla local_areas si no existe
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "local_areas" (
            "id_local_area" SERIAL NOT NULL, 
            "id_local" integer NOT NULL, 
            "id_area" integer NOT NULL, 
            CONSTRAINT "PK_local_areas" PRIMARY KEY ("id_local_area"),
            CONSTRAINT "UQ_local_area_combination" UNIQUE ("id_local", "id_area")
        )`);

        // 2. Modificar areas para que nombre sea único globalmente
        await queryRunner.query(`ALTER TABLE "areas" DROP CONSTRAINT IF EXISTS "UQ_area_nombre_local"`);
        await queryRunner.query(`ALTER TABLE "areas" DROP CONSTRAINT IF EXISTS "UQ_area_nombre"`);
        await queryRunner.query(`ALTER TABLE "areas" ADD CONSTRAINT "UQ_area_nombre" UNIQUE ("nombre")`);

        // 3. Migrar datos existentes de areas (id_local) a local_areas
        // Primero insertamos los vínculos actuales
        await queryRunner.query(`
            INSERT INTO "local_areas" ("id_local", "id_area")
            SELECT "id_local", "id_area" FROM "areas" WHERE "id_local" IS NOT NULL
            ON CONFLICT ("id_local", "id_area") DO NOTHING
        `);

        // 4. Modificar tabla tickets para incluir id_local_area
        const hasColumn = await queryRunner.hasColumn("tickets", "id_local_area");
        if (!hasColumn) {
            await queryRunner.query(`ALTER TABLE "tickets" ADD "id_local_area" integer`);
        }

        // 5. Poblar id_local_area en tickets basado en id_local e id_area antiguos
        await queryRunner.query(`
            UPDATE "tickets" t
            SET "id_local_area" = la."id_local_area"
            FROM "local_areas" la
            WHERE t."id_local" = la."id_local" AND t."id_area" = la."id_area"
        `);

        // 6. Hacer id_local_area NOT NULL una vez poblado
        // Solo aplicar si no hay nulos restantes para evitar el error original
        const nullCount = await queryRunner.query(`SELECT COUNT(*) as count FROM "tickets" WHERE "id_local_area" IS NULL`);
        if (nullCount[0].count === '0') {
            await queryRunner.query(`ALTER TABLE "tickets" ALTER COLUMN "id_local_area" SET NOT NULL`);
        } else {
            console.warn(`Advertencia: Se encontraron ${nullCount[0].count} tickets que no pudieron ser asociados a un local_area. La columna id_local_area permanecerá nullable.`);
        }

        // 7. Eliminar columnas antiguas en tickets
        await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "id_local"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "id_area"`);

        // 8. Eliminar columna id_local en areas
        await queryRunner.query(`ALTER TABLE "areas" DROP COLUMN "id_local"`);

        // 9. Añadir Foreign Keys
        await queryRunner.query(`ALTER TABLE "local_areas" ADD CONSTRAINT "FK_local" FOREIGN KEY ("id_local") REFERENCES "locales"("id_local") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "local_areas" ADD CONSTRAINT "FK_area" FOREIGN KEY ("id_area") REFERENCES "areas"("id_area") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_ticket_local_area" FOREIGN KEY ("id_local_area") REFERENCES "local_areas"("id_local_area")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir cambios sería complejo sin los datos originales, pero aquí un esbozo
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_ticket_local_area"`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD "id_local" integer`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD "id_area" integer`);

        await queryRunner.query(`
            UPDATE "tickets" t
            SET "id_local" = la."id_local", "id_area" = la."id_area"
            FROM "local_areas" la
            WHERE t."id_local_area" = la."id_local_area"
        `);

        await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "id_local_area"`);
        await queryRunner.query(`ALTER TABLE "areas" ADD "id_local" integer`);

        // Volver a la restricción única compuesta si es necesario
        await queryRunner.query(`DROP TABLE "local_areas"`);
    }
}
