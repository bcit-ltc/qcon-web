import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import ArticleIcon from '@mui/icons-material/Article';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import FolderZipIcon from '@mui/icons-material/FolderZip';


function IntroBlurb(props) {

    return (
        <Container className='blurb-container' maxWidth='md'>
            <p>QCon is an app that convert Word file (.docx) into a Brightspace (D2L) ZIP file.</p>
            <Box className='box-grid' sx={{ display: "grid", gridTemplateRows: "repeat(3, 1fr)" }}>
                <Paper elevation={3} className='blurb-message'>
                    <ArticleIcon sx={{ color: '#2b579a', fontSize: 60 }} />
                    <p>Upload your Word file (.docx)</p>
                </Paper>
                <Paper elevation={3} className='blurb-message'>
                    <FactCheckIcon sx={{ color: '#30b324', fontSize: 60 }} />
                    <p>Preview the questions</p>
                </Paper>
                <Paper elevation={3} className='blurb-message'>
                    <FolderZipIcon sx={{ color: '#ffd45e', fontSize: 60 }} />
                    <p>Download the ZIP file</p>
                </Paper>
            </Box>
        </Container>
    );
}

export default IntroBlurb;
