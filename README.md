# S3 Uploader UI for Xapo

## How to install project

```sh
cat <<END > ~/.aws/config
[default]
region=us-east-1
END
```

git clone


First install AWS Amplify CLI
`npm install -g @aws-amplify/cli`

Inside the project folder, initialize Amplify:
`amplify init`
> Project name example: s3-uploader-ui

Add the authentication component
`amplify add auth`

Add the storage component
`amplify add storage`

> Select: Content (Images, audio, video, etc.)
> 
> Provide a label for this category or use the suggested one from the wizard.
>
> Select the option create/update from the list of actions

Add the application hosting
`amplify hosting add`

> Select Amazon CloudFront and S3. Define a new unique bucket name or use the suggested one.

Now, you can build the web app (front-end)

```bash
npm install
amplify push
amplify publish
```

The output of the `amplify publish` if all the deployment was done correctly is a URL
This URL is the web application URl where you can open from the browser to access your application.
By default, the front-end come with the sign-up UI disabled. To enable the sign-up UI you need to change the file: `App.css`

Comment or remove the following block:

```css
.amplify-tabs {
display: none;
}
```
> After this change you need to re-run `amplify publish`


## Prerequisites

To build this solution you must have:
- AWS account
- Permissions to create resources in the AWS account
- Node.js 16.x or higher
