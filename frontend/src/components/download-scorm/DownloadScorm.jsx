import React from 'react';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import ScormBlurb from '../blurb/ScormBlurb';

function DownloadScorm(props) { 
    
    return (
        <Container className='download-scorm-container' maxWidth='md'>
            <ScormBlurb></ScormBlurb>
            <div className="buttons-group">
                <Button variant="outlined" display='block' onClick={() => props.changeState('UPLOAD')}>New Conversion</Button>
                <Button variant="contained" target="_blank" rel="noopener noreferrer" href={props.linkHref} download={props.zipfileName}>Download ZIP File</Button>
            </div>
        </Container>
    );
}

export default DownloadScorm;
