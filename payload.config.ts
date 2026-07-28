import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { pl } from '@payloadcms/translations/languages/pl'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { env } from '@/lib/env'
import { authors } from '@/lib/payload/collections/authors'
import { caseStudies } from '@/lib/payload/collections/case-studies'
import { categories } from '@/lib/payload/collections/categories'
import { media } from '@/lib/payload/collections/media'
import { posts } from '@/lib/payload/collections/posts'
import { socialPlatforms } from '@/lib/payload/collections/social-platforms'
import { users } from '@/lib/payload/collections/users'
import { requirePayloadEnv } from '@/lib/payload/env'
import { blogHub } from '@/lib/payload/globals/blog-hub'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const { databaseUrl, payloadSecret } = requirePayloadEnv()

export default buildConfig({
  secret: payloadSecret,
  db: postgresAdapter({
    pool: {
      connectionString: databaseUrl,
    },
    // Schema changes land through `payload migrate`, never through push. Push
    // defaults on outside production, and for a localized field it drops the
    // base column and creates the `_locales` table with nothing copied between
    // — dev would silently lose the content prod migrates safely. Dev now
    // agrees with prod, which already runs `payload migrate` (build:vercel).
    push: false,
  }),
  collections: [
    posts,
    caseStudies,
    categories,
    authors,
    socialPlatforms,
    media,
    users,
  ],
  globals: [blogHub],
  editor: lexicalEditor(),
  admin: {
    user: users.slug,
  },
  plugins: [
    // Media storage lives in Vercel Blob. Without the token the app still
    // boots (uploads fall back to local disk in dev) — see .env.example.
    ...(env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: { media: true },
            token: env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
  ],
  // Content localization: Polish is the default; English is the second locale
  // for the case-studies collection (add-english-locale). `fallback: true` means
  // an untranslated EN field renders its Polish value rather than empty.
  localization: {
    locales: ['pl', 'en'],
    defaultLocale: 'pl',
    fallback: true,
  },
  // Polish-only admin UI: the client's editors work in Polish.
  i18n: {
    supportedLanguages: { pl },
    fallbackLanguage: 'pl',
  },
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
