const { argv } = require('yargs');
const nodeNotifier = require('node-notifier');
const prompt = require('prompt');
const puppeteer = require('puppeteer');

let browser;
let page;
let { url, text } = argv;
let delay = argv.delay || 5;

async function checkPage() {
  console.log(`Checking URL: ${url}`);
  await page.goto(url);
  const content = await page.content();
  if (content.includes(text)) {
    setTimeout(checkPage, (delay * 1000));
  } else {
    const message = 'Tickets available!';
    console.log('\u0007', message);
    nodeNotifier.notify({
      message,
      sound: true,
    });
  }
}

async function launchBrowser() {
  browser = await puppeteer.launch({
    headless: false,
  });
  const pages = await browser.pages();
  [page] = pages;
  checkPage();
}

(() => {
  if (!url || !text) {
    prompt.start();
    prompt.get([{
      name: 'url',
      description: 'URL to check',
    }, {
      name: 'text',
      description: 'Text on website when no tickets available',
    }, {
      name: 'delay',
      description: 'Delay in seconds',
      default: delay,
    }],
    (error, result) => {
      ({ url, text, delay } = result);
      launchBrowser();
    });
  } else {
    launchBrowser();
  }
})();
