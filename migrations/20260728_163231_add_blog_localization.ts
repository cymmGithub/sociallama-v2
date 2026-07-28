import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Localize `posts`, `categories`, `authors` and the `blog-hub` global
 * (change `add-english-blog`, task 2.3).
 *
 * HAND-SPLICED. `payload migrate:create` emitted the `CREATE TABLE`s and the
 * 21 `DROP COLUMN`s with **nothing between them** — applied as generated it
 * would delete 79 posts' title/excerpt/content, 293 version rows, all four
 * category titles and slugs, the author's role and bio, and the blog-hub
 * spotlight. The `INSERT … SELECT … 'pl'` blocks below are the additions;
 * everything else is generated output in its generated order.
 *
 * Three things worth knowing before editing this file:
 *
 *   - The backfills must sit after every `CREATE TABLE` and after
 *     `blog_hub_rels ADD COLUMN "locale"`, and before the first `DROP COLUMN`.
 *     They are deliberately placed after the unique indexes so the insert
 *     *proves* per-locale slug uniqueness instead of assuming it.
 *   - `_locales` already exists (case-studies localization created it) and is
 *     not recreated. Same for `_posts_v.snapshot` / `published_locale`.
 *   - `down` is a real inverse, not a stub. It was also rewritten: as
 *     generated it dropped the `_locales` tables *before* re-adding the base
 *     columns, so there was nothing left to copy back — and its
 *     `ADD COLUMN "title" varchar NOT NULL` on a populated `categories`
 *     would have failed outright. Columns now come back nullable, get their
 *     `pl` values copied in, and only then take their NOT NULL constraint.
 */

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "posts_locales" (
  	"title" varchar,
  	"slug" varchar,
  	"excerpt" varchar,
  	"content" jsonb,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  CREATE TABLE "_posts_v_locales" (
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_excerpt" varchar,
  	"version_content" jsonb,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  CREATE TABLE "categories_locales" (
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  CREATE TABLE "authors_locales" (
  	"role" varchar,
  	"bio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  CREATE TABLE "blog_hub_locales" (
  	"featured_id" integer,
  	"popular_id" integer,
  	"video_title" varchar,
  	"video_description" varchar,
  	"video_duration" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );

  ALTER TABLE "blog_hub" DROP CONSTRAINT "blog_hub_featured_id_posts_id_fk";

  ALTER TABLE "blog_hub" DROP CONSTRAINT "blog_hub_popular_id_posts_id_fk";

  DROP INDEX "posts_slug_idx";
  DROP INDEX "_posts_v_version_version_slug_idx";
  DROP INDEX "categories_slug_idx";
  DROP INDEX "blog_hub_featured_idx";
  DROP INDEX "blog_hub_popular_idx";
  DROP INDEX "blog_hub_rels_posts_id_idx";
  ALTER TABLE "blog_hub_rels" ADD COLUMN "locale" "_locales";
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "authors_locales" ADD CONSTRAINT "authors_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_hub_locales" ADD CONSTRAINT "blog_hub_locales_featured_id_posts_id_fk" FOREIGN KEY ("featured_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_hub_locales" ADD CONSTRAINT "blog_hub_locales_popular_id_posts_id_fk" FOREIGN KEY ("popular_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_hub_locales" ADD CONSTRAINT "blog_hub_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."blog_hub"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "posts_locales_locale_parent_id_unique" ON "posts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_posts_v_locales_locale_parent_id_unique" ON "_posts_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "authors_locales_locale_parent_id_unique" ON "authors_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "blog_hub_featured_idx" ON "blog_hub_locales" USING btree ("featured_id","_locale");
  CREATE INDEX "blog_hub_popular_idx" ON "blog_hub_locales" USING btree ("popular_id","_locale");
  CREATE UNIQUE INDEX "blog_hub_locales_locale_parent_id_unique" ON "blog_hub_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "blog_hub_rels_locale_idx" ON "blog_hub_rels" USING btree ("locale");
  CREATE INDEX "blog_hub_rels_posts_id_idx" ON "blog_hub_rels" USING btree ("posts_id","locale");

  -- ——————————————————————————————————————————————————————————————————————
  -- HAND-ADDED BACKFILL. Every DROP COLUMN below is preceded by the insert
  -- that carries its data into the 'pl' locale row. Nothing here is
  -- generated; nothing generated was removed.
  -- ——————————————————————————————————————————————————————————————————————

  INSERT INTO "posts_locales" ("title","slug","excerpt","content","seo_meta_title","seo_meta_description","_locale","_parent_id")
  SELECT "title","slug","excerpt","content","seo_meta_title","seo_meta_description",'pl'::"_locales","id" FROM "posts";

  INSERT INTO "_posts_v_locales" ("version_title","version_slug","version_excerpt","version_content","version_seo_meta_title","version_seo_meta_description","_locale","_parent_id")
  SELECT "version_title","version_slug","version_excerpt","version_content","version_seo_meta_title","version_seo_meta_description",'pl'::"_locales","id" FROM "_posts_v";

  INSERT INTO "categories_locales" ("title","slug","_locale","_parent_id")
  SELECT "title","slug",'pl'::"_locales","id" FROM "categories";

  INSERT INTO "authors_locales" ("role","bio","_locale","_parent_id")
  SELECT "role","bio",'pl'::"_locales","id" FROM "authors";

  INSERT INTO "blog_hub_locales" ("featured_id","popular_id","video_title","video_description","video_duration","_locale","_parent_id")
  SELECT "featured_id","popular_id","video_title","video_description","video_duration",'pl'::"_locales","id" FROM "blog_hub";

  -- Localizing a hasMany relationship adds a locale column to the join table
  -- and leaves every existing row NULL — a pick that belongs to no locale is
  -- invisible in both. Prod's picks are empty today, so this matches zero
  -- rows there; it is here for the environments where they are not.
  UPDATE "blog_hub_rels" SET "locale" = 'pl'::"_locales" WHERE "locale" IS NULL;

  -- ————————————————————— end hand-added backfill —————————————————————————

  ALTER TABLE "posts" DROP COLUMN "title";
  ALTER TABLE "posts" DROP COLUMN "slug";
  ALTER TABLE "posts" DROP COLUMN "excerpt";
  ALTER TABLE "posts" DROP COLUMN "content";
  ALTER TABLE "posts" DROP COLUMN "seo_meta_title";
  ALTER TABLE "posts" DROP COLUMN "seo_meta_description";
  ALTER TABLE "_posts_v" DROP COLUMN "version_title";
  ALTER TABLE "_posts_v" DROP COLUMN "version_slug";
  ALTER TABLE "_posts_v" DROP COLUMN "version_excerpt";
  ALTER TABLE "_posts_v" DROP COLUMN "version_content";
  ALTER TABLE "_posts_v" DROP COLUMN "version_seo_meta_title";
  ALTER TABLE "_posts_v" DROP COLUMN "version_seo_meta_description";
  ALTER TABLE "categories" DROP COLUMN "title";
  ALTER TABLE "categories" DROP COLUMN "slug";
  ALTER TABLE "authors" DROP COLUMN "role";
  ALTER TABLE "authors" DROP COLUMN "bio";
  ALTER TABLE "blog_hub" DROP COLUMN "featured_id";
  ALTER TABLE "blog_hub" DROP COLUMN "popular_id";
  ALTER TABLE "blog_hub" DROP COLUMN "video_title";
  ALTER TABLE "blog_hub" DROP COLUMN "video_description";
  ALTER TABLE "blog_hub" DROP COLUMN "video_duration";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ADD COLUMN "title" varchar;
  ALTER TABLE "posts" ADD COLUMN "slug" varchar;
  ALTER TABLE "posts" ADD COLUMN "excerpt" varchar;
  ALTER TABLE "posts" ADD COLUMN "content" jsonb;
  ALTER TABLE "posts" ADD COLUMN "seo_meta_title" varchar;
  ALTER TABLE "posts" ADD COLUMN "seo_meta_description" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_title" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_slug" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_excerpt" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_content" jsonb;
  ALTER TABLE "_posts_v" ADD COLUMN "version_seo_meta_title" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_seo_meta_description" varchar;
  ALTER TABLE "categories" ADD COLUMN "title" varchar;
  ALTER TABLE "categories" ADD COLUMN "slug" varchar;
  ALTER TABLE "authors" ADD COLUMN "role" varchar;
  ALTER TABLE "authors" ADD COLUMN "bio" varchar;
  ALTER TABLE "blog_hub" ADD COLUMN "featured_id" integer;
  ALTER TABLE "blog_hub" ADD COLUMN "popular_id" integer;
  ALTER TABLE "blog_hub" ADD COLUMN "video_title" varchar;
  ALTER TABLE "blog_hub" ADD COLUMN "video_description" varchar;
  ALTER TABLE "blog_hub" ADD COLUMN "video_duration" varchar;

  -- ——————————————————————————————————————————————————————————————————————
  -- HAND-ADDED: copy the 'pl' locale back onto the base tables before the
  -- locale tables are dropped. English is discarded, which is what going
  -- down means. Columns were added nullable above so this can run at all.
  -- ——————————————————————————————————————————————————————————————————————

  UPDATE "posts" p SET
    "title" = l."title",
    "slug" = l."slug",
    "excerpt" = l."excerpt",
    "content" = l."content",
    "seo_meta_title" = l."seo_meta_title",
    "seo_meta_description" = l."seo_meta_description"
  FROM "posts_locales" l
  WHERE l."_parent_id" = p."id" AND l."_locale" = 'pl'::"_locales";

  UPDATE "_posts_v" v SET
    "version_title" = l."version_title",
    "version_slug" = l."version_slug",
    "version_excerpt" = l."version_excerpt",
    "version_content" = l."version_content",
    "version_seo_meta_title" = l."version_seo_meta_title",
    "version_seo_meta_description" = l."version_seo_meta_description"
  FROM "_posts_v_locales" l
  WHERE l."_parent_id" = v."id" AND l."_locale" = 'pl'::"_locales";

  UPDATE "categories" c SET "title" = l."title", "slug" = l."slug"
  FROM "categories_locales" l
  WHERE l."_parent_id" = c."id" AND l."_locale" = 'pl'::"_locales";

  UPDATE "authors" a SET "role" = l."role", "bio" = l."bio"
  FROM "authors_locales" l
  WHERE l."_parent_id" = a."id" AND l."_locale" = 'pl'::"_locales";

  UPDATE "blog_hub" h SET
    "featured_id" = l."featured_id",
    "popular_id" = l."popular_id",
    "video_title" = l."video_title",
    "video_description" = l."video_description",
    "video_duration" = l."video_duration"
  FROM "blog_hub_locales" l
  WHERE l."_parent_id" = h."id" AND l."_locale" = 'pl'::"_locales";

  -- English picks must not survive as Polish ones once the column is gone.
  DELETE FROM "blog_hub_rels" WHERE "locale" IS DISTINCT FROM 'pl'::"_locales";

  -- Restore the constraints the base columns originally carried. This runs
  -- after the copy-back for the same reason the columns were added nullable.
  ALTER TABLE "categories" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "categories" ALTER COLUMN "slug" SET NOT NULL;

  -- ———————————————————— end hand-added copy-back ————————————————————————

  ALTER TABLE "posts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categories_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "authors_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "blog_hub_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "posts_locales" CASCADE;
  DROP TABLE "_posts_v_locales" CASCADE;
  DROP TABLE "categories_locales" CASCADE;
  DROP TABLE "authors_locales" CASCADE;
  DROP TABLE "blog_hub_locales" CASCADE;
  DROP INDEX "blog_hub_rels_locale_idx";
  DROP INDEX "blog_hub_rels_posts_id_idx";
  ALTER TABLE "blog_hub" ADD CONSTRAINT "blog_hub_featured_id_posts_id_fk" FOREIGN KEY ("featured_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_hub" ADD CONSTRAINT "blog_hub_popular_id_posts_id_fk" FOREIGN KEY ("popular_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "blog_hub_featured_idx" ON "blog_hub" USING btree ("featured_id");
  CREATE INDEX "blog_hub_popular_idx" ON "blog_hub" USING btree ("popular_id");
  CREATE INDEX "blog_hub_rels_posts_id_idx" ON "blog_hub_rels" USING btree ("posts_id");
  ALTER TABLE "blog_hub_rels" DROP COLUMN "locale";`)
}
