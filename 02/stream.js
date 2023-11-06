const fs = require("fs");

const rs = fs.createReadStream("./promiseREname.txt", { encoding: "utf-8" });

const ws = fs.createWriteStream("./promiseREname.txt");

rs.pipe(ws);
