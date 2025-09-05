import React from 'react';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import QuestionFeedback from './QuestionFeedback';

function MultipleChoice(props) {
    const question = props.question;

    return (
        <AccordionDetails className="question-preview">
            <Box className="question-wrapper">
                <ol>
                    <li className="question-body" value={question.number_provided}>
                        <div className="question-text" dangerouslySetInnerHTML={{ __html: question.text }}></div>
                        {question.feedback && <QuestionFeedback feedbackType="general" feedbackBody={question.feedback} />}
                        {question.multiple_choice &&
                            <div className="question-answers">
                                <ol className={props.listStyle}>
                                    {question.multiple_choice[0].multiple_choice_answers.map((mcAnswer, index) => (
                                        <li key={"question-" + props.questionIndex + "-answer-" + (index + 1)} className={mcAnswer.weight > 0 ? "question-answer-li correct-answer" : "question-answer-li"}>
                                            {mcAnswer.weight > 0 ? <Radio disabled className="right-answer" size="small" checked={true} onClick={(e) => e.target.checked = true} /> : <Radio disabled className="wrong-answer" size="small" checked={false} onClick={(e) => e.target.checked = false} />}
                                            <div className="mc-answer-text" dangerouslySetInnerHTML={{ __html: mcAnswer.answer }}></div>
                                            {mcAnswer.answer_feedback && <QuestionFeedback feedbackType="option" feedbackBody={mcAnswer.answer_feedback} />}
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

export default MultipleChoice;
