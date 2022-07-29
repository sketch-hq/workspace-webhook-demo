# Workspace Webhook Demo

Sample code that shows how to use the webhook feature in Sketch Workspaces

## Disclaimer

This is a work in progress

## Usage

You need to define these environment variables, using your preferred secret management system:

- `SKETCH_TOKEN`: The token you need to access your Workspace documents. Get yours at <https://www.sketch.com/settings/access-tokens>
- `WORKSPACE_ID`: The ID of the Workspace you're connecting with
- `DOCUMENT_ID`: The ID of a document you want to monitor for changes. You can access all documents using the API, this is just a way to limit the scope of what we're doing in this demo
