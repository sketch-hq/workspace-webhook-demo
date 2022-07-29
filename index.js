const client = require("./src/workspace-client.js");
const fetch = require("node-fetch");

const express = require("express");
const app = express();

app.get("/", function (request, response) {
  response.send("Sketch Workspace Webhook Demo");
});

app.post("/", function (request, response) {
  console.log("POST received from Sketch Workspace. Analyzing last update:");
  // We can now download the document from the workspace
  const SKETCH_TOKEN = process.env.SECRET;
  const WORKSPACE_ID_CSM = process.env.WS_ID;
  const DOCUMENT_ID = process.env.DOC_ID;

  client.getDocuments(WORKSPACE_ID_CSM, SKETCH_TOKEN).then((docArray) => {
    //console.log(`${docArray.length} documents in Workspace`)
    const doc = docArray.find((doc) => doc.id == DOCUMENT_ID);
    if (doc._links && doc._links.updates && doc._links.updates.url) {
      fetch(doc._links.updates.url, {
        headers: {
          Authorization: `Basic ${SKETCH_TOKEN}`,
        },
      })
        .then((res) => res.json())
        .then((json) => {
          // This will print the list of updates for this document.
          // console.log(json.data)
          // Most of them will have a 'state' attribute that's set to 'FINISHED',
          // and the last one will have a 'state' attribute that's set to 'PROCESSING'
          // let's go with the last one that's FINISHED:
          const lastUpdate = json.data.pop();
          //const lastUpdate = json.data.reverse().find(update => update.state == 'FINISHED')
          console.log(lastUpdate);

          // Let's ask the Workspace for the exportable assets:
          const exportableAssetsURL = lastUpdate._links.export.url;
          // We'll make a POST request to that URL, and wait for a response from the server (this may take a while)
          console.log(`Sending a POST request to ${exportableAssetsURL}`)
          // fetch(exportableAssetsURL, {
          //   method: "POST",
          //   headers: {
          //     Authorization: `Basic ${SKETCH_TOKEN}`,
          //   },
          // })
          //   .then((res) => res.json())
          //   .then((json) => {
          //     console.log(json);
          //   });
        });
    }
  });
});

const listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
