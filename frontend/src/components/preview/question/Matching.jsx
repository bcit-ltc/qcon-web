import React from 'react';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import QuestionFeedback from './QuestionFeedback';

function Matching(props) {
    const question = props.question;

    // matchRight = matching_choice, matchLeft = matching_answer
    const [matchLeftArray, matchRightArray, selectionArray] = [[], [], []]

    // Durstenfeld shuffle
    function shuffleArray(array) {
        let newArray = array;
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    question.matching[0].matching_choices.forEach(function (matChoice, index) {
        matchLeftArray.push(matChoice.choice_text);

        matChoice.matching_answers.forEach(function (matAnswer) {
            matchRightArray.push([index + 1, matAnswer.answer_text]);
            selectionArray.push(index + 1);
        });
    });

    // question.map((answer, index) => {
    //     matchLeftArray.push(answer.match_left);
    //     matchRightArray.push([index + 1, answer.match_right]);
    //     selectionArray.push(index + 1);
    // });

    const shuffledMatchRightArray = shuffleArray(matchRightArray);

    return (
        <AccordionDetails className="question-preview">
            <Box className="question-wrapper">
                <ol>
                    <li className="question-body" value={question.number_provided}>
                        <div className="question-text" dangerouslySetInnerHTML={{ __html: question.text }}></div>
                        {question.feedback && <QuestionFeedback feedbackType="general" feedbackBody={question.feedback} />}
                        {question.matching &&
                            <div className="question-answers matching-answers">
                                <ol className="match-right no-list">
                                    {shuffledMatchRightArray.map((matchRight, matchRightIndex) => (
                                        <li key={"question-" + props.questionIndex + "-answer-match-right-" + (matchRightIndex + 1)} className="matching-answer-right">
                                            <FormControl variant="outlined" className={"dropdown-form match-right-color-" + matchRight[0]} size="small">
                                                <InputLabel id={"question-" + props.questionIndex + "-match-right-" + (matchRightIndex + 1) + "-label"}></InputLabel>
                                                <Select disabled
                                                    labelId={"question-" + props.questionIndex + "-match-right-" + (matchRightIndex + 1) + "-label"}
                                                    value={matchRight[0]}
                                                    onChange={(e) => { return false }}
                                                >
                                                    {selectionArray.map((selection, menuItemindex) => { return (<MenuItem value={selection} key={"question-" + props.questionIndex + "-match-right-" + (matchRightIndex + 1) + "-item-" + menuItemindex}>{selection}</MenuItem>) })}
                                                </Select>
                                            </FormControl>
                                            <div className="matching-answer-text" dangerouslySetInnerHTML={{ __html: matchRight[1] }}></div>
                                        </li>
                                    ))}
                                </ol>
                                <ol className="match-left">
                                    {matchLeftArray.map((matchLeft, matchLeftIndex) => (
                                        <li key={"question-" + props.questionIndex + "-answer-match-left-" + (matchLeftIndex + 1)} className={"matching-answer-left match-left-color-" + (matchLeftIndex + 1)}>
                                            <div className="matching-answer-text" dangerouslySetInnerHTML={{ __html: matchLeft }}></div>
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

export default Matching;
