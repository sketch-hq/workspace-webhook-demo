const fetch = require('node-fetch')
const express = require('express')
const fs = require('fs')
const path = require('path')

const SKETCH_TOKEN = process.env.SECRET
const DOCUMENT_ID = process.env.DOC_ID

const app = express()

// We need to set the content-type header to application/json
// otherwise the request body will not be parsed:
app.use(
  express.json({
    type: () => true,
  })
)

app.post('/', function (req, res) {
  console.log('POST received from Sketch Workspace 🎉')

  const event = req.body.events[0]
  let documentID = ''
  switch (event.object) {
    case 'document_created_event':
      // We're not really interested in this event for this demo,
      // but you can use it to do things like post a notification
      // to your #design Slack channel whenever a new document is
      // created in your Workspace.
      console.log('Document created')
      documentID = event._links.document.url.split('/').pop()
      console.log(`Document ID: ${documentID}`)
      break
    case 'update_created_event':
      // When a new update is created, we'll ask Sketch Cloud for
      // it's exportable assets:
      console.log('Document updated')
      documentID = event._links.document.url.split('/').pop()
      // To keep things under control, we're only doing this for
      // the document we're interested in. But of course you can do this
      // for any and all documents.
      if (documentID == DOCUMENT_ID) {
        // To get the assets for a document, we need to POST to the
        // export endpoint defined in the event's links object.
        // We still have the issue of the export endpoint not being
        // usable until the update has been processed. This is something
        // that we'll need to address on the backend (don't trigger this event
        // until the update has been processed). Meanwhile, we can maybe
        // try delaying the request for a few seconds?
        console.log(
          `Asking the server for assets for document ${documentID} in 5 seconds...`
        )
        setTimeout(function () {
          console.log(`Requesting assets`)
          const exportAssetsURL = event._links.export.url
          fetch(exportAssetsURL, {
            method: 'POST',
            headers: {
              Authorization: `Basic ${SKETCH_TOKEN}`,
            },
          })
            .then(res => res.json())
            .then(json => {
              console.log(json)
              // if (json.errors.length > 0) {
              // Update is not yet processed. Try again in a few seconds.
              // console.log(
              // "Update is not yet processed. Try again in a few seconds."
              // );
              // }
            })
        }, 5000)
      }
      break
    case 'export_completed_event':
      console.log(
        `Export completed, downloading assets from: ${event.download.url}`
      )
      const downloadURL = new URL(event.download.url)
      fetch(downloadURL.href)
        .then(
          res =>
            new Promise((resolve, reject) => {
              const savepath = path.resolve(
                __dirname,
                './downloads/',
                downloadURL.pathname.split('/').pop()
              )
              const dest = fs.createWriteStream(savepath)
              res.body.pipe(dest)
              res.body.on('end', () => {
                console.log(`Assets saved to ${savepath}`)
                resolve(savepath)
              })
              dest.on('error', reject)
            })
        )
        .catch(err => {
          console.log(err)
        })
      break
  }
})

const listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port)
})
