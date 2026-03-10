import { MigrationInterface, QueryRunner } from "typeorm";

export class SubCategoryManyToMany1715200000003 implements MigrationInterface {
    name = 'SubCategoryManyToMany1715200000003'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Crear tabla category_subcategories
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "category_subcategories" (
            "id_cat_subcat" SERIAL NOT NULL, 
            "id_categoria" integer NOT NULL, 
            "id_subcategoria" integer NOT NULL, 
            CONSTRAINT "PK_category_subcategories" PRIMARY KEY ("id_cat_subcat"),
            CONSTRAINT "UQ_category_subcat_combination" UNIQUE ("id_categoria", "id_subcategoria")
        )`);

        // 2. Migrar datos existentes (id_categoria en subcategorias) a category_subcategories
        await queryRunner.query(`
            INSERT INTO "category_subcategories" ("id_categoria", "id_subcategoria")
            SELECT "id_categoria", "id_subcategoria" FROM "subcategorias" WHERE "id_categoria" IS NOT NULL
            ON CONFLICT ("id_categoria", "id_subcategoria") DO NOTHING
        `);

        // 3. Eliminar columna id_categoria de subcategorias
        // Buscamos si hay un constraint de FK para id_categoria
        const constraints = await queryRunner.query(`
            SELECT constraint_name 
            FROM information_schema.key_column_usage 
            WHERE table_name = 'subcategorias' AND column_name = 'id_categoria'
        `);

        for (const c of constraints) {
            await queryRunner.query(`ALTER TABLE "subcategorias" DROP CONSTRAINT IF EXISTS "${c.constraint_name}"`);
        }

        await queryRunner.query(`ALTER TABLE "subcategorias" DROP COLUMN IF EXISTS "id_categoria"`);

        // 4. Añadir Foreign Keys a category_subcategories
        await queryRunner.query(`ALTER TABLE "category_subcategories" ADD CONSTRAINT "FK_cat_subcat_category" FOREIGN KEY ("id_categoria") REFERENCES "categorias"("id_categoria") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "category_subcategories" ADD CONSTRAINT "FK_cat_subcat_subcategory" FOREIGN KEY ("id_subcategoria") REFERENCES "subcategorias"("id_subcategoria") ON DELETE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category_subcategories" DROP CONSTRAINT "FK_cat_subcat_subcategory"`);
        await queryRunner.query(`ALTER TABLE "category_subcategories" DROP CONSTRAINT "FK_cat_subcat_category"`);

        await queryRunner.query(`ALTER TABLE "subcategorias" ADD "id_categoria" integer`);

        await queryRunner.query(`
            UPDATE "subcategorias" s
            SET "id_categoria" = cs."id_categoria"
            FROM "category_subcategories" cs
            WHERE s."id_subcategoria" = cs."id_subcategoria"
        `);

        await queryRunner.query(`DROP TABLE "category_subcategories"`);
    }
}
