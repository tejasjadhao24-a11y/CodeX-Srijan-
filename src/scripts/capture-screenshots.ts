import puppeteer from 'puppeteer-core';
import path from 'path';

async function captureAll() {
  const artifactDir = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\f5ef9c66-79c4-4460-8d09-d972f3103083';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  console.log('🚀 Launching Chrome to capture 1440px screenshots including Guardian Mode...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  const routes = [
    { url: 'http://localhost:3000/dashboard', name: 'dashboard_1440px.png' },
    { url: 'http://localhost:3000/send-money', name: 'send_money_1440px.png' },
    { url: 'http://localhost:3000/cases', name: 'cases_1440px.png' },
    { url: 'http://localhost:3000/enterprise', name: 'enterprise_1440px.png' },
    { url: 'http://localhost:3000/guardian', name: 'guardian_1440px.png' },
  ];

  for (const r of routes) {
    console.log(`📸 Capturing ${r.url} at 1440px...`);
    await page.goto(r.url, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const outputPath = path.join(artifactDir, r.name);
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`✅ Saved: ${outputPath}`);
  }

  await browser.close();
  console.log('🎉 All 5 1440px screenshots captured successfully!');
}

captureAll().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
