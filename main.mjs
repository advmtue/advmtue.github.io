import fs from 'node:fs/promises'
import path from 'node:path'
import yaml from 'yaml'
import { marked } from 'marked'

const FRONTMATTER_SPLITTER = '---\n'

const extractFrontMatter = rawContent => {
    return rawContent.split(FRONTMATTER_SPLITTER)[1]
}

const extractBody = rawContent => {
    return rawContent.split(FRONTMATTER_SPLITTER).slice(2).join(FRONTMATTER_SPLITTER)
}

const filenames = await fs.readdir('content')

for (const filename of filenames) {
    const rawContent = await fs.readFile(path.join('content', filename), 'utf-8')
    const rawFrontMatter = extractFrontMatter(rawContent)
    const rawBody = extractBody(rawContent)
    const frontMatter = yaml.parse(rawFrontMatter)
    const contentHTML = marked.parse(rawBody)
}
