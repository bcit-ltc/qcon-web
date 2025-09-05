import React, { Fragment, useEffect, useRef, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Homepage from './components/homepage/Homepage';
import Progress from './components/progress/Progress';
import PreviewQuestions from './components/preview/PreviewQuestions';
import DownloadScorm from './components/download-scorm/DownloadScorm';
import Error from './components/error/Error';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import BreadcrumbLinks from './components/navigation/Breadcrumbs';
const theme = createTheme({
    palette: {
        primary: {
            main: "#277da1"
        },
        secondary: {
            main: "#f94144"
        }
    },
    typography: {
        button: {
            textTransform: "none"
        }
    }
});

export default function App() {
    let startingState = sessionStorage.getItem('qconstate');
    const [tryConnection, setTryConnection] = useState(false);
    const [connectionDone, setConnectionDone] = useState(false);

    // eslint-disable-next-line
    switch (startingState) {
        case "PROGRESS":
            if (tryConnection === false && connectionDone === false) {
                startingState = 'UPLOAD';
            }
            break;
        case null:
        case "ERROR":
            startingState = 'UPLOAD';
            break;
    }

    const [state, setState] = useState(startingState);
    const [fileName, setFileName] = useState(null);
    const [wordFile, setWordFile] = useState(null);
    const [jsonString, setJsonString] = useState(sessionStorage.getItem('qconjsonresult'));
    const [errorMessage, setErrorMessage] = useState(null);
    const [submitClicked, setSubmitClicked] = useState(false);
    const [isConnectWebsocket, setIsConnectWebsocket] = useState(false);
    const [websocketMessage, setWebsocketMessage] = useState("");
    const [zipfileName, setZipfileName] = useState("");
    const [linkHref, setLinkHref] = useState("");
    const [Debug, setDebug] = useState("");

    if (sessionStorage.getItem('qconadditionaloptions') === null) {
        sessionStorage.setItem('qconadditionaloptions', JSON.stringify({ 'randomize_answer': false }));
    }


    const onUnload = e => {
        e.preventDefault();
        e.returnValue = '';
        // console.log("user closes browser")
    };

    useEffect(() => {
        window.addEventListener("beforeunload", onUnload);
    }, []);

    useEffect(() => {
        sessionStorage.setItem('qconjsonresult', jsonString);
    }, [jsonString]);

    const ws = useRef(null);

    useEffect(() => {
        sessionStorage.setItem('qconstate', state);
    }, [state]);


    useEffect(() => {
        const sendFile = (e) => {
            var reader = new FileReader();

            reader.readAsDataURL(wordFile);
            reader.onload = function () {
                // console.log(reader.result);
                // console.log(sessionStorage.getItem('qconadditionaloptions'));
                ws.current.send(JSON.stringify(Object.assign({ 'filename': fileName, 'file': reader.result }, JSON.parse(sessionStorage.getItem('qconadditionaloptions')))));
                sessionStorage.removeItem('qconadditionaloptions');
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
            };
        };

        if (isConnectWebsocket) {
            sendFile();
        }
    // eslint-disable-next-line
    }, [isConnectWebsocket]);

    useEffect(() => {
        const connectwebsocket = (e) => {

            var loc = window.location;
            var wsStart = 'ws://';
            if (loc.protocol === 'https:') {
                wsStart = 'wss://';
            }

            var endpoint = wsStart + window.location.host + window.location.pathname + 'ws/';

            ws.current = new WebSocket(endpoint);
            // ws.current.binaryType = "arraybuffer";

            setTryConnection(false);
            setConnectionDone(false);

            ws.current.onopen = () => {
                // console.log("ws opened");
                setWebsocketMessage("");
                setTryConnection(true);
                // ws.current.send("message from browser")
                setIsConnectWebsocket(true);
            };
            ws.current.onclose = (event) => {
                // let closeMessage = "WS close event:" + event.code;
                // https://datatracker.ietf.org/doc/html/rfc6455#section-7.4
                // console.log(closeMessage);
                setTryConnection(false);
                setIsConnectWebsocket(false);
                // if (state === 'PROGRESS') {
                //     setErrorMessage(closeMessage);
                //     setState("ERROR");
                //     ws.current = null;
                // }
            };
            ws.current.onmessage = e => {
                const message = JSON.parse(e.data);
                let messageStatus = message['status'];
                setWebsocketMessage(message['statustext']);
                console.log(`API host: ${message['hostname']} version: ${message['version']}`);
                setDebug(JSON.stringify(message, null, 4));
                
                // eslint-disable-next-line
                switch (messageStatus) {
                    case 'Done':
                        setJsonString(JSON.stringify(message));
                        // console.log(JSON.stringify(message));
                        setConnectionDone(true);
                        setTryConnection(false);
                        setIsConnectWebsocket(false);
                        setState('PROGRESSDONE');
                        ws.current.close();
                        break;
                    case 'Error':
                        setJsonString(JSON.stringify(message));
                        // console.log(JSON.stringify(message));
                        setTryConnection(false);
                        setIsConnectWebsocket(false);
                        setErrorMessage(message['statustext']);
                        setState('ERROR');
                        ws.current.close();
                        break;
                }


                // setWebsocketMessage(JSON.stringify(message, null, 4));
                // console.log("e", message);
            };
        };
        if (submitClicked) {
            connectwebsocket();
            setSubmitClicked(false);
        }
    }, [submitClicked]);

    function updateState(nextState) {
        setState(nextState);
        sessionStorage.setItem('qconstate', nextState);
    }

    function updateErrorMessage(errorMessage) {
        setErrorMessage(errorMessage);
    }

    // function updateFileName(fileName) {
    //     setFileName(fileName);
    // }

    function updateZipfileName(zipfileName) {
        setZipfileName(zipfileName);
    }

    function updateLinkHref(linkHref) {
        setLinkHref(linkHref);
    }

    function clickQconMenubar() {
        if (sessionStorage.getItem('qconstate') !== 'PROGRESS') {
            setState('UPLOAD');
        }
    }

    const MAINGRID_STATES = {
        UPLOAD: <Homepage changeState={updateState} updateFileName={setFileName} setWordFile={setWordFile} setSubmitClicked={setSubmitClicked} updateTryConnection={setTryConnection} jsonString={jsonString} setJsonString={setJsonString} />,
        PROGRESS: <>
            {connectionDone === false &&
                <>
                    {tryConnection === false ?
                        <Homepage changeState={updateState} updateFileName={setFileName} setWordFile={setWordFile} setSubmitClicked={setSubmitClicked} updateTryConnection={setTryConnection} />
                        :
                        <Progress changeState={updateState} currentState={state} tryConnection={tryConnection} websocketMessage={websocketMessage} fileName={fileName} connectionDone={connectionDone} />
                    }
                </>
            }
        </>,
        PROGRESSDONE: <Progress changeState={updateState} currentState={state} tryConnection={tryConnection} websocketMessage={websocketMessage} fileName={fileName} connectionDone={connectionDone} />,
        PREVIEW: <PreviewQuestions changeState={updateState} jsonString={jsonString} changeZipfileName={updateZipfileName} changeLinkHref={updateLinkHref} changeErrorMessage={updateErrorMessage} />,
        DOWNLOAD: <DownloadScorm changeState={updateState} zipfileName={zipfileName} linkHref={linkHref} />,
        ERROR: <Error changeState={updateState} errorMessage={errorMessage} />,
    };

    return (
        <Fragment>
            <ThemeProvider theme={theme}>
                <AppBar className="app-bar" position="static">
                    <Toolbar className='main-toolbar'>
                        <Typography variant="h1" className="app-title" align="center">
                            <Button color="inherit" underline="none" onClick={clickQconMenubar}>QCon</Button>
                        </Typography>
                        <hr className='separator' />
                        <Button color="inherit" className='user-guide-button' href="https://qcon-guide.ltc.bcit.ca" target="_blank" rel="noopener noreferrer"><HelpOutlineIcon />&nbsp;Qcon Guide</Button>
                    </Toolbar>
                </AppBar>

                <Container className='main-container' maxWidth='md'>
                    <br />
                    <BreadcrumbLinks currentState={state} />

                    <Grid container className="main-grid" justify="center">
                        {
                            MAINGRID_STATES[state]
                        }
                    </Grid>
                </Container>

            </ThemeProvider>
            {
                ((process.env.REACT_APP_DEBUG === 'true') && Debug) &&
                <div>
                    <button style={{ marginLeft: "2.5%" }} onClick={() => navigator.clipboard.writeText(Debug)}>Copy JSON 📋</button>
                    <pre style={{ maxWidth: "95%", maxHeight: "500px", margin: "auto", backgroundColor: "lightgrey", overflow: "scroll", textOverflow: "ellipsis" }}>
                        {Debug}
                    </pre>
                </div>
            }
        </Fragment>
    );
}
