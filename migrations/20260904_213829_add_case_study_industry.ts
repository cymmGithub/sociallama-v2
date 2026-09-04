import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_case_studies_industry" AS ENUM('automotive', 'elektronika-i-agd', 'beauty', 'health', 'finanse', 'petcare', 'alkohole', 'fashion', 'horeca', 'hotele-i-miejsca-wypoczynkowe', 'nieruchomosci-i-deweloperzy', 'rozrywka', 'retail', 'energetyka', 'zywnosc', 'edukacja-i-hr', 'logistyka', 'rolnictwo', 'b2b-i-uslugi');
  CREATE TYPE "public"."enum__case_studies_v_version_industry" AS ENUM('automotive', 'elektronika-i-agd', 'beauty', 'health', 'finanse', 'petcare', 'alkohole', 'fashion', 'horeca', 'hotele-i-miejsca-wypoczynkowe', 'nieruchomosci-i-deweloperzy', 'rozrywka', 'retail', 'energetyka', 'zywnosc', 'edukacja-i-hr', 'logistyka', 'rolnictwo', 'b2b-i-uslugi');
  ALTER TABLE "case_studies" ADD COLUMN "industry" "enum_case_studies_industry";
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_industry" "enum__case_studies_v_version_industry";
  CREATE INDEX "case_studies_industry_idx" ON "case_studies" USING btree ("industry");
  CREATE INDEX "_case_studies_v_version_version_industry_idx" ON "_case_studies_v" USING btree ("version_industry");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "case_studies_industry_idx";
  DROP INDEX "_case_studies_v_version_version_industry_idx";
  ALTER TABLE "case_studies" DROP COLUMN "industry";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_industry";
  DROP TYPE "public"."enum_case_studies_industry";
  DROP TYPE "public"."enum__case_studies_v_version_industry";`)
}
