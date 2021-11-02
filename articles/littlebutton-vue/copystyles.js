const fs = require("fs");
let css = fs.readFileSync("../littlebutton-css/css/button.css", "utf8");
const vue = fs.readFileSync("./src/components/Button.vue", "utf8");
// Take everything between the starting and closing style tag and replace
const styleRegex = /<style module>([\s\S]*?)<\/style>/;
let withSynchronizedStyles = vue.replace(styleRegex, `<style module>\n${css}\n</style>`);
fs.writeFileSync("./src/components/Button.vue", withSynchronizedStyles, "utf8");
