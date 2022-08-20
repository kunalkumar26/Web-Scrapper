let request = require("request");
let cheerio = require("cheerio");
let fs = require("fs");
let path = require("path");
let singleMatchPlayersObj = require("./scoreCard");

const iplPath = path.join(__dirname,"ipl");
dirCreator(iplPath);

let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";

// TODO finish this

request(url, cb);

function cb(err, response, html){
    if(err){
        console.log(err);
    } else if(response.statusCode == 404){
        console.log("Page not found");
    } else {
        homePage(html);
    }
}

function homePage(html){ 
    let searchTool = cheerio.load(html);
    // the below code is absolutely working fine.
    let allelements = searchTool(".ds-block.ds-text-center");
    let allMatchesele = searchTool(allelements[0]);
    let rellink = allMatchesele.attr("href");
    let fullLink = "https://www.espncricinfo.com"+rellink;
    request(fullLink, allMatchesLink);

    // trial -> this is also working absolutely fine.
    // let element = searchTool(".widget-items.cta-link");
    // let atag = element.find("a");
    // let rellink = atag.attr("href");
    // let fullLink = "https://www.espncricinfo.com"+rellink;
    // console.log(fullLink);
}

function allMatchesLink(err, response, html){
    if(err){
        console.log(err);
    } else if(response.statusCode == 404){
        console.log("Page not found");
    } else {
        getAllMatchesLink(html);
    }
}

function getAllMatchesLink(html){
    let searchTool = cheerio.load(html);
    let allScoreCardEle = searchTool('.ds-flex .ds-flex-wrap .ds-px-4.ds-py-3>a');
    for(let i=0; i<allScoreCardEle.length; i++){
        let rellink = searchTool(allScoreCardEle[i]).attr("href");
        let fullLink = "https://www.espncricinfo.com"+rellink;
        singleMatchPlayersObj.smp(fullLink);
    }
}

function dirCreator(filePath){
    if(fs.existsSync(filePath) == false){
        fs.mkdirSync(filePath);
    }
}