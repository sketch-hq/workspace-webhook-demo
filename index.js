const client = require("./src/workspace-client.js");
const fetch = require("node-fetch");

const express = require("express");
const app = express();
app.use(express.json());

app.get("/", function (request, response) {
  response.send("Sketch Workspace Webhook Demo");
});

app.post("/", function (request, response) {
  console.log("POST received from Sketch Workspace. Yay 🎉");

  // We can now download the document from the workspace
  const SKETCH_TOKEN = process.env.SECRET;
  const WORKSPACE_ID = process.env.WS_ID;
  const DOCUMENT_ID = process.env.DOC_ID;

  //console.log(request.body);

  client.getDocuments(WORKSPACE_ID, SKETCH_TOKEN).then((docArray) => {
    console.log(`There are ${docArray.length} documents in your workspace`);
    const doc = docArray.find((doc) => doc.id == DOCUMENT_ID);
    console.log(
      `We're interested in "${doc.name}", so let's check its updates:`
    );
    client.getUpdatesForDocument(doc, SKETCH_TOKEN).then((updates) => {
      console.log(`Document has ${updates.length} updates.`);
      const unprocessedUpdates = updates.filter(
        (update) => update.state == "PROCESSING"
      );
      const lastProcessedUpdate = updates
          .reverse()
          .find((update) => update.state === "FINISHED");
      if (unprocessedUpdates.length > 0) {
        console.log(`We haven't processed all updates`);
        console.log(`So we need to ask the server to export the assets`)
        // I still don't know what all of this means, to be honest
        //const firstUnprocessedUpdate = unprocessedUpdates[0];
        const exportableAssetsURL = lastProcessedUpdate._links.export.url;
        console.log(`Sending a POST request to ${exportableAssetsURL}`);
        fetch(exportableAssetsURL, {
          method: "POST",
          headers: {
            Authorization: `Basic ${SKETCH_TOKEN}`,
          },
        })
          .then((res) => res.json())
          .then((json) => {
            console.log(json);
          });
      } else {
        // All updates are processed, so we can download the last one:
        console.log(`All updates are processed`);
        console.log(
          `We can now download the assets from ${lastProcessedUpdate._links.download.url}`
        );
        client.downloadUpdates(lastProcessedUpdate._links.download.url, './downloads', SKETCH_TOKEN)
      }
    });
  });
});

const listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
