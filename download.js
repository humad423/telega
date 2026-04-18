const fs = require('fs');
const https = require('https');
const path = require('path');

const dir = path.join(__dirname, 'stitch_exports');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const files = {
  "channel_detail.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzc0YzQ0MDBiNDlhMDQ0YzM4ODlmNjRjNDhiNGVmY2VmEgsSBxCf_trTnwkYAZIBIwoKcHJvamVjdF9pZBIVQhM2MzY2Njg4ODI0NDgxNDkyNzIz&filename=&opi=89354086",
  "home.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzI3ZDA0NGYxYzA3YjRkY2M5YTNlNjg3ZDIxMWNjNGEwEgsSBxCf_trTnwkYAZIBIwoKcHJvamVjdF9pZBIVQhM2MzY2Njg4ODI0NDgxNDkyNzIz&filename=&opi=89354086",
  "search.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzk5NzE4ZTNkZjRiNzRmYmRhOTA1ZWNjMWUzN2NhNTIwEgsSBxCf_trTnwkYAZIBIwoKcHJvamVjdF9pZBIVQhM2MzY2Njg4ODI0NDgxNDkyNzIz&filename=&opi=89354086",
  "admin.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzA0NDM5NzY5MWUxODQ5YzFhMTBiNTQwNTk5ODFkYmU2EgsSBxCf_trTnwkYAZIBIwoKcHJvamVjdF9pZBIVQhM2MzY2Njg4ODI0NDgxNDkyNzIz&filename=&opi=89354086",
  "dashboard.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAxYjUwNDMzNWI2NTQ1OTZhMjNiZTQ3ZDIwNGQyODRjEgsSBxCf_trTnwkYAZIBIwoKcHJvamVjdF9pZBIVQhM2MzY2Njg4ODI0NDgxNDkyNzIz&filename=&opi=89354086",
  "blog.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzUyMDJhMGZiN2M1MDRiOWI5YmM0NzdmZTZjMTU5NWUwEgsSBxCf_trTnwkYAZIBIwoKcHJvamVjdF9pZBIVQhM2MzY2Njg4ODI0NDgxNDkyNzIz&filename=&opi=89354086"
};

async function download(url, filename) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filename);
        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
      } else {
        reject(`Failed: ${response.statusCode}`);
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  for (const [name, url] of Object.entries(files)) {
    console.log(`Downloading ${name}...`);
    try {
      await download(url, path.join(dir, name));
      console.log(`Done ${name}`);
    } catch (e) {
      console.error(e);
    }
  }
}

main();
