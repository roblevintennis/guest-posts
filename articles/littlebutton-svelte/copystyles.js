const fs = require("fs");
let css = fs.readFileSync("../littlebutton-css/css/button.css", "utf8");
const svelte = fs.readFileSync("./src/Button.svelte", "utf8");
const styleRegex = /<style>([\s\S]*?)<\/style>/;
let withSynchronizedStyles = svelte.replace(styleRegex, `<style>\n${css}\n</style>`);
fs.writeFileSync("./src/Button.svelte", withSynchronizedStyles, "utf8");
