import React from 'react';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import QuestionFeedback from './QuestionFeedback';

function WrittenResponse(props) {
    const question = props.question;
    const noEdit = (e) => {
        e.preventDefault();
        return false;
    };

    return (
        <AccordionDetails className="question-preview">
            <Box className="question-wrapper">
                <ol>
                    <li className="question-body" value={question.number_provided}>
                        <div className="question-text" dangerouslySetInnerHTML={{ __html: question.text }}></div>
                        {question.feedback && <QuestionFeedback feedbackType="general" feedbackBody={question.feedback} />}
                        {question.written_response &&
                            <div className="question-answers">
                                {question.written_response.map((writtenResponse, index) => (
                                    <div key={"question-" + props.questionIndex + "-answer-" + (index + 1)} className="question-answer-wr" contentEditable={true} onCut={noEdit} onCopy={noEdit} onPaste={noEdit} onKeyDown={noEdit} dangerouslySetInnerHTML={{ __html: (writtenResponse.answer_key ? writtenResponse.answer_key : "<span style='color:grey;'>Correct answer was not provided.</span>") }}>
                                    </div>
                                ))}
                            </div>
                        }
                    </li>
                </ol>
            </Box>
        </AccordionDetails>
    );
}

export default WrittenResponse;
