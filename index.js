const puppeteer = require("puppeteer");
const chalk = require('chalk');
const { gamesList } = require("./gamesList");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await processGamesList(page, gamesList);

  await browser.close();
  console.log(`browser instance killed`);
})();

const processGamesList = async (page, arrayOfGameUrls) => {
  if (arrayOfGameUrls.length === 0) {
    return;
  } else {
    await scrapeGamePrice(page, arrayOfGameUrls[0]);
    arrayOfGameUrls.shift();
    await processGamesList(page, arrayOfGameUrls);
  }
};

async function scrapeGamePrice(page, url) {
  await page.goto(url, { waitUntil: "networkidle2" });
  await page.waitForSelector(".msrp");
  const result = await page.evaluate(() => {
    const gameTitle = document.querySelector(".game-title");
    const retailPrice = document.querySelector(".msrp");
    const salePrice = document.querySelector('.sale-price');
    console.log(`the price of the game is ${retailPrice.textContent}`);
    return [gameTitle.textContent, retailPrice.textContent, salePrice.textContent];
  });

  console.log(`the game ${chalk.yellowBright(result[0])}'s retail price is ${result[1]}`);
  if (result[2].includes('$')) {
    console.log(chalk.bgRed(`it's currelty on sale for ${result[2]}`));
  } else {
    console.log(`unfortunately, it's not currently on sale.`);
  }
}
