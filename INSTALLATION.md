# Installation Project

## Clone project
`git clone https://github.com/DenseNeuronGlobal/s3-uploader-ui_xapo.git`

## Install dependencies
``

## Setup Amplify Environment
`amplify init`

Then it will ask you:
`? Enter a name for the project: `, You can type `s3uploader`

Then it will display the project information as like
```
Project information
| Name: s3admin
| Environment: dev
| Default editor: Visual Studio Code
| App type: javascript
| Javascript framework: react
| Source Directory Path: src
| Distribution Directory Path: build
| Build Command: npm run-script build
| Start Command: npm run-script start
```

Then it will ask `? Initialize the project with the above configuration?`
`Y` - Agree
`n` - Disagree

Usually we can go with this default configuration


As next it will ask to choose the authentication method
```
Using default provider  awscloudformation
? Select the authentication method you want to use: (Use arrow keys)
❯ AWS profile 
  AWS access keys 
```

We can choose AWS profile or AWS access keys
We prefer to go with `AWS profile`.

If we go with the option of 
