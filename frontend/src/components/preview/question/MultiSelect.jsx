import React from 'react';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import QuestionFeedback from './QuestionFeedback';

function MultiSelect(props) {
    const question = props.question;

    return (
        <AccordionDetails className="question-preview">
            <Box className="question-wrapper">
                <ol className={props.listStyle}>
                    <li className="question-body" value={question.number_provided}>
                        <div className="question-text" dangerouslySetInnerHTML={{ __html: question.text }}></div>
                        {question.feedback && <QuestionFeedback feedbackType="general" feedbackBody={question.feedback} />}
                        
                        {question.multiple_select &&
                            <div className="question-answers">
                                <ol className={props.listStyle}>
                                    {question.multiple_select[0].multiple_select_answers.map((ms_answer, index) => (
                                        <li key={"question-" + props.questionIndex + "-answer-" + (index + 1)} className={ms_answer.is_correct ? "question-answer-li correct-answer" : "question-answer-li"}>
                                            {ms_answer.is_correct ? <Checkbox disabled className="right-answer" size="small" checked={true} onClick={(e) => e.target.checked = true} /> : <Checkbox disabled className="wrong-answer" size="small" checked={false} onClick={(e) => e.target.checked = false} />}
                                            <div className="ms-answer-text" dangerouslySetInnerHTML={{ __html: ms_answer.answer }}></div>
                                            {ms_answer.answer_feedback && <QuestionFeedback feedbackType="option" feedbackBody={ms_answer.answer_feedback} />}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        }
                    </li>
                </ol>
            </Box>
        </AccordionDetails>
    );
}

export default MultiSelect;
