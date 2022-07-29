"use strict";

const fetch = require("node-fetch");
const fs = require("fs");
const API_URL = "https://publicapi.prod.sketch.com/api/public/v1/";

async function getDocuments(workspace_id, token) {
  let URL = `${API_URL}/workspaces/${workspace_id}/documents`;
  let allDocuments = [];
  let moreDataAvailable = true;
  while (moreDataAvailable) {
    const response = await fetch(URL, {
      headers: {
        Authorization: `Basic ${token}`,
      },
    });
    console.log(response.status);
    let { data, meta } = await response.json();
    data.forEach((doc) => {
      allDocuments.push(doc);
    });
    if (meta.pagination._links.has_next_page == true) {
      URL = meta.pagination._links.next.url;
    } else {
      moreDataAvailable = false;
    }
  }
  return allDocuments;
}

async function getAllDocumentFiles(workspace_id, token) {
  const allDocuments = await getDocuments(workspace_id, token);
  const allPaths = [];
  allDocuments.forEach((doc) => {
    allPaths.push(getDocumentFile(doc, token));
  });
  return allPaths;
}

async function getAllDocumentFilesSync(workspace_id, token) {
  const allDocuments = await getDocuments(workspace_id, token);
  const allPaths = [];
  allDocuments.forEach((doc) => {
    allPaths.push(getDocumentFileSync(doc, token));
  });
  return allPaths;
}

async function getDocumentFile(doc, token) {
  return new Promise((resolve, reject) => {
    const name = doc.name;
    if (doc._links && doc._links.updates && doc._links.updates.url) {
      fetch(doc._links.updates.url, {
        headers: {
          Authorization: `Basic ${token}`,
        },
      })
        .then((res) => res.json())
        .then((json) => {
          // console.log(`\n\nGot updates data for "${name}"`)
          if (json.data && json.data.length > 0) {
            const lastUpdate = json.data.pop();
            if (
              lastUpdate._links &&
              lastUpdate._links.download &&
              lastUpdate._links.download.url
            ) {
              fetch(lastUpdate._links.download.url, {
                headers: { Authorization: `Basic ${token}` },
              })
                .then((res) => res.json())
                .then((json) => {
                  if (json.data && json.data.url) {
                    fetch(json.data.url)
                      .then(
                        (res) =>
                          new Promise((resolve, reject) => {
                            let path = `./downloads/${name}.sketch`;
                            const dest = fs.createWriteStream(path);
                            res.body.pipe(dest);
                            res.body.on("end", () => {
                              resolve(path);
                            });
                            dest.on("error", reject);
                          })
                      )
                      .catch((err) => {
                        console.log(err);
                        reject(err);
                      });
                  }
                });
            }
          } else {
            console.log(`No updates for "${name}"`);
            resolve(null);
          }
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    } else {
      console.log(`No updates for "${name}"`);
      reject(`No updates for "${name}"`);
    }
  });
}

async function getDocumentFileSync(doc, token) {
  const name = doc.name;
  const path = `./downloads/${name}.sketch`;
  if (doc._links && doc._links.updates && doc._links.updates.url) {
    await fetch(doc._links.updates.url, {
      headers: {
        Authorization: `Basic ${token}`,
      },
    })
      .then((res) => res.json())
      .then((json) => {
        // console.log(`\n\nGot updates data for "${name}"`)
        if (json.data && json.data.length > 0) {
          const lastUpdate = json.data.pop();
          if (
            lastUpdate._links &&
            lastUpdate._links.download &&
            lastUpdate._links.download.url
          ) {
            fetch(lastUpdate._links.download.url, {
              headers: { Authorization: `Basic ${token}` },
            })
              .then((res) => res.json())
              .then((json) => {
                if (json.data && json.data.url) {
                  fetch(json.data.url)
                    .then(
                      (res) =>
                        new Promise((resolve, reject) => {
                          const dest = fs.createWriteStream(path);
                          res.body.pipe(dest);
                          res.body.on("end", () => {
                            resolve(path);
                          });
                          dest.on("error", reject);
                        })
                    )
                    .catch((err) => {
                      console.log(err);
                    });
                }
              });
          }
        } else {
          console.log(`No updates for "${name}"`);
        }
      })
      .catch((err) => {
        console.log(err);
      });
    return path;
  }
}

module.exports = {
  getDocuments,
  getDocumentFile,
  getDocumentFileSync,
  getAllDocumentFiles,
  getAllDocumentFilesSync,
};
