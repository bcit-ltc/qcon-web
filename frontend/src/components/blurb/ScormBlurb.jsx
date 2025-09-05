import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

function ScormBlurb(props) {

    return (
        <Container className='blurb-container' maxWidth='md'>
            <Box>
                <Paper elevation={3} className='blurb-message'>
                    <Typography variant="h3" align='center'>
                        <strong>How to upload the ZIP file</strong>
                    </Typography>
                    <p></p>
                    <ol>
                        <li>Click the "Download ZIP File" button below to download the ZIP file</li>
                        <li>Go to your online course</li>
                        <li> Click on <b>"Activities"</b></li>
                        <li>Click on <b>"Quizzes"</b></li>
                        <li> Click on <b>"Question Library"</b></li>
                        <li>Click on <b>"Import"</b></li>
                        <li>Click on <b>"Upload File"</b></li>
                        <li>Choose the downloaded ZIP file</li>
                        <li>Click on <b>"Import All"</b></li>
                        <li>Make sure all the questions are there.</li>
                    </ol>

                </Paper>
            </Box>
        </Container>
    );
}

export default ScormBlurb;
