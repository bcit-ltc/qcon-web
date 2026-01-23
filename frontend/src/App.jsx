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
        if (jsonString) {
            try {
                // Check size before attempting to save (sessionStorage limit is typically 5-10MB)
                const sizeInBytes = new Blob([jsonString]).size;
                const sizeInMB = sizeInBytes / 1024 / 1024;
                
                if (sizeInMB > 5) {
                    // For large payloads, don't save to sessionStorage to avoid quota errors
                    console.warn(`JSON result is ${sizeInMB.toFixed(2)}MB, too large for sessionStorage. Skipping save.`);
                    // Remove any existing entry to free up space
                    try {
                        sessionStorage.removeItem('qconjsonresult');
                    } catch (e) {
                        // Ignore
                    }
                } else {
                    sessionStorage.setItem('qconjsonresult', jsonString);
                }
            } catch (error) {
                // Handle quota exceeded or other storage errors
                if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    console.warn('SessionStorage quota exceeded. JSON result is too large to save. The data is still available in memory.');
                    // Try to remove old data to free up space
                    try {
                        sessionStorage.removeItem('qconjsonresult');
                    } catch (e) {
                        // Ignore
                    }
                } else {
                    console.error('Error saving to sessionStorage:', error);
                }
            }
        }
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

            // Keepalive interval to prevent idle timeout (send ping every 30 seconds)
            // Declared outside handlers so it's accessible to all
            let keepaliveInterval = null;

            ws.current.onopen = () => {
                // console.log("ws opened");
                setWebsocketMessage("");
                setTryConnection(true);
                // ws.current.send("message from browser")
                setIsConnectWebsocket(true);
                
                // Start keepalive ping to prevent idle timeout
                keepaliveInterval = setInterval(() => {
                    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                        // Send a small ping message to keep connection alive
                        try {
                            ws.current.send(JSON.stringify({ type: 'ping' }));
                        } catch (err) {
                            console.warn("Keepalive ping failed:", err);
                        }
                    } else {
                        // Connection closed, clear interval
                        if (keepaliveInterval) {
                            clearInterval(keepaliveInterval);
                            keepaliveInterval = null;
                        }
                    }
                }, 30000); // Every 30 seconds
            };
            ws.current.onclose = (event) => {
                // Clear keepalive interval
                if (keepaliveInterval) {
                    clearInterval(keepaliveInterval);
                    keepaliveInterval = null;
                }
                
                // let closeMessage = "WS close event:" + event.code;
                // https://datatracker.ietf.org/doc/html/rfc6455#section-7.4
                // console.log(closeMessage);
                setTryConnection(false);
                setIsConnectWebsocket(false);
                
                // Only show error if connection closed unexpectedly during processing
                // Check sessionStorage for current state since state variable may not be accessible
                const currentState = sessionStorage.getItem('qconstate');
                if (currentState === 'PROGRESS' && event.code !== 1000) {
                    // 1000 = normal closure, other codes indicate error
                    let closeMessage = `Connection closed unexpectedly (code: ${event.code}, reason: ${event.reason || 'unknown'})`;
                    console.error(closeMessage);
                    setErrorMessage(closeMessage);
                    setState("ERROR");
                }
            };
            ws.current.onerror = (error) => {
                console.error("WebSocket error:", error);
                // Error handling is also done in onclose
            };
            ws.current.onmessage = e => {
                try {
                    // Log message size for debugging large messages
                    const messageSize = e.data ? new Blob([e.data]).size : 0;
                    if (messageSize > 1024 * 1024) { // Log if > 1MB
                        console.log(`Received large WebSocket message: ${(messageSize / 1024 / 1024).toFixed(2)}MB`);
                    }
                    
                    // Parse JSON with better error handling for large messages
                    let message;
                    try {
                        message = JSON.parse(e.data);
                    } catch (parseError) {
                        console.error("Error parsing JSON message:", parseError);
                        console.error("Message size:", messageSize, "bytes");
                        console.error("Message preview (first 500 chars):", e.data.substring(0, 500));
                        setErrorMessage("Failed to parse response from server. The message may be too large.");
                        setState('ERROR');
                        return;
                    }
                    
                    // Ignore ping responses
                    if (message.type === 'pong') {
                        return;
                    }
                    
                    let messageStatus = message['status'];
                    setWebsocketMessage(message['statustext'] || '');
                    if (message['hostname']) {
                        console.log(`API host: ${message['hostname']} version: ${message['version'] || 'unknown'}`);
                    }
                    
                    // Only set debug for non-Done messages to avoid stringifying huge messages
                    // For Done messages, we'll set debug after processing
                    if (messageStatus !== 'Done') {
                        try {
                            setDebug(JSON.stringify(message, null, 4));
                        } catch (err) {
                            console.warn("Could not stringify message for debug:", err);
                        }
                    }
                    
                    // eslint-disable-next-line
                    switch (messageStatus) {
                        case 'Done': {
                            console.log("WebSocket Done message received, size:", messageSize, "bytes");
                            
                            // Verify the message has the expected structure
                            if (!message.data) {
                                console.error("Done message missing 'data' field");
                                setErrorMessage("Received incomplete response from server.");
                                setState('ERROR');
                                return;
                            }
                            
                            // Stringify the message for storage (do this asynchronously to avoid blocking)
                            const stringifyMessage = () => {
                                try {
                                    const jsonStringified = JSON.stringify(message);
                                    console.log("Successfully stringified Done message, length:", jsonStringified.length);
                                    
                                    // Set debug after stringification (only if debug mode is enabled)
                                    if (process.env.REACT_APP_DEBUG === 'true') {
                                        try {
                                            setDebug(jsonStringified);
                                        } catch (debugErr) {
                                            console.warn("Could not set debug for large message:", debugErr);
                                        }
                                    }
                                    
                                    setJsonString(prev => {
                                        console.log("Previous jsonString length:", prev ? prev.length : 0);
                                        console.log("New jsonStringified length:", jsonStringified.length);
                                        return jsonStringified;
                                    });
                                    
                                    setConnectionDone(true);
                                    setTryConnection(false);
                                    setIsConnectWebsocket(false);
                                    setState('PROGRESSDONE');
                                } catch (err) {
                                    console.error("Error stringifying message:", err);
                                    setErrorMessage("Failed to process response from server.");
                                    setState('ERROR');
                                    return;
                                }
                            };
                            
                            // Use setTimeout with 0 delay to allow UI to update first
                            // This prevents blocking the main thread during large message processing
                            setTimeout(stringifyMessage, 0);
                            
                            // Clear keepalive before closing
                            if (keepaliveInterval) {
                                clearInterval(keepaliveInterval);
                                keepaliveInterval = null;
                            }
                            
                            // Wait longer before closing to ensure message is fully processed
                            setTimeout(() => {
                                if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                                    ws.current.close(1000, 'Processing complete');
                                }
                            }, 1000); // Increased delay for large messages to ensure processing completes
                            break;
                        }
                        case 'Error': {
                            let jsonStringified = null;
                            try {
                                jsonStringified = JSON.stringify(message);
                            } catch (err) {
                                console.error("Error stringifying message:", err, message);
                            }
                            setJsonString(prev => {
                                console.log("Previous jsonString:", prev);
                                console.log("New jsonStringified:", jsonStringified);
                                return jsonStringified;
                            });
                            setTryConnection(false);
                            setIsConnectWebsocket(false);
                            setErrorMessage(message['statustext']);
                            setState('ERROR');
                            
                            // Clear keepalive before closing
                            if (keepaliveInterval) {
                                clearInterval(keepaliveInterval);
                                keepaliveInterval = null;
                            }
                            
                            if (ws.current) {
                                ws.current.close(1000, 'Error occurred');
                            }
                            break;
                        }
                    }
                } catch (err) {
                    console.error("Error parsing WebSocket message:", err, e.data);
                    // Try to handle partial/large messages
                    if (e.data && typeof e.data === 'string' && e.data.length > 0) {
                        console.warn("Message might be too large or malformed. Size:", e.data.length);
                    }
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
        PROGRESSDONE: <Progress changeState={updateState} currentState={state} tryConnection={tryConnection} websocketMessage={websocketMessage} fileName={fileName} connectionDone={connectionDone} jsonString={jsonString} />,
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
                ((import.meta.env.VITE_DEBUG === 'true') && Debug) &&
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
