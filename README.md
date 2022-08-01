# Workspace Webhook Demo

If you've ever wanted to automate asset distribution, you've come to the right place.

Using Webhooks and Sketch Cloud API, we'll show you how to download the exportable assets from a Workspace document as soon as it's saved.

## Disclaimer: This is a work in progress

## Usage

1. Deploy this project to a server (we've used and enjoyed <https://glitch.com> when building this demo). Make a note of the public URL of the server because you'll need it to create a Webhook later on.
2. Create a Sketch Workspace (you can use a free trial if you don't have one)
3. Define these environment variables:

- `SKETCH_TOKEN`: The token you need to access your Workspace documents. Get yours at <https://www.sketch.com/settings/access-tokens>
- `DOCUMENT_ID`: The ID of the document you want to use. You can access all Workspace documents using the API, but we'll limit the scope of what we're doing in this demo
