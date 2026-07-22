import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Reset-and-reseed strategy (add-english-locale): the only case-study rows are
  // the three seeded studies (source of truth: lib/payload/seed-case-studies.ts),
  // so empty them first. This lets the NOT NULL `_locale` columns add on empty
  // tables and the localized column drops lose nothing. Re-seed PL + EN AFTER the
  // deploy with `bun run payload:seed:case-studies --prod`. Media rows are
  // preserved (they're referenced by, not cascaded from, case-studies).
  await db.execute(sql`
   TRUNCATE TABLE "case_studies", "_case_studies_v" CASCADE;
  CREATE TYPE "public"."_locales" AS ENUM('pl', 'en');
  CREATE TYPE "public"."enum__posts_v_published_locale" AS ENUM('pl', 'en');
  CREATE TYPE "public"."enum__case_studies_v_published_locale" AS ENUM('pl', 'en');
  CREATE TABLE "case_studies_locales" (
  	"title" varchar,
  	"client_about" jsonb,
  	"period" varchar,
  	"excerpt" varchar,
  	"challenge" jsonb,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_case_studies_v_locales" (
  	"version_title" varchar,
  	"version_client_about" jsonb,
  	"version_period" varchar,
  	"version_excerpt" varchar,
  	"version_challenge" jsonb,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  DROP INDEX "case_studies_rels_media_id_idx";
  DROP INDEX "_case_studies_v_rels_media_id_idx";
  ALTER TABLE "_posts_v" ADD COLUMN "snapshot" boolean;
  ALTER TABLE "_posts_v" ADD COLUMN "published_locale" "enum__posts_v_published_locale";
  ALTER TABLE "case_studies_approach" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "case_studies_results" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "case_studies_texts" ADD COLUMN "locale" "_locales";
  ALTER TABLE "case_studies_rels" ADD COLUMN "locale" "_locales";
  ALTER TABLE "_case_studies_v_version_approach" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_case_studies_v_version_results" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_case_studies_v" ADD COLUMN "snapshot" boolean;
  ALTER TABLE "_case_studies_v" ADD COLUMN "published_locale" "enum__case_studies_v_published_locale";
  ALTER TABLE "_case_studies_v_texts" ADD COLUMN "locale" "_locales";
  ALTER TABLE "_case_studies_v_rels" ADD COLUMN "locale" "_locales";
  ALTER TABLE "case_studies_locales" ADD CONSTRAINT "case_studies_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v_locales" ADD CONSTRAINT "_case_studies_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "case_studies_locales_locale_parent_id_unique" ON "case_studies_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_case_studies_v_locales_locale_parent_id_unique" ON "_case_studies_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_posts_v_snapshot_idx" ON "_posts_v" USING btree ("snapshot");
  CREATE INDEX "_posts_v_published_locale_idx" ON "_posts_v" USING btree ("published_locale");
  CREATE INDEX "case_studies_approach_locale_idx" ON "case_studies_approach" USING btree ("_locale");
  CREATE INDEX "case_studies_results_locale_idx" ON "case_studies_results" USING btree ("_locale");
  CREATE INDEX "case_studies_texts_locale_parent" ON "case_studies_texts" USING btree ("locale","parent_id");
  CREATE INDEX "case_studies_rels_locale_idx" ON "case_studies_rels" USING btree ("locale");
  CREATE INDEX "_case_studies_v_version_approach_locale_idx" ON "_case_studies_v_version_approach" USING btree ("_locale");
  CREATE INDEX "_case_studies_v_version_results_locale_idx" ON "_case_studies_v_version_results" USING btree ("_locale");
  CREATE INDEX "_case_studies_v_snapshot_idx" ON "_case_studies_v" USING btree ("snapshot");
  CREATE INDEX "_case_studies_v_published_locale_idx" ON "_case_studies_v" USING btree ("published_locale");
  CREATE INDEX "_case_studies_v_texts_locale_parent" ON "_case_studies_v_texts" USING btree ("locale","parent_id");
  CREATE INDEX "_case_studies_v_rels_locale_idx" ON "_case_studies_v_rels" USING btree ("locale");
  CREATE INDEX "case_studies_rels_media_id_idx" ON "case_studies_rels" USING btree ("media_id","locale");
  CREATE INDEX "_case_studies_v_rels_media_id_idx" ON "_case_studies_v_rels" USING btree ("media_id","locale");
  ALTER TABLE "case_studies" DROP COLUMN "title";
  ALTER TABLE "case_studies" DROP COLUMN "client_about";
  ALTER TABLE "case_studies" DROP COLUMN "period";
  ALTER TABLE "case_studies" DROP COLUMN "excerpt";
  ALTER TABLE "case_studies" DROP COLUMN "challenge";
  ALTER TABLE "case_studies" DROP COLUMN "seo_meta_title";
  ALTER TABLE "case_studies" DROP COLUMN "seo_meta_description";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_title";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_client_about";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_period";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_excerpt";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_challenge";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_seo_meta_title";
  ALTER TABLE "_case_studies_v" DROP COLUMN "version_seo_meta_description";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "case_studies_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_case_studies_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "case_studies_locales" CASCADE;
  DROP TABLE "_case_studies_v_locales" CASCADE;
  DROP INDEX "_posts_v_snapshot_idx";
  DROP INDEX "_posts_v_published_locale_idx";
  DROP INDEX "case_studies_approach_locale_idx";
  DROP INDEX "case_studies_results_locale_idx";
  DROP INDEX "case_studies_texts_locale_parent";
  DROP INDEX "case_studies_rels_locale_idx";
  DROP INDEX "_case_studies_v_version_approach_locale_idx";
  DROP INDEX "_case_studies_v_version_results_locale_idx";
  DROP INDEX "_case_studies_v_snapshot_idx";
  DROP INDEX "_case_studies_v_published_locale_idx";
  DROP INDEX "_case_studies_v_texts_locale_parent";
  DROP INDEX "_case_studies_v_rels_locale_idx";
  DROP INDEX "case_studies_rels_media_id_idx";
  DROP INDEX "_case_studies_v_rels_media_id_idx";
  ALTER TABLE "case_studies" ADD COLUMN "title" varchar;
  ALTER TABLE "case_studies" ADD COLUMN "client_about" jsonb;
  ALTER TABLE "case_studies" ADD COLUMN "period" varchar;
  ALTER TABLE "case_studies" ADD COLUMN "excerpt" varchar;
  ALTER TABLE "case_studies" ADD COLUMN "challenge" jsonb;
  ALTER TABLE "case_studies" ADD COLUMN "seo_meta_title" varchar;
  ALTER TABLE "case_studies" ADD COLUMN "seo_meta_description" varchar;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_title" varchar;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_client_about" jsonb;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_period" varchar;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_excerpt" varchar;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_challenge" jsonb;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_seo_meta_title" varchar;
  ALTER TABLE "_case_studies_v" ADD COLUMN "version_seo_meta_description" varchar;
  CREATE INDEX "case_studies_rels_media_id_idx" ON "case_studies_rels" USING btree ("media_id");
  CREATE INDEX "_case_studies_v_rels_media_id_idx" ON "_case_studies_v_rels" USING btree ("media_id");
  ALTER TABLE "_posts_v" DROP COLUMN "snapshot";
  ALTER TABLE "_posts_v" DROP COLUMN "published_locale";
  ALTER TABLE "case_studies_approach" DROP COLUMN "_locale";
  ALTER TABLE "case_studies_results" DROP COLUMN "_locale";
  ALTER TABLE "case_studies_texts" DROP COLUMN "locale";
  ALTER TABLE "case_studies_rels" DROP COLUMN "locale";
  ALTER TABLE "_case_studies_v_version_approach" DROP COLUMN "_locale";
  ALTER TABLE "_case_studies_v_version_results" DROP COLUMN "_locale";
  ALTER TABLE "_case_studies_v" DROP COLUMN "snapshot";
  ALTER TABLE "_case_studies_v" DROP COLUMN "published_locale";
  ALTER TABLE "_case_studies_v_texts" DROP COLUMN "locale";
  ALTER TABLE "_case_studies_v_rels" DROP COLUMN "locale";
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum__posts_v_published_locale";
  DROP TYPE "public"."enum__case_studies_v_published_locale";`)
}
