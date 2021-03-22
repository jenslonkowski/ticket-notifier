const { argv } = require('yargs');
const nodeNotifier = require('node-notifier');
const prompt = require('prompt');
const puppeteer = require('puppeteer');

let browser;
let page;
let { url, text, selector } = argv;
let delay = argv.delay || 5;

async function checkPage() {
  // eslint-disable-next-line no-console
  console.log(`Checking URL: ${url}`);
  await page.goto(url);
  if (selector) await page.waitForSelector(selector);
  const content = await page.content();
  if (content.includes(text)) {
    setTimeout(checkPage, (delay * 1000));
  } else {
    const message = 'Tickets available!';
    // eslint-disable-next-line no-console
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
    }, {
      name: 'selector',
      description: 'Selector on website to wait for before check',
      default: undefined,
    }],
    (error, result) => {
      if (!error) {
        ({
          url, text, delay, selector,
        } = result);
        let commandWithArgs = `npm start -- --url="${url}" --text="${text}" --delay=${delay}`;
        if (selector) commandWithArgs += ` --selector="${selector}"`;
        // eslint-disable-next-line no-console
        console.log(`To run this check without being prompted use:\n${commandWithArgs}`);
        launchBrowser();
      }
    });
  } else {
    launchBrowser();
  }
})();
