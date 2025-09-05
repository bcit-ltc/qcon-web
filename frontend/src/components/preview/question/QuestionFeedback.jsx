import React, { Fragment } from 'react';
import Paper from '@mui/material/Paper';

function QuestionFeedback(props) {
    return (
        <Fragment>
            <div className={"feedback-label " + props.feedbackType + "-feedback-label"}>{props.feedbackType} feedback:</div>
            <Paper elevation={3} className={"feedback-body " + props.feedbackType + "-feedback-body"} dangerouslySetInnerHTML={{ __html: props.feedbackBody }}></Paper>
        </Fragment>
    );
}

export default QuestionFeedback;