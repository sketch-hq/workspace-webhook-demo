# Workspace Webhook Demo

This demo uses Webhooks and Sketch's public Cloud API to automate asset exporting. We'll show you how to download the exportable assets from a Workspace document as soon as it's saved, without user intervention.

You can use this technique as the foundation of a fully automated workflow for your own projects. Some examples of this are:

- Automatically exporting banner assets to an ad server
- Extracting icons from a Sketch document to update a website or app
- Keeping a local backup of all Sketch documents in a Workspace
- Integrating Sketch Workspaces with online services

## Disclaimer

This demo is not meant to be a complete solution. You'll need to implement your own logic to handle the different scenarios.

The public Cloud API and the webhook feature are still in alpha, with limited availability. Reach out to your Sketch CSM, or get in touch with us at <developer@sketch.com> if you're interested in using the API.

## Usage

1. Deploy this project to a server that's reachable from the internet. We've used and enjoyed <https://glitch.com> when building this demo, and it should work out of the box. Make a note of the public URL of the server because you'll need it to create a Webhook later on.
1. Create a Sketch Workspace (you can use a free trial if you don't have one).
1. Open <https://sketch.com>, log in to your Workspace, and go to People & Settings › Settings › Advanced. Fill in the URL of your server in the “Webhook URL” field.
1. Generate a personal access token to access the API. You can get it at <https://www.sketch.com/settings/access-tokens>.
1. Define these environment variables using your favorite secret management system:

- `SKETCH_TOKEN`: The personal access token you generated earlier.
- `DOCUMENT_ID`: The ID of the document you want to use for the demo. You can get that from the URL of the document when you view it in your browser. The URL looks like `https://www.sketch.com/s/63f8dbd4-141d-4459-8e90-26269c87d120`, where `63f8dbd4-141d-4459-8e90-26269c87d120` is the document ID. You can access all Workspace documents using the API, but we'll limit the scope of what we're doing in this demo

Once you've set everything up, you can trigger the webhook by opening the document in Sketch and saving it. You should see some output in the server console that confirms that the webhook worked. If you defined some layers as exportable in the document, the server will then download a ZIP file with all the assets from that document.

From there, you can use the ZIP file to import the assets into your own project, but that is left as an exercise for the reader. We've added comments in the code to help you get started.

Have fun, and let us know in the issues section if you have any questions or feedback.
