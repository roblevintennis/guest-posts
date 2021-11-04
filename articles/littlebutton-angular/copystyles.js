const fs = require("fs");
let css = fs.readFileSync("../littlebutton-css/css/button.css", "utf8");
fs.writeFileSync("./src/components/button.component.css", css, "utf8");
