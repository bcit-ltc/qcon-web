import React from 'react';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import QuestionFeedback from './QuestionFeedback';

function Ordering(props) {
    const question = props.question;
    const orderingObjs = question.ordering;
    const selectionArray = orderingObjs.map((ordObj, index) => { return index + 1 });

    // Durstenfeld shuffle
    function shuffleArray(array) {
        let newArray = array;
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    const shuffledAnswers = shuffleArray(orderingObjs);

    return (
        <AccordionDetails className="question-preview">
            <Box className="question-wrapper">
                <ol>
                    <li className="question-body" value={question.number_provided}>
                        <div className="question-text" dangerouslySetInnerHTML={{ __html: question.text }}></div>
                        {question.feedback && <QuestionFeedback feedbackType="general" feedbackBody={question.feedback} />}
                        {question.ordering &&
                            <div className="question-answers">
                                <ol className="no-list">
                                    {shuffledAnswers.map((ord, answerIndex) => (
                                        <li key={"question-" + props.questionIndex + "-answer-" + (answerIndex + 1)} className="ordering-answer-li">
                                            <FormControl variant="outlined" className="dropdown-form" size="small">
                                                <InputLabel id={"question-" + props.questionIndex + "-ordering-answer-" + (answerIndex + 1) + "-label"}></InputLabel>
                                                <Select disabled
                                                    labelId={"question-" + props.questionIndex + "-ordering-answer-" + (answerIndex + 1) + "-label"}
                                                    value={ord.order}
                                                    onChange={(e) => { return false }}
                                                >
                                                    {selectionArray.map((selection, menuItemindex) => { return (<MenuItem value={selection} key={"question-" + props.questionIndex + "-answer-" + (answerIndex + 1) + "-item-" + menuItemindex}>{selection}</MenuItem>) })}
                                                </Select>
                                            </FormControl>
                                            <div className="ordering-answer-text" dangerouslySetInnerHTML={{ __html: ord.text }}></div>
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

export default Ordering;
