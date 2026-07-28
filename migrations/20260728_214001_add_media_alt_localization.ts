import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Localize `media.alt` (change `add-english-blog`, task 2.8).
 *
 * HAND-SPLICED, for the same reason as
 * `20260728_163231_add_blog_localization.ts`: `payload migrate:create` emitted
 * the CREATE TABLE and the DROP COLUMN with nothing between them. Applied as
 * generated it would delete the alt text of all 668 media rows — every image
 * on the site, both locales, unrecoverably.
 *
 * Two things worth knowing before editing this file:
 *
 *   - The backfill sits after the unique index on purpose, so the insert
 *     *proves* one alt per locale per row rather than assuming it, and before
 *     the DROP COLUMN that is the point of no return.
 *   - down is a real inverse. As generated it dropped media_locales first,
 *     leaving nothing to copy back, and then tried
 *     ADD COLUMN "alt" varchar NOT NULL against a populated table, which
 *     fails outright. The column now returns nullable, takes its values back,
 *     and only then takes the constraint. It coalesces pl, then any locale,
 *     then empty string, so a row somehow lacking a Polish alt cannot wedge a
 *     rollback halfway through.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");

  -- ADDED BY HAND. Everything above and below is generated output in its
  -- generated order; without this the next statement is data loss.
  INSERT INTO "media_locales" ("alt", "_locale", "_parent_id")
  SELECT "alt", 'pl'::"_locales", "id" FROM "media";

  ALTER TABLE "media" DROP COLUMN "alt";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "media" ADD COLUMN "alt" varchar;

  UPDATE "media" SET "alt" = COALESCE(
    (SELECT ml."alt" FROM "media_locales" ml
      WHERE ml."_parent_id" = "media"."id" AND ml."_locale" = 'pl'),
    (SELECT ml."alt" FROM "media_locales" ml
      WHERE ml."_parent_id" = "media"."id" LIMIT 1),
    ''
  );

  ALTER TABLE "media" ALTER COLUMN "alt" SET NOT NULL;

  DROP TABLE "media_locales" CASCADE;`)
}
