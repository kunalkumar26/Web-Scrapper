let request = require("request");
let cheerio = require("cheerio");
let fs = require("fs");
let path = require("path");
let xlsx = require("xlsx");

// let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/delhi-capitals-vs-mumbai-indians-final-1237181/full-scorecard";
// request(url, cb);

function singleMatchPlayers(url){
    request(url, cb);
}
module.exports = {
    smp: singleMatchPlayers,
}

function cb(err, response, html){
    if(err){
        console.log("ERROR HERE-----------------------");
        console.log(err);
    } else if(response.statusCode == 404){
        console.log("Page not found");
    } else {
        extractMatchDetails(html);
    }
}

// ipl folder
//     teams folder
//         player folder
//             runs balls four sixes sr opponent venue date result

function extractMatchDetails(html){
    // venue, date, result
    let searchTool = cheerio.load(html);
    let matchDesc = searchTool(".ds-text-tight-m.ds-font-regular.ds-text-ui-typo-mid");
    let desc = matchDesc.text().split(",");
    let venue = desc[1].trim();
    let date = desc[2].trim();
    let result = searchTool(".ds-text-tight-m.ds-font-regular.ds-truncate > span").text().trim();
    console.log(result);
    let teams = searchTool("span .ds-text-tight-l.ds-font-bold");
    for(let i=0; i<teams.length; i++){
        let teamName = searchTool(teams[i]).text().trim();
        let opponentTeam = searchTool(teams[(i+1)%2]).text().trim();
        let batsmanTables = searchTool(".ReactCollapse--content table.ci-scorecard-table");
        let players = searchTool(batsmanTables[i]).find(".ds-text-tight-s.ds-font-medium");
        let x = searchTool(batsmanTables[i]).find("tbody > tr");
        for(let i=0; i<x.length; i++){
            let playerTool = searchTool(x[i]);
            if(playerTool.find("td").length == 8 ){
                let playerName = playerTool.find(".ds-font-medium").text().split("†")[0].trim();
                let runs = searchTool(playerTool.find("td")[2]).text().trim();
                let balls = searchTool(playerTool.find("td")[3]).text().trim();
                let fours = searchTool(playerTool.find("td")[5]).text().trim();
                let sixes = searchTool(playerTool.find("td")[6]).text().trim();
                let sr = searchTool(playerTool.find("td")[7]).text().trim();
                // console.log(teamName, playerName, runs, balls, fours, sixes, sr, opponentTeam, venue, date);
                processPlayer(teamName, playerName, runs, balls, fours, sixes, sr, opponentTeam, venue, date, result);
            }
        }
        // check if the player played or not in the game.
        // for(let j=0; j<players.length; j++){
        //     let playerName = searchTool(players[j]).text();
        //     console.log(teamName + " " + playerName);
        //     // teamName, playerName, runs, balls, fours, sixes, sr, opponentTeam, venue, date, result;

        // }
        console.log();
    }
    console.log("-------------")
}

function processPlayer(teamName, playerName, runs, balls, fours, sixes, sr, opponentTeam, venue, date, result){
    let teamPath = path.join(__dirname,"ipl",teamName);
    dirCreator(teamPath);
    let filePath = path.join(teamPath, playerName+ ".xlsx");
    let content = excelReader(filePath, playerName);
    let playerObj = {
        teamName, playerName, runs, balls, fours, sixes, sr, opponentTeam, venue, date, result
    }
    content.push(playerObj);
    excelWriter(filePath, content, playerName);
}


function dirCreator(filePath){
    if(fs.existsSync(filePath) == false){
        fs.mkdirSync(filePath);
    }
}

// excelWriter
function excelWriter(filePath, json, sheetName){
    let newWB = xlsx.utils.book_new();
    let newWS = xlsx.utils.json_to_sheet(json);
    xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
    xlsx.writeFile(newWB, filePath);
}

//excelReader
function excelReader(filePath, sheetName){
    if(fs.existsSync(filePath) == false){
        return [];
    }
    let wb = xlsx.readFile(filePath);
    let excelData = wb.Sheets[sheetName];
    let ans = xlsx.utils.sheet_to_json(excelData);
    return ans;
}
