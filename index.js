const armt = process.argv.slice(2);

var locationSearching = armt[0];

const puppeteer = require("puppeteer");

const fs = require("fs").promises;

(async () => {
  try {

    const fetchData = await puppeteer.launch({ headless: false }); 

    const page = await fetchData.newPage(); 

    await page.setViewport({ width: 1200, height: 900 });

    await page.setDefaultNavigationTimeout(0);

    await page.goto(`https://food.grab.com/v1/autocomplete?component=country:SG&language=en&transportType=0&keyword=${locationSearching}&limit=10`,
      {
        waitwhile: "networkidle2",
      }
    );

    const bodyHTML = await page.evaluate(() => JSON.parse(document.querySelector("body > pre").textContent));

    let numbered = parseInt(Math.random() * 10);
    
    let query = bodyHTML?.places[numbered]?.name;

    console.log(query);

    await page.goto("https://food.grab.com/sg/en/", {
      
      waitwhile: "networkidle2",

    });

    let location = query || "Singapore General Hospital - 1 Hospital Drive, Singapore, 169608";

    await page.type("#location-input", location); 

    await page.click(
     
      "#page-content > div.sectionContainer___3GDBD.searchSectionContainer___3Lhkk.ant-layout > div > button"

    ),
      await page.waitForNavigation({

        waitwhile: "networkidle2",

      });

    let data = new Array();

    page.on("response", async (res1) => {

      try {

        const url = res1.url();

        if (

          url.includes("https://portal.grab.com/foodweb/v2/search" || "https://portal.grab.com/foodweb/v2/category")
        ) {

          const res = await page.waitForResponse(url);

          const res2 = await res.json();

          const res_data = res2.searchResult.searchMerchants;

          res_data.forEach((e) => {

            let obj = {

              name: e.address.name,

              latitude: e.latlng.latitude,

              longitude: e.latlng.longitude,

            };
            
            data.push(obj);

          });

          page.$("#page-content>div:nth-child(4)>div>div>div:nth-child(5)>div>button").then(async (button) => {

                if (button){

                await button.click();

                await page.waitForNavigation({

                  waitwhile: "networkidle2",

                });

                await page.waitFor(5000);

              }
            });

          await fs.writeFile("db.json", JSON.stringify(data));
         
        }
      }catch(err){

        console.log(err);

      }
    });

  }catch(err){

    console.log(err);
    
  }
})();
