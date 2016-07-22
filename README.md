# wercker-github-tag-builder

As Wercker currently doesn't build tags pushed to github this is a way to workaround it.

It is a simple REST API endpoint that will be called by GitHub when a new tag is created.
And it will trigger a new build for that tag in wercker through its API.

# Building

Just

```
npm install
```

# Running

Just

```bash
node server.js ... parameters
```

That will startup the server that will listen on

```bash
http://localhost:$port/created/$secret
```

Where parameters are:

| Parameter        | Description           |
| ------------- |:-------------:|
| port      | the port you want this to listen |
| secret    | a string that is expected as "secret" parameter as part of the GitHub request. This way we avoid anyone from triggering builds manually. |
| wercker-token       | a token generated in wercker UI to call wercker API. |
| wercker-api-id      | the id of the wercker application |
| wercker-pipeline-id | the id of the wercker pipeline you want to launch. |

Example:

```bash
node server.js --secret=your_secret --port=3001 --wercker-token="asdadasd" --wercker-app-id="23453" --wercker-pipeline-id="23453"
```

You can try manually calling it with curl:

```bash
curl -X POST -H 'Content-Type: application/json' -d '{
  "ref": "v0.0.1-alpha",
  "ref_type": "tag",
  "master_branch": "master"}' http://localhost:3001/created/misecret
```


