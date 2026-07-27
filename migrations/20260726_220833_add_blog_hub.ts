import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "blog_hub" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"featured_id" integer,
  	"popular_id" integer,
  	"video_title" varchar,
  	"video_url" varchar,
  	"video_description" varchar,
  	"video_duration" varchar,
  	"video_poster_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "blog_hub_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"posts_id" integer
  );
  
  ALTER TABLE "blog_hub" ADD CONSTRAINT "blog_hub_featured_id_posts_id_fk" FOREIGN KEY ("featured_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_hub" ADD CONSTRAINT "blog_hub_popular_id_posts_id_fk" FOREIGN KEY ("popular_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_hub" ADD CONSTRAINT "blog_hub_video_poster_id_media_id_fk" FOREIGN KEY ("video_poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_hub_rels" ADD CONSTRAINT "blog_hub_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blog_hub"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "blog_hub_rels" ADD CONSTRAINT "blog_hub_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "blog_hub_featured_idx" ON "blog_hub" USING btree ("featured_id");
  CREATE INDEX "blog_hub_popular_idx" ON "blog_hub" USING btree ("popular_id");
  CREATE INDEX "blog_hub_video_video_poster_idx" ON "blog_hub" USING btree ("video_poster_id");
  CREATE INDEX "blog_hub_rels_order_idx" ON "blog_hub_rels" USING btree ("order");
  CREATE INDEX "blog_hub_rels_parent_idx" ON "blog_hub_rels" USING btree ("parent_id");
  CREATE INDEX "blog_hub_rels_path_idx" ON "blog_hub_rels" USING btree ("path");
  CREATE INDEX "blog_hub_rels_posts_id_idx" ON "blog_hub_rels" USING btree ("posts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "blog_hub" CASCADE;
  DROP TABLE "blog_hub_rels" CASCADE;`)
}
