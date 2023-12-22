import fs from 'node:fs/promises'
import path from 'node:path'
import yaml from 'yaml'
import { marked } from 'marked'
import pug from 'pug'

const FRONTMATTER_SPLITTER = '---\n'
const CONTENT_DIR = 'content'
const OUTPUT_DIR = 'build'

const compilePage = pug.compileFile(path.join('views', 'template.pug'))
const compileIndex = pug.compileFile(path.join('views', 'index.pug'))

// Delete and recreate the output dir
await fs.rm(OUTPUT_DIR, { force: true, recursive: true })
await fs.mkdir(OUTPUT_DIR)
await fs.mkdir(path.join(OUTPUT_DIR, CONTENT_DIR))

const blogFilenames = await fs.readdir('content')
const pages = []

for (const filename of blogFilenames) {
    const rawContent = await fs.readFile(path.join(CONTENT_DIR, filename), 'utf-8')
    const rawFrontMatter = rawContent.split(FRONTMATTER_SPLITTER)[1]
    const rawBody = rawContent.split(FRONTMATTER_SPLITTER).slice(2).join(FRONTMATTER_SPLITTER)
    const frontMatter = yaml.parse(rawFrontMatter)
    const contentHTML = marked.parse(rawBody)
    const htmlPage = compilePage({ contentHTML, frontMatter })
    const htmlFileName = `${filename.split('.').slice(0, -1).join('.')}.html`
    const contentPath = path.join(CONTENT_DIR, htmlFileName)

    await fs.writeFile(path.join(OUTPUT_DIR, contentPath), htmlPage)

    pages.push({ contentPath, ...frontMatter })
}

const sortedPages = pages.sort((a, b) => a.datetime < b.datetime ? -1 : 1)
const htmlIndex = compileIndex({ sortedPages })
await fs.writeFile(path.join(OUTPUT_DIR, 'index.html'), htmlIndex)

// Copy static assets
await fs.cp('static', 'build', { recursive: true })
