import React from 'react';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';

function QuestionHeader(props) {
    const question = props.question;
    let hyperlink = 'https://qcon-guide.ltc.bcit.ca/';
    let isRandomize;
    let backgroundClass = "";

    // eslint-disable-next-line
    switch (question.questiontype) {
        case "MC":
            hyperlink = 'https://qcon-guide.ltc.bcit.ca/detailed-question-types/multiple-choice/';
            if (question.multiple_choice.length) {
                isRandomize = question.multiple_choice[0].randomize;
            }
            break;
        case "MS":
        case "MR":
            hyperlink = 'https://qcon-guide.ltc.bcit.ca/detailed-question-types/multiple-select/';
            if (question.multiple_select.length) {
                isRandomize = question.multiple_select[0].randomize;
            }
            break;
        case "MAT":
        case "MT":
            hyperlink = 'https://qcon-guide.ltc.bcit.ca/detailed-question-types/matching/';
            isRandomize = true;
            break;
        case "ORD":
            hyperlink = 'https://qcon-guide.ltc.bcit.ca/detailed-question-types/ordering/';
            isRandomize = true;
            break;
        case "TF":
            hyperlink = 'https://qcon-guide.ltc.bcit.ca/detailed-question-types/true-false/';
            isRandomize = false;
            break;
        case "FIB":
        case "FMB":
            hyperlink = 'https://qcon-guide.ltc.bcit.ca/detailed-question-types/fill-in-blanks/';
            isRandomize = false;
            break;
        case "WR":
        case "E":
            hyperlink = 'https://qcon-guide.ltc.bcit.ca/detailed-question-types/written-response/';
            isRandomize = false;
            break;
    }

    if (question.error || !question.questiontype) {
        backgroundClass = "background-error";
    } else if (question.warning) {
        backgroundClass = "background-warning";
    } else if (question.info) {
        backgroundClass = "background-info";
    }

    return (
        <AccordionSummary expandIcon={question.error ? "" : <ExpandMoreIcon fontSize="large" />} className={backgroundClass}>
            <ol className="question-header">
                <li value={question.number_provided}>
                    <Stack direction="column">
                        <p className="question-title"><strong>Title:</strong> {question.title}</p>
                        <p className="question-type"><strong>Type:</strong> <a href={hyperlink} target="_blank" rel="noopener noreferrer">{question.questiontype}</a></p>
                        <p className="question-points"><strong>Points:</strong> {Number(question.points)}</p>
                        <p className="randomize-answer"><strong>Answers Randomized:</strong> {isRandomize ? "yes" : "no"}</p>

                        {question.error &&
                            <Paper elevation={3} className="error-message">
                                <p><strong>ERROR:</strong></p>
                                <p>{question.error}</p>
                            </Paper>
                        }

                        {question.warning &&
                            <Paper elevation={3} className="warning-message">
                                <p><strong>Warning:</strong></p>
                                <p>{question.warning}</p>
                            </Paper>
                        }

                        {question.info &&
                            <Paper elevation={3} className="info-message">
                                <p><strong>Info:</strong></p>
                                <p>{question.info}</p>
                            </Paper>
                        }

                        {question.questiontype === null &&
                            <Paper elevation={3} className="error-message">
                                <p><strong>ERROR:</strong></p>
                                <p>Cannot determine the question type.</p>
                            </Paper>

                        }
                    </Stack>
                </li>
            </ol>
        </AccordionSummary>
    );
}

export default QuestionHeader;
