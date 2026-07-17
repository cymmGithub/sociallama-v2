import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { pl } from '@payloadcms/translations/languages/pl'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { requirePayloadEnv } from '@/lib/payload/env'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const { databaseUrl, payloadSecret } = requirePayloadEnv()

export default buildConfig({
  secret: payloadSecret,
  db: postgresAdapter({
    pool: {
      connectionString: databaseUrl,
    },
  }),
  collections: [],
  editor: lexicalEditor(),
  // Polish-only admin: the client's editors work in Polish (site content is
  // Polish-only too; content localization is intentionally not enabled).
  i18n: {
    supportedLanguages: { pl },
    fallbackLanguage: 'pl',
  },
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
