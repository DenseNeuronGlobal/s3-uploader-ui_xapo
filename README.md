# S3 Uploader UI for Xapo

## How to install project

```sh
cat <<END > ~/.aws/config
[default]
region=us-east-1
END
```

```sh
git clone https://github.com/DenseNeuronGlobal/s3-uploader-ui_xapo.git
```

```sh
cd s3-uploader-ui_xapo
```

First install AWS Amplify CLI
```sh
npm install -g @aws-amplify/cli`
```

Inside the project folder, initialize Amplify:
```sh
amplify init
```
> Select the following parameters:
Enter a name for the project: xapos3uploaderprod (it can be any name; if you wish, you can leave defaults). Press enter.
Initialize the project with the above configuration: Yes. Press enter.
Select the authentication method you want to use: AWS profile. Press Enter.
Please choose the profile you want to use: default. Press Enter.

Add the authentication component
```sh
amplify add auth
```
>Select the following parameters:
For Do you want to use the default authentication and security configuration?, select Default Configuration. Press enter.
For How do you want users to be able to sign in?, select Email Address. Press enter to confirm.


Add the storage component
```sh
amplify add storage
```

>Select the following parameters:
For Select from one of the below mentioned services, select Content (Images, audio, video, etc.). Press enter to confirm.
Provide a friendly name for your resource that will be used to label this category in the project - for example: xapos3uploadproduction (it can be any name; if you wish, accept the defaults). Press enter.
Provide bucket name. This is the bucket where users will upload files. For example: xapos3uploadproduction. The name must be unique; otherwise, accept the defaults suggested and select enter to confirm. Make a note of this bucket; you use it later.

Select: Content (Images, audio, video, etc.) 
Select the option: create/update from the list of actions
Who should have access: Select Auth users only
What kind of access do you want for Authenticated users: create/update 
Do you want to add Lambda Trigger for your S3 Bucket: No

Add the application hosting
```sh
amplify hosting add
```

Select the environment setup: Amazon CloudFront and S3. Define a new unique bucket name or use the suggested one.

Now, you can build the web app (front-end)

```sh
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
