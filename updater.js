const fs = require("fs");
const https = require("https");
const path = require("path");
const { exec } = require("child_process");

const OWNER = "YannickKriegeskotte";
const REPO = "HeiKo";
const BRANCH = "main";

const ZIP_URL = `https://github.com/${OWNER}/${REPO}/archive/refs/heads/${BRANCH}.zip`;

function download(url, target) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(target);
    https.get(url, res => {
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", reject);
  });
}

async function run() {
  const zipPath = path.join(__dirname, "update.zip");
  const extractDir = path.join(__dirname, "update_tmp");

  console.log("Downloader gestartet...");
  await download(ZIP_URL, zipPath);

  console.log("Entpacke...");
  await new Promise((res, rej) =>
    exec(`powershell -Command "Expand-Archive '${zipPath}' '${extractDir}' -Force"`, err =>
      err ? rej(err) : res()
    )
  );

  const extracted = path.join(extractDir, `${REPO}-${BRANCH}`);

  console.log("Dateien kopieren...");
  await new Promise((res, rej) =>
    exec(`xcopy "${extracted}\\*" "${__dirname}" /E /Y /Q`, err =>
      err ? rej(err) : res()
    )
  );

  fs.unlinkSync(zipPath);
  exec(`rmdir /S /Q "${extractDir}"`);

  console.log("Update abgeschlossen.");
}

run();
