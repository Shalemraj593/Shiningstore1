const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require("fs");

const html = fs.readFileSync("index.html", "utf-8");
const js = fs.readFileSync("app.js", "utf-8");

const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable", url: "http://localhost" });

dom.window.addEventListener("error", (event) => {
  console.error("DOM Error:", event.error);
});
dom.window.IntersectionObserver = class { constructor() {} observe() {} unobserve() {} disconnect() {} };


// Since app.js might wait for DOMContentLoaded
setTimeout(() => {
    try {
        dom.window.eval(js);
        console.log("No global errors evaluating app.js");
        
        // Trigger DOMContentLoaded
        dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
        console.log("DOMContentLoaded dispatched");
        
    } catch(e) {
        console.error("Eval error:", e);
    }
}, 500);

setTimeout(() => process.exit(0), 1000);
