import React from 'react';
import Container from '@mui/material/Container';
import ErrorIcon from '@mui/icons-material/Error';
import Button from '@mui/material/Button';

function Error(props) {
    let errorMessages = props.errorMessage.toString();
    // console.log(errorMessages[1]);

    return (
        <Container className='error-container' maxWidth='md' align='center'>
            <h2><ErrorIcon fontSize="large" color="secondary" /> Conversion Failed.</h2>
            <h3>{errorMessages}</h3>
            
            {/* <h3>{errorMessages[0]}</h3>

            {errorMessages[1] &&
                <Grid item xs={12} md={12} className='document-error'>
                    <p><strong>Document Error:</strong></p>
                    {errorMessages[1].documenterrors.map((error, index) => (
                        <Paper elevation={3} className='error-message'>
                            <p>{error.message}</p>
                            <p>{error.action}</p>
                        </Paper>
                    ))}
                </Grid>
            } */}

            <div className="buttons-group">
                <Button variant="contained" display='block' onClick={() => props.changeState('UPLOAD')}>New Conversion</Button>
            </div>
        </Container>
    );
}

export default Error;
