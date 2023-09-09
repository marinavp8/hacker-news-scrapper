import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import { exec } from 'child_process';

async function scrapeHNAndSaveXML() {
    const response = await axios.get("https://news.ycombinator.com/");
    const html = response.data;

    // Use Cheerio to parse the HTML
    const $ = cheerio.load(html);

    // Select all the elements with the class name "athing"
    const articles = $(".athing");

    // Create an array to hold the data
    const dataToSave = [];

    // Loop through the selected elements
    for (const article of articles) {
        const structuredData = {
            url: $(article).find(".titleline a").attr("href"),
            rank: $(article).find(".rank").text().replace(".", ""),
            title: $(article).find(".titleline").text(),
            author: $(article).find("+tr .hnuser").text(),
            points: $(article).find("+tr .score").text().replace(" points", ""),
        };

        // Add the structured data to the array
        dataToSave.push(structuredData);
    }

    // Convert the array to XML format
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<articles>\n';
    dataToSave.forEach(article => {
        xml += '  <article>\n';
        xml += `    <url>${article.url}</url>\n`;
        xml += `    <rank>${article.rank}</rank>\n`;
        xml += `    <title>${article.title}</title>\n`;
        xml += `    <author>${article.author}</author>\n`;
        xml += `    <points>${article.points}</points>\n`;
        xml += '  </article>\n';
    });
    xml += '</articles>';

    // Save the XML data to a file
    fs.writeFileSync("hn_articles.xml", xml);
    
    // Open the file with the default application
    exec('open hn_articles.xml', (error) => {  
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log("Data saved to hn_articles.xml and opened!");
    });
}

scrapeHNAndSaveXML();
