import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "case_studies" ADD COLUMN "_order" varchar;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version__order" varchar;
  CREATE INDEX "case_studies__order_idx" ON "case_studies" USING btree ("_order");
  CREATE INDEX "_case_studies_v_version_version__order_idx" ON "_case_studies_v" USING btree ("version__order");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "case_studies__order_idx";
  DROP INDEX "_case_studies_v_version_version__order_idx";
  ALTER TABLE "case_studies" DROP COLUMN "_order";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version__order";`)
}
