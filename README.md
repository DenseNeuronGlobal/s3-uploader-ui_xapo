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
npm install -g @aws-amplify/cli
```

Upgrade the global npm packages
```sh
npm upgrade -g
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

Now add the Administration group to AWS Amplify
```sh
amplify update auth
```

> Select the following parameters:
For the question: What do you want to do? Select "Create or update Cognito user pool groups"
Provide a name for your user pool group as "Admin".
Next select "No" for the question "Do you want to add another User Pool Group?".
You may simply press enter to the question "Sort the user pool groups in order of preference"

Now you need to enable the Administrative API:
```sh
amplify update auth
```

> Select the following parameters:
For the question "What do you want to do?", select "Create or update Admin queries API". 
Next select Yes for the  questions "Do you want to restrict access to the admin queries API to a specific Group".
From the list select "Admin" from the group to restrict access to.

It is now time to add storage for the user files:
```sh
amplify add storage
```

>Select the following parameters:
Select Content: (Images, audio, video, etc.)
Provide a friendly name for your resource that will be used to label this category in the project - for example: xapos3uploadproduction (it can be any name; if you wish, accept the defaults). Press enter.
Provide bucket name. This is the bucket where users will upload files. For example: xapos3uploadproduction. The name must be unique; otherwise, accept the defaults suggested and select enter to confirm. Make a note of this bucket; you will use it later.

For the question "Restrict access by?" select "Both".
From the list of actions select the option: create/update.
For the questions "Who should have access", Select Auth users only
Next for the question "What kind of access do you want for Authenticated users" select "create/update".
Finally for the question: "Do you want to add Lambda Trigger for your S3 Bucket", select "No".

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

To complete the Cognito configuration please go to your AWS Cognito user pool which is listed in the output, and nativate to the tab "sign-up experience". (You should use the new version of the console to complete this operation.). Now add a custom attribute "identityId" of type "String" with a minimum length 0, maximum length of 2048, and is mutable.

Finally create your administrative users in Cognito and add them to the Admin Group.

You can then test the application in Chrome.



## Prerequisites

To build this solution you must have:
- AWS account
- Permissions to create resources in the AWS account
- Node.js 16.x or higher
