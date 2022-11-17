import React, {useState, useRef, useEffect} from 'react';
import '@aws-amplify/ui-react/styles.css';
import './App.css';
import AppLayout from "@awsui/components-react/app-layout";
import FormField from "@awsui/components-react/form-field";
import Alert from "@awsui/components-react/alert";
import Container from "@awsui/components-react/container";
import Header from "@awsui/components-react/header";
import Button from "@awsui/components-react/button";
import TokenGroup from "@awsui/components-react/token-group";
import TopNavigation from "@awsui/components-react/top-navigation"
import SpaceBetween from "@awsui/components-react/space-between";
import ProgressBar from "@awsui/components-react/progress-bar";
import Amplify, {Auth, Storage, Hub} from 'aws-amplify';
import {Authenticator, Flex, Grid, Image, useTheme, View, Heading} from '@aws-amplify/ui-react';

import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

const components = {
  Header() {
    const { tokens } = useTheme();

    return (
      <View textAlign="center" padding={tokens.space.large}>
        <Image
          alt="Xapo Logo"
          src="https://assets-global.website-files.com/63209aa05bd6ad6734b0da3d/6321ca7a2930be7b3d91991c_footer-logo-img.svg"
        />
        <Image 
            alt="Xapo Full Logo"
            src='https://assets-global.website-files.com/63209aa05bd6ad6734b0da3d/6321caad6f73797603d576fa_logo-colored.svg' 
        />
      </View>
    );
  },
  

  
  SignIn: {
      Header() {
          const { tokens } = useTheme();
          return (
                <Heading
                  padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
                  level={3}
                >
                  Sign in to your account
                </Heading>
            );
      }
  },
  ResetPassword: {
      Header() {
          const { tokens } = useTheme();
          return (
                <Heading
                  padding={`${tokens.space.xl} 0 0 ${tokens.space.xl}`}
                  level={3}
                >
                  Reset your password
                </Heading>
            );
      }
  }
}


const appLayoutLabels = {
    navigation: 'Side navigation',
    navigationToggle: 'Open side navigation',
    navigationClose: 'Close side navigation',
    notifications: 'Notifications',
    tools: 'Help panel',
    toolsToggle: 'Open help panel',
    toolsClose: 'Close help panel'
};

const XapoTheme = {
  button: { backgroundColor: '#773326' },
  a: { color: '#FFC0CB' },
};

function formatBytes(a, b = 2, k = 1024) {
    let d = Math.floor(Math.log(a) / Math.log(k));
    return 0 === a ? "0 Bytes" : parseFloat((a / Math.pow(k, d)).toFixed(Math.max(0, b))) + " " + ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d];
}

const Content = () => {
    const hiddenFileInput = useRef(null);
    const [visibleAlert, setVisibleAlert] = useState(false);
    const [uploadList, setUploadList] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [historyList, setHistoryList] = useState([]);
    const [historyCount, setHistoryCount] = useState(0);
    
    const uploadButton = {
        backgroundColor: "red",
        color: "white"
    }
    
    const handleClick = () => {
        hiddenFileInput.current.value = ""; // This avoids errors when selecting the same files multiple times
        hiddenFileInput.current.click();
    };
    const handleChange = e => {
        e.preventDefault();
        let i, tempUploadList = [];
        for (i = 0; i < e.target.files.length; i++) {
            tempUploadList.push({
                label: e.target.files[i].name,
                labelTag: formatBytes(e.target.files[i].size),
                description: 'File type: ' + e.target.files[i].type,
                icon: 'file',
                id: i
            })
        }
        setUploadList(tempUploadList);
        setFileList(e.target.files);
    };

    function progressBarFactory(fileObject) {
        let localHistory = historyList;
        const id = localHistory.length;
        localHistory.push({
            id: id,
            percentage: 0,
            filename: fileObject.name,
            filetype: fileObject.type,
            filesize: formatBytes(fileObject.size),
            status: 'in-progress'
        });
        setHistoryList(localHistory);
        return (progress) => {
            let tempHistory = historyList.slice();
            const percentage = Math.round((progress.loaded / progress.total) * 100);
            tempHistory[id].percentage = percentage;
            if (percentage === 100) {
                tempHistory[id]['status'] = 'success';
            }
            setHistoryList(tempHistory);
        };
    }

    const handleUpload = () => {
        if (uploadList.length === 0) {
            setVisibleAlert(true);
        } else {
            console.log('Uploading files to S3');
            let i, progressBar = [], uploadCompleted = [];
            for (i = 0; i < uploadList.length; i++) {
                // If the user has removed some items from the Upload list, we need to correctly reference the file
                const id = uploadList[i].id;
                progressBar.push(progressBarFactory(fileList[id]));
                setHistoryCount(historyCount + 1);
                uploadCompleted.push(Storage.put(fileList[id].name, fileList[id], {
                        progressCallback: progressBar[i],
                        level: "protected"
                    }).then(async (result) => {
                        // Get the current user identityId
                        const userInfo = await Auth.currentUserInfo();
                        const user = await Auth.currentAuthenticatedUser();
                        
                        // Set user identityId attribute
                        const attribute = 'custom:identityId';
                        
                        if (!userInfo.attributes[attribute]) {
                            console.log('storing identityId as attribute in user info');
                            await Auth.updateUserAttributes(user, {
                                [attribute]: userInfo.id
                            });
                            console.log('Saved identityId attribute in user\'s attributes');
                        }
                        // Trying to remove items from the upload list as they complete. Maybe not work correctly
                        // setUploadList(uploadList.filter(item => item.label !== result.key));
                    })
                );
            }
            // When you finish the loop, all items should be removed from the upload list
            Promise.all(uploadCompleted)
                .then(() => setUploadList([]));
        }
    }

    const handleDismiss = (itemIndex) => {
        setUploadList([
            ...uploadList.slice(0, itemIndex),
            ...uploadList.slice(itemIndex + 1)
        ]);
    };


    
    useEffect(() => {
        document.title = "Xapo Bank File Upload";
    }, []);
    
    let [user, setUser] = useState(null)
    
    useEffect(() => {
        let updateUser = async authState => {
          try {
            let user = await Auth.currentAuthenticatedUser()
            setUser(user)
          } catch {
            setUser(null)
          }
        }
        
        Hub.listen('auth', updateUser) // listen for login/signup events
        updateUser() // check manually the first time because we won't get a Hub event
        return () => Hub.remove('auth', updateUser) // cleanup
    }, []);
    
    const List = ({list}) => (
        <>
            {list.map((item) => (
                <ProgressBar
                    key={item.id}
                    status={item.status}
                    value={item.percentage}
                    variant="standalone"
                    additionalInfo={item.filesize}
                    description={item.filetype}
                    label={item.filename}
                />
            ))}
        </>
    );

    return (
        <SpaceBetween size="l">
            <Container
                id="s3-upload-multiple-objects"
                header={
                    <Header variant="h2" className="uploadHeader">
                        Upload
                    </Header>
                }
            >
                {
                    <div>
                        <Alert
                            onDismiss={() => setVisibleAlert(false)}
                            visible={visibleAlert}
                            dismissAriaLabel="Close alert"
                            dismissible
                            type="error"
                            header="No files selected"
                        >
                            You must select the files that you want to upload.
                        </Alert>

                        <FormField
                            label='File Uploader'
                            description={(
                                <>
                                    <p>
                                        1. Click on “select files” button and choose the files you want to upload.
                                    </p>
                                    <p>
                                        2. Click upload when you are ready.
                                    </p>
                                </>
                            )}
                        />

                        <SpaceBetween direction="horizontal" size="xs">
                            <Button onClick={handleClick}
                                    iconAlign="left"
                                    iconName="upload"
                                    className="amplify-button--secondary"
                            >
                                Choose file[s]
                            </Button>
                            <input
                                type="file"
                                ref={hiddenFileInput}
                                onChange={handleChange}
                                style={{display: 'none'}}
                                multiple
                            />
                            <Button
                                variant="primary"
                                onClick={handleUpload}
                                className="amplify-button--primary"
                            >Upload</Button>
                        </SpaceBetween>
                        
                        <TokenGroup
                            onDismiss={({detail: {itemIndex}}) => {
                                handleDismiss(itemIndex)
                            }}
                            items={uploadList}
                            alignment="vertical"
                            limit={10}
                        />
                    </div>
                }
            </Container>
            <Container
                id="history"
                header={
                
                    <Header variant="h2" className="historyHeader">
                        History
                    </Header>
                }
            >
                <List list={historyList}/>
            </Container>
        </SpaceBetween>

    );
};

function App() {
    const [navigationOpen, setNavigationOpen] = useState(true);
    const formFields = {
        signIn: {
            username: {
                labelHidden: true,
                placeholder: 'Enter your email',
                isRequired: true,
                label: 'Email:'
            },
            password: {
                labelHidden: true,
                placeholder: 'Enter your password',
                isRequired: true,
                label: 'Password:'
            },
        },
        resetPassword: {
            username: {
                labelHidden: true,
                placeholder: 'Enter your email',
                isRequired: true,
                label: 'Email:'
            }
        }
    }

    const navbarItemClick = e => {
        console.log(e);
        if (e.detail.id === 'signout') {
            Auth.signOut().then(() => {
                window.location.reload();
            });
        }
    }

    return (
        <Authenticator
            formFields={formFields}
            components={components}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}
        >
            {({signOut, user}) => (
                <> 
                    <div id="navbar" style={{fontSize: 'body-l !important', position: 'sticky', top: 0, zIndex: 1002 }}s>
                        <TopNavigation
                            identity={{
                                href: "#",
                                title: "",
                                logo: {
                                    src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIxIiBoZWlnaHQ9IjIwIiB2aWV3Qm94PSIwIDAgMjIxIDIwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8ZyBjbGlwLXBhdGg9InVybCgjY2xpcDBfMTQzNF83MzExKSI+CjxwYXRoIGQ9Ik0xMS43NjE4IDMuNzA0MUg5Ljc3Mzk4TDUuOTUwMTUgOC42MzI1M0wyLjIxNTY3IDMuNzA0MUgwLjE3NDIxNkw0Ljg5NTkyIDkuODYxMzRMMCAxNi4xNzI3SDEuOTgzMzhMNS45NDU2OSAxMS4wODU3TDkuODkwMTIgMTYuMTcyN0gxMS45MzZMNi45OTU0NSA5Ljg2MTM0TDExLjc2MTggMy43MDQxWiIgZmlsbD0iI0VCRUJFOSIvPgo8cGF0aCBkPSJNMzEuNDM4OSAxMi4zNTM4SDI1LjIyOTZMMjcuNDQ1MyA3LjcyOTI1QzI3Ljc0NDYgNy4xMDgyNCAyOC4wNjE4IDYuMzY4MzEgMjguMjQ5NCA1LjkyMzQ4QzI4LjI4MDcgNS44NDg2IDI4LjMxMTkgNS43NzgxMyAyOC4zMzQzIDUuNzIwODhDMjguMzY1NSA1Ljc5MTM1IDI4LjQwMTMgNS44Nzk0MyAyOC40NDU5IDUuOTgwNzNDMjguNjQyNSA2LjQ0MzE5IDI4Ljk0NjMgNy4xNDM0NyAyOS4yMjMyIDcuNzI5MjVMMzEuNDM4OSAxMi4zNTgyVjEyLjM1MzhaTTI5LjA4OTIgMy42NjQwNkgyNy41NzQ5TDIxLjY0MjYgMTYuMTcyM0gyMy40NDI4TDI0LjU5NTMgMTMuNzg1MkgzMi4wOTExTDMzLjI0MzYgMTYuMTcyM0gzNS4wMjE1TDI5LjExNiAzLjcyNTcyTDI5LjA4OTIgMy42Njg0N1YzLjY2NDA2WiIgZmlsbD0iI0VCRUJFOSIvPgo8cGF0aCBkPSJNNTQuOTA1NiA4LjQwMzUxQzU0LjkwNTYgMTAuMjQ0NSA1My40MzYgMTEuNTc5IDUxLjQxNjggMTEuNTc5SDQ3LjgxMTlWNS4yMjhINTEuNDM0N0M1My40NDQ5IDUuMjI4IDU0LjkwNTYgNi41NjI1IDU0LjkwNTYgOC40MDM1MVpNNTEuMjgyOCAzLjcwNDFINDYuMDc0MlYxNi4xNzI3SDQ3LjgxMTlWMTMuMTA3M0g1MS4yNjA1QzU0LjUxMjUgMTMuMTA3MyA1Ni43MDE0IDExLjIxNzkgNTYuNzAxNCA4LjQwNzkxQzU2LjcwMTQgNS41OTc5NiA1NC41MjE1IDMuNzA4NTEgNTEuMjgyOCAzLjcwODUxIiBmaWxsPSIjRUJFQkU5Ii8+CjxwYXRoIGQ9Ik03My4zODY0IDE0Ljc3NkM3MC42OTcyIDE0Ljc3NiA2OC41OTMyIDEyLjY0ODcgNjguNTkzMiA5LjkzNTY2QzY4LjU5MzIgNy4yMjI2IDcwLjcwMTcgNS4wOTUzMiA3My4zODY0IDUuMDk1MzJDNzYuMDcxMSA1LjA5NTMyIDc4LjE2MTcgNy4yMjI2IDc4LjE2MTcgOS45MzU2NkM3OC4xNjE3IDEyLjY0ODcgNzYuMDYyMiAxNC43NzYgNzMuMzg2NCAxNC43NzZaTTczLjM4NjQgMy41MDk3N0M2OS42ODc2IDMuNTA5NzcgNjYuNzkzIDYuMzMyOTMgNjYuNzkzIDkuOTMxMjZDNjYuNzkzIDEzLjUyOTYgNjkuNjg3NiAxNi4zNTI4IDczLjM4NjQgMTYuMzUyOEM3Ny4wODUxIDE2LjM1MjggNzkuOTU3NSAxMy41Mjk2IDc5Ljk1NzUgOS45MzEyNkM3OS45NTc1IDYuMzMyOTMgNzcuMDcxNyAzLjUwOTc3IDczLjM4NjQgMy41MDk3N1oiIGZpbGw9IiNFQkVCRTkiLz4KPHBhdGggZD0iTTE0Mi45NjggOS45NjI2NEgxNDcuNEMxNDkuMDE3IDkuOTYyNjQgMTUwLjEwMiAxMC45MDk2IDE1MC4xMDIgMTIuMzIzM0MxNTAuMTAyIDEzLjczNzEgMTQ4Ljk3NiAxNC42NDQ0IDE0Ny4wMTUgMTQuNjQ0NEgxNDIuOTY4VjkuOTYyNjRaTTE0Ny4xODUgOC40NTYzNkgxNDIuOTY4VjUuMjI4SDE0Ni45MzlDMTQ4LjE2OCA1LjIyOCAxNDguODc0IDUuODE4MTcgMTQ4Ljg3NCA2Ljg0ODc4QzE0OC44NzQgNy44MjIxNCAxNDguMjEzIDguNDUxOTYgMTQ3LjE5IDguNDUxOTZMMTQ3LjE4NSA4LjQ1NjM2Wk0xNDkuNDY4IDguOTc2MDdDMTUwLjE5NiA4LjU0MDA0IDE1MC42ODcgNy42NTQ3NyAxNTAuNjg3IDYuNzM4NjhDMTUwLjY4NyA0LjgzNjAxIDE0OS4zMiAzLjcwNDEgMTQ3LjAzMyAzLjcwNDFIMTQxLjIzVjE2LjE3MjdIMTQ3LjExNEMxNTAuMDggMTYuMTcyNyAxNTEuOTIgMTQuNjkyOSAxNTEuOTIgMTIuMzA1N0MxNTEuOTIgMTAuNTYxNiAxNTAuNzI3IDkuMzUwNDQgMTQ5LjQ3MiA4Ljk4MDQ3IiBmaWxsPSIjRUJFQkU5Ii8+CjxwYXRoIGQ9Ik0xNzIuMjIgMTIuMzUzOEgxNjYuMDExTDE2OC4yMjcgNy43MjkyNUMxNjguNTI2IDcuMTA4MjQgMTY4Ljg0MyA2LjM2ODMxIDE2OS4wMjYgNS45MjM0OEMxNjkuMDU3IDUuODQ4NiAxNjkuMDg5IDUuNzc4MTMgMTY5LjExMSA1LjcyMDg4QzE2OS4xNDIgNS43OTEzNSAxNjkuMTc4IDUuODc5NDMgMTY5LjIyMyA1Ljk4MDczQzE2OS40MTkgNi40NDMxOSAxNjkuNzIzIDcuMTQzNDcgMTcwIDcuNzI5MjVMMTcyLjIxNiAxMi4zNTgyTDE3Mi4yMiAxMi4zNTM4Wk0xNjkuODcgMy42NjQwNkgxNjguMzU2TDE2Mi40MjQgMTYuMTcyM0gxNjQuMjI0TDE2NS4zNzcgMTMuNzg1MkgxNzIuODcyTDE3NC4wMjUgMTYuMTcyM0gxNzUuODAzTDE2OS44OTcgMy43MjU3MkwxNjkuODcgMy42Njg0N1YzLjY2NDA2WiIgZmlsbD0iI0VCRUJFOSIvPgo8cGF0aCBkPSJNMTk1LjkxNyAxMy40MDE5QzE5NS42NjcgMTIuOTk2NyAxOTUuMjA3IDEyLjI3ODggMTk0Ljc3NCAxMS43MTA3TDE4OC41NzMgMy43Mzg4NkwxODguNTQyIDMuNjk5MjJIMTg2Ljg1NFYxNi4xNjc4SDE4OC41OTFWNi41NDQ0MUMxODguODQxIDYuOTU4NDEgMTg5LjMwNiA3LjcwMjc0IDE4OS44MTEgOC4zNTAxOEwxOTUuODk5IDE2LjEzMjZMMTk1LjkzMSAxNi4xNzIySDE5Ny42NTVWMy43MDM2MkgxOTUuOTEzVjEzLjQwMTlIMTk1LjkxN1oiIGZpbGw9IiNFQkVCRTkiLz4KPHBhdGggZD0iTTIxNS41NDYgOS40NjQ0N0wyMjAuNjA3IDMuNjk5MjJIMjE4LjQ5NEwyMTIuNTQ4IDEwLjI4MzdDMjEyLjI1OCAxMC41OTY0IDIxMS45MTQgMTEuMDU0NCAyMTEuNzA4IDExLjM0NTFWMy43MDM2MkgyMDkuOTcxVjE2LjE3MjJIMjExLjcwOFYxMy42NzA2TDIxNC40NDIgMTAuNjYyNEwyMTguODc4IDE2LjEzN0wyMTguOTA5IDE2LjE3NjZIMjIwLjk5NUwyMTUuNTQxIDkuNDczMjhMMjE1LjU0NiA5LjQ2NDQ3WiIgZmlsbD0iI0VCRUJFOSIvPgo8cGF0aCBkPSJNMTAyLjk5MyAxMC4wMDIyTDExMC42MjcgMTcuNTI5MkwxMTguMjYxIDEwLjAwMjJMMTEwLjYyNyAyLjQ3NTIzTDEwMi45OTMgMTAuMDAyMlpNMTEwLjYyNyAyMC4wMDQ0TDEwMC40ODIgMTAuMDAyMkwxMTAuNjI3IDBMMTIwLjc3MiAxMC4wMDIyTDExMC42MjcgMjAuMDA0NFoiIGZpbGw9IiNFQkVCRTkiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xNDM0XzczMTEiPgo8cmVjdCB3aWR0aD0iMjIxIiBoZWlnaHQ9IjIwIiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=",
                                    alt: "Xapo Bank logo"
                                }
                            }}
                            utilities={[
                                
                                {
                                    type: "menu-dropdown",
                                    text: user.attributes.email,
                                    description: user.attributes.email,
                                    iconName: "user-profile",
                                    onItemClick: navbarItemClick,
                                    
                                    items: [
                                        {
                                            id: "signout", 
                                            text: "Sign out"
                                        }
                                    ]
                                }
                            ]}
                            i18nStrings={{
                                searchIconAriaLabel: "Search",
                                searchDismissIconAriaLabel: "Close search",
                                overflowMenuTriggerText: "More"
                            }}
                        />
                    </div>
                    <AppLayout
                        toolsHide
                        navigationHide
                        content={<Content/>}
                        headerSelector='#navbar'
                        onNavigationChange={({detail}) => setNavigationOpen(detail.open)}
                        ariaLabels={appLayoutLabels}
                    />
                </>
            )}
        </Authenticator>

    );
}

export default App;
