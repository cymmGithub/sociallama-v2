#!/usr/bin/env bun
/**
 * Generate Page Module
 *
 * Generates new pages with pre-configured templates through interactive prompts.
 * Used by the unified generator: `bun run generate`
 *
 * Cross-platform compatible (Windows, macOS, Linux)
 */

import * as p from '@clack/prompts'
import { cancelGuard, withSpinner } from './generate-shared'
import { getIntegrationEntries } from './integration-bundles'
import { createDir } from './utils'

interface PageOptions {
  webgl?: boolean
  shopify?: boolean
  theme?: string
  css?: boolean
}

export interface PageConfig {
  name: string
  options: PageOptions
}

/**
 * Interactive prompts for page configuration
 */
export async function promptPageConfig(): Promise<PageConfig> {
  const name = cancelGuard(
    await p.text({
      message: 'What should the page be called?',
      placeholder: 'about, contact, products',
      validate: (value) => {
        if (!value) return 'Page name is required'
        if (!/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(value)) {
          return 'Page name must start with a letter and contain only letters, numbers, hyphens, and underscores'
        }
        return undefined
      },
    }),
    'Page generation cancelled'
  )

  const theme = cancelGuard(
    await p.select({
      message: 'Choose a theme for the page',
      options: [
        { value: 'dark', label: 'Dark (default)', hint: 'Standard dark theme' },
        { value: 'light', label: 'Light', hint: 'Light theme' },
        { value: 'red', label: 'Red', hint: 'Red accent theme' },
      ],
      initialValue: 'dark',
    }),
    'Page generation cancelled'
  )

  const integrations = cancelGuard(
    await p.multiselect({
      message: 'Which integrations should this page use?',
      options: getIntegrationEntries().map(([key, bundle]) => ({
        value: key,
        label: bundle.name,
        hint: bundle.description,
      })),
      required: false,
    }),
    'Page generation cancelled'
  )

  const includeCss = cancelGuard(
    await p.confirm({
      message: 'Include a CSS module file?',
      initialValue: false,
    }),
    'Page generation cancelled'
  )

  return {
    name,
    options: {
      theme,
      webgl: integrations.includes('webgl'),
      shopify: integrations.includes('shopify'),
      css: includeCss,
    },
  }
}

/**
 * Generate page.tsx content
 */
function generatePageContent(pageName: string, options: PageOptions): string {
  const { webgl, shopify, theme = 'dark' } = options
  const title = pageName.charAt(0).toUpperCase() + pageName.slice(1)

  const imports: string[] = [
    `import type { Metadata } from 'next'`,
    `import { Wrapper } from '@/components/layout/wrapper'`,
  ]
  if (shopify) {
    imports.push(
      `import { isConfigured } from '@/lib/integrations/registry'`,
      `import { NotConfigured } from '@/components/ui/not-configured'`
    )
  }
  if (shopify) {
    imports.push(`import { Cart } from '@/lib/integrations/shopify/cart'`)
  }

  const wrapperProps = [`theme="${theme}"`, ...(webgl ? ['webgl'] : [])].join(
    ' '
  )

  const guard = (integration: 'Shopify', id: string) =>
    `  if (!isConfigured('${id}')) {
    return (
      <Wrapper theme="${theme}">
        <NotConfigured integration="${integration}" />
      </Wrapper>
    )
  }`

  const preludeParts: string[] = []
  if (shopify) preludeParts.push(guard('Shopify', 'shopify'))

  // Section indent shifts when wrapped in <Cart>
  const indent = (depth: number) => '  '.repeat(depth)
  const sectionIndent = shopify ? indent(4) : indent(3)
  const contentIndent = shopify ? indent(5) : indent(4)
  const itemIndent = shopify ? indent(6) : indent(5)

  const sectionJSX = `${sectionIndent}<section className="dr-py-100">
${contentIndent}<div className="container">
${itemIndent}<h1>${title}</h1>
${itemIndent}{/* Your content here */}
${contentIndent}</div>
${sectionIndent}</section>`

  const inner = shopify
    ? `      <Cart>
${sectionJSX}
      </Cart>`
    : sectionJSX

  const returnBlock = `  return (
    <Wrapper ${wrapperProps}>
${inner}
    </Wrapper>
  )`

  const body = [...preludeParts, returnBlock].join('\n\n')

  const metadataExport = `
export const metadata: Metadata = {
  title: '${title}',
  description: '${title} page description',
}`

  const isAsync = false

  return `${imports.join('\n')}
${metadataExport}

export default ${isAsync ? 'async ' : ''}function ${title}Page() {
${body}
}
`
}

/**
 * Create page files and directories
 */
export async function createPage(
  pageName: string,
  options: PageOptions
): Promise<void> {
  const pageDir = `app/${pageName}`
  const componentsDir = `${pageDir}/_components`

  await withSpinner(
    `Creating page structure for "${pageName}"`,
    `Page "${pageName}" generated successfully!`,
    `Failed to generate page "${pageName}"`,
    async () => {
      // Create main page directory (cross-platform)
      await createDir(pageDir)

      // Create _components subdirectory (cross-platform)
      await createDir(componentsDir)

      // Create .gitkeep in _components
      await Bun.write(`${componentsDir}/.gitkeep`, '')

      // Generate and write page.tsx
      const pageContent = generatePageContent(pageName, options)
      await Bun.write(`${pageDir}/page.tsx`, pageContent)

      // Create CSS module if requested
      if (options.css) {
        const cssContent = `/* ${pageName}.module.css */

.container {
  /* Add your styles here */
}
`
        await Bun.write(`${pageDir}/${pageName}.module.css`, cssContent)
      }
    }
  )

  // Show what was created
  p.log.success(`Generated files:`)
  p.log.message(`  ${pageDir}/page.tsx`)
  p.log.message(`  ${componentsDir}/`)
  if (options.css) {
    p.log.message(`  ${pageDir}/${pageName}.module.css`)
  }

  // Build next steps message
  const nextSteps = [`1. Customize ${pageDir}/page.tsx`]

  nextSteps.push(`${nextSteps.length + 1}. Add components to ${componentsDir}/`)
  nextSteps.push(`${nextSteps.length + 1}. Visit /${pageName} to see your page`)

  p.note(`Next steps:\n  ${nextSteps.join('\n  ')}`)
}

// Export functions for use by unified generate script
