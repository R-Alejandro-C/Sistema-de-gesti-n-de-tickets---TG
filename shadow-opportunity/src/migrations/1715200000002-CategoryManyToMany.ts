import { MigrationInterface, QueryRunner } from "typeorm";

export class CategoryManyToMany1715200000002 implements MigrationInterface {
    name = 'CategoryManyToMany1715200000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Crear tabla area_categories
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "area_categories" (
            "id_area_categoria" SERIAL NOT NULL, 
            "id_area" integer NOT NULL, 
            "id_categoria" integer NOT NULL, 
            CONSTRAINT "PK_area_categories" PRIMARY KEY ("id_area_categoria"),
            CONSTRAINT "UQ_area_category_combination" UNIQUE ("id_area", "id_categoria")
        )`);

        // 2. Migrar datos existentes (id_area en categorias) a area_categories
        await queryRunner.query(`
            INSERT INTO "area_categories" ("id_area", "id_categoria")
            SELECT "id_area", "id_categoria" FROM "categorias" WHERE "id_area" IS NOT NULL
            ON CONFLICT ("id_area", "id_categoria") DO NOTHING
        `);

        // 3. Eliminar columna id_area de categorias
        // Primero eliminar la FK si existe
        await queryRunner.query(`ALTER TABLE "categorias" DROP CONSTRAINT IF EXISTS "FK_categoria_area"`);
        await queryRunner.query(`ALTER TABLE "categorias" DROP COLUMN "id_area"`);

        // 4. Añadir Foreign Keys a area_categories
        await queryRunner.query(`ALTER TABLE "area_categories" ADD CONSTRAINT "FK_area_category_area" FOREIGN KEY ("id_area") REFERENCES "areas"("id_area") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "area_categories" ADD CONSTRAINT "FK_area_category_categoria" FOREIGN KEY ("id_categoria") REFERENCES "categorias"("id_categoria") ON DELETE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "area_categories" DROP CONSTRAINT "FK_area_category_categoria"`);
        await queryRunner.query(`ALTER TABLE "area_categories" DROP CONSTRAINT "FK_area_category_area"`);

        await queryRunner.query(`ALTER TABLE "categorias" ADD "id_area" integer`);

        await queryRunner.query(`
            UPDATE "categorias" c
            SET "id_area" = ac."id_area"
            FROM "area_categories" ac
            WHERE c."id_categoria" = ac."id_categoria"
        `);

        await queryRunner.query(`DROP TABLE "area_categories"`);
    }
}
