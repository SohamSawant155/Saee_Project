import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright-core'

const targetUrl = process.env.VISUAL_CHECK_URL ?? 'http://127.0.0.1:5173/'
const chromePath =
  process.env.CHROME_PATH ??
  [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ].find((candidate) => fs.existsSync(candidate))

if (!chromePath) {
  throw new Error('Chrome or Edge was not found. Set CHROME_PATH to a Chromium executable.')
}

const outputDir = path.resolve('.visual-check')
fs.mkdirSync(outputDir, { recursive: true })

const browser = await chromium.launch({ executablePath: chromePath, headless: true })

for (const viewport of [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 900 },
]) {
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  })

  await page.goto(targetUrl, { waitUntil: 'networkidle' })
  await page.screenshot({
    path: path.join(outputDir, `${viewport.name}.png`),
    fullPage: false,
  })

  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
  }))

  if (metrics.documentWidth > metrics.innerWidth || metrics.bodyWidth > metrics.innerWidth) {
    throw new Error(`${viewport.name} viewport has horizontal overflow: ${JSON.stringify(metrics)}`)
  }

  console.log(`${viewport.name}: ${JSON.stringify(metrics)}`)
  await page.close()
}

await browser.close()
