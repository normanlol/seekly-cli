#!/usr/bin/env node

const bing = require("bing-scraper");
const chalk = require("chalk");
const open = require("open");
const {Select} = require("enquirer");
const ora = require("ora");
const fs = require("fs");
const args = process.argv;

if (args[0].includes("node")) {
    var q = args.slice(2).join(" ");
} else {
    var q = args.slice(1).join(" ");
}

const spin = ora("Retrieving cookies...").start();

if (!q) {
    spin.stop();
    console.log(`${chalk.redBright("ERR!")} No query was requested.`)
    console.log(`Usage: ${chalk.blueBright("seekly [query]")}`);
    return;
}

bing.getCookies(null, function(err, resp) {
    if (err) {
        var cookie = null;
    } else {
        var cookie = resp;
    }
    spin.text = "Requesting...";
    bing.search({
        q: q,
        pageCount: 3,
        cookieString: cookie
    }, function(err, resp) {
        if (err) {
            spin.stop();
            console.log(err);
            process.exit(1);
        } else {
            spin.stop();
            var obj = [];
            for (var c in resp.results) {
                var s = {
                    message: resp.results[c].title,
                    value: resp.results[c].url
                };
                obj.push(s);
            }
            const p = new Select({
                name: "res",
                message: "Selecting opens the result in your browser.",
                choices: obj
            });
            p.run().then(function(r) {
                open(r);
            }).catch(function(e) {
                console.log(e);
                process.exit(1);
            })
        }
    });
});