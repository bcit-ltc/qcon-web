import React from 'react';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import QuestionFeedback from './QuestionFeedback';

function FillInBlanks(props) {
    const question = props.question;
    const sortedFib = question.fib.sort((a, b) => {
        return a.order - b.order;
    });

    return (
        <AccordionDetails className="question-preview">
            <Box className="question-wrapper">
                <ol>
                    <li className="question-body" value={question.number_provided}>
                        <div className="question-text">
                            {sortedFib.map((fib, fibIndex) => {
                                return fib.type === "fibanswer" ?
                                    <form key={"question-" + props.questionIndex + "-fib-answer-" + (fibIndex + 1)} className="fib-answer-form" noValidate autoComplete="off">
                                        <TextField disabled className="fib-answer" value={fib.text} variant="outlined" size="small" margin="none" readOnly inputProps={{ 'aria-label': 'fib-answer' }} />
                                    </form>
                                    :
                                    <span key={"question-" + props.questionIndex + "-fib-text-" + (fibIndex + 1)} dangerouslySetInnerHTML={{ __html: fib.text }}></span>
                            })}
                        </div>
                        {question.feedback && <QuestionFeedback feedbackType="general" feedbackBody={question.feedback} />}
                    </li>
                </ol>
            </Box>
        </AccordionDetails>
    );
}

export default FillInBlanks;
