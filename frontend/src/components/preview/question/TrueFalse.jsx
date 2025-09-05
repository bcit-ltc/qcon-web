import React from 'react';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import Radio from '@mui/material/Radio';
import QuestionFeedback from './QuestionFeedback';

function TrueFalse(props) {
    const question = props.question;
    const trueFalseObj = question.true_false[0];
    return (
        <AccordionDetails className="question-preview">
            <Box className="question-wrapper">
                <ol>
                    <li className="question-body" value={question.number_provided}>
                        <div className="question-text" dangerouslySetInnerHTML={{ __html: question.text }}></div>
                        {question.feedback && <QuestionFeedback feedbackType="general" feedbackBody={question.feedback} />}
                        {question.true_false &&
                            <div className="question-answers">
                                <ol className={props.listStyle}>
                                    <li key={"question-" + props.questionIndex + "-answer-1"} className={trueFalseObj.true_weight > 0 ? "question-answer-li correct-answer" : "question-answer-li"}>
                                        {trueFalseObj.true_weight > 0 ? <Radio disabled className="right-answer" size="small" checked={true} onClick={(e) => e.target.checked = true} /> : <Radio disabled className="wrong-answer" size="small" checked={false} onClick={(e) => e.target.checked = false} />}
                                        <div className="tf-answer-text">True</div>
                                        {trueFalseObj.true_feedback && <QuestionFeedback feedbackType="option" feedbackBody={trueFalseObj.true_feedback} />}
                                    </li>
                                    <li key={"question-" + props.questionIndex + "-answer-2"} className={trueFalseObj.false_weight > 0 ? "question-answer-li correct-answer" : "question-answer-li"}>
                                        {trueFalseObj.false_weight > 0 ? <Radio disabled className="right-answer" size="small" checked={true} onClick={(e) => e.target.checked = true} /> : <Radio disabled className="wrong-answer" size="small" checked={false} onClick={(e) => e.target.checked = false} />}
                                        <div className="tf-answer-text">False</div>
                                        {trueFalseObj.false_feedback && <QuestionFeedback feedbackType="option" feedbackBody={trueFalseObj.false_feedback} />}
                                    </li>
                                </ol>
                            </div>
                        }
                    </li>
                </ol>
            </Box>
        </AccordionDetails>
    );
}

export default TrueFalse;
