import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "case_studies_locales" DROP COLUMN "period";
  ALTER TABLE "_case_studies_v_locales" DROP COLUMN "version_period";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "case_studies_locales" ADD COLUMN "period" varchar;
  ALTER TABLE "_case_studies_v_locales" ADD COLUMN "version_period" varchar;`)
}
