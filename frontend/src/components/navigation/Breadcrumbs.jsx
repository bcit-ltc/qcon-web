import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

function BreadcrumbLinks(props) {


    let currentState = props.currentState;
    let locations = [];
    let crumbs = [];

    switch (currentState) {
        case 'UPLOAD':
            locations.push('upload');
            break;
        case 'PROGRESS':
        case 'PROGRESSDONE':
            locations = ['upload', 'progress'];
            break;
        case 'PREVIEW':
            locations.push('upload', 'progress', 'preview');
            break;
        case 'DOWNLOAD':
            locations.push('upload', 'progress', 'preview', 'download');
            break;
        case 'ERROR':
            locations.push('upload', 'error');
            break;
        default:
            locations.push('upload');
            break;
    }
    let locationIndex = locations.indexOf(currentState.toLowerCase());

    for (let i = 0; i <= locationIndex; i++) {
        crumbs.push(<Typography color="textPrimary">{locations[i]}</Typography>);
    };


    return (
        <Container className='breadcrumbs-container' maxWidth='md' align='center'>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
                {crumbs.map((crumb, index) => (
                    React.cloneElement(crumb, { key: "breadcrumb-" + index })
                ))}
            </Breadcrumbs>
        </Container>

    );
}

export default BreadcrumbLinks;
