import fs from 'fs'
import path from 'path'

const CANDIDATES = {
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  ],
  linux: [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
  ],
  win32: [
    path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Google/Chrome/Application/chrome.exe'),
    path.join(
      process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)',
      'Google/Chrome/Application/chrome.exe',
    ),
    path.join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe'),
  ],
}

function exists(filePath) {
  try {
    return Boolean(filePath && fs.existsSync(filePath))
  } catch {
    return false
  }
}

/** Resolve Chrome/Chromium for Puppeteer (whatsapp-web.js). */
export function resolveChromeExecutable(explicitPath) {
  const fromEnv = explicitPath?.trim()
  if (fromEnv && exists(fromEnv)) return fromEnv

  const platform = process.platform
  const list = CANDIDATES[platform] || []
  for (const p of list) {
    if (exists(p)) return p
  }

  return null
}
