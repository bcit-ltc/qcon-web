import React, { Fragment } from 'react';
import Summary from '../summary/Summary';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

function Progress(props) {
    let currentStatus = props.websocketMessage;

    return (
        <Container className='progress-container' maxWidth='md' align='center'>
            {props.currentState === 'PROGRESSDONE' ?
                <Fragment>
                    <Typography variant="h2">
                        Conversion Complete!
                    </Typography>
                    <Summary jsonString={props.jsonString} />
                    <div className="buttons-group">
                        <Button variant="outlined" display='block' onClick={() => props.changeState('UPLOAD')}>New Conversion</Button>
                        <Button variant="contained" color="primary" onClick={() => props.changeState('PREVIEW')}>Preview Questions</Button>
                        {/* <Button className="download-button" href={props.downloadLink} variant="contained" download={props.scormFileName}>Download Zip File</Button> */}
                    </div>
                </Fragment>
                :
                <Fragment>
                    <Typography variant="h2">
                        Converting <span style={{ color: "blue" }}>{props.fileName}</span>
                    </Typography>
                    <CircularProgress className='circular-progress' size='10rem' />
                    <Typography variant="h3">
                        Please wait...
                    </Typography>
                    <p>{currentStatus}</p>
                </Fragment>
            }
        </Container>

    );
}

export default Progress;
