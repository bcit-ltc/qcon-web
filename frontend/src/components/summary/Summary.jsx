import React, { Fragment } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function Summary() {
    var parsedJson = JSON.parse(sessionStorage.getItem('qconjsonresult'));
    var jsonData = parsedJson["data"];
    // let totalSections = 0;
    let totalRootQuestions = 0;
    let totalRootPoints = 0;
    let totalSectionSummaryCounts = 0;
    let totalSectionSummaryPoints = 0;
    let sectionsArray = [];
    let sectionErrorArray = [];
    let totalQuestions = 0;
    let mcLength = 0;
    let tfLength = 0;
    let fibLength = 0;
    let msLength = 0;
    let matLength = 0;
    let ordLength = 0;
    let wrLength = 0;
    let noTypeLength = 0;

    let mcPoints = 0;
    let tfPoints = 0;
    let fibPoints = 0;
    let msPoints = 0;
    let matPoints = 0;
    let ordPoints = 0;
    let wrPoints = 0;
    let noTypePoints = 0;
    let errorPoints = 0;
    let totalPoints = 0;
    let errorArray = [];

    jsonData.sections.forEach(function (section) {
        let currentSectionQuestionCounts = 0; // doesn't include Root question
        let currentSectionPoints = 0; // doesn't include Root
        section.questions.forEach(function (question) {
            let questionPoints = Number(question.points);

            if (section.is_main_content) {
                totalRootQuestions++;
                totalRootPoints += questionPoints;
            } else {
                currentSectionQuestionCounts++;
                currentSectionPoints += questionPoints;
            }

            if (question.multiple_choice.length) {
                mcLength++;
                mcPoints += questionPoints;
                totalQuestions++;
            }
            else if (question.true_false.length) {
                tfLength++;
                tfPoints += questionPoints;
                totalQuestions++;
            }
            else if (question.fib.length) {
                fibLength++;
                fibPoints += questionPoints;
                totalQuestions++;
            }
            else if (question.multiple_select.length) {
                msLength++;
                msPoints += questionPoints;
                totalQuestions++;
            }
            else if (question.matching.length) {
                matLength++;
                matPoints += questionPoints;
                totalQuestions++;
            }
            else if (question.ordering.length) {
                ordLength++;
                ordPoints += questionPoints;
                totalQuestions++;
            }
            else if (question.written_response.length) {
                wrLength++;
                wrPoints += questionPoints;
                totalQuestions++;
            } else {
                noTypeLength++;
                noTypePoints += questionPoints;
                totalQuestions++;
            }

            if (question.error) {
                errorPoints += questionPoints;
                errorArray.push([question.number_provided, question.error]);
            }
        });

        if (section.is_main_content === false) {
            // totalSections++;
            totalSectionSummaryCounts += currentSectionQuestionCounts;
            totalSectionSummaryPoints += currentSectionPoints;
            sectionsArray.push([section.title, currentSectionQuestionCounts, currentSectionPoints]);

            if (section.error) {
                sectionErrorArray.push([section.title, section.error]);
            }
        }

    });
    totalSectionSummaryCounts += totalRootQuestions;
    totalSectionSummaryPoints += totalRootPoints;
    totalPoints = mcPoints + tfPoints + fibPoints + msPoints + matPoints + ordPoints + wrPoints;



    return (
        <Fragment>
            <TableContainer component={Paper} className="object-summary-container">
                <Table size="small" className="summary-table" aria-label="summary table">
                    <TableHead>
                        <TableRow className={"header-row"}>
                            <TableCell align="center">Object</TableCell>
                            <TableCell align="center">Counts</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell><a href="https://qcon-guide.ltc.bcit.ca/additional-info/media-links/#images" target="_blank" rel="noopener noreferrer">Image</a></TableCell>
                            <TableCell align="center">{parsedJson['images_count']}</TableCell>
                        </TableRow>

                        <TableRow>
                            <TableCell><a href="https://qcon-guide.ltc.bcit.ca/additional-info/sections/" target="_blank" rel="noopener noreferrer">Section</a></TableCell>
                            <TableCell align="center">{parsedJson['section_count']}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            {
                sectionsArray.length > 0 &&
                <TableContainer component={Paper} className="section-summary-container">
                    <Table size="small" className="summary-table" aria-label="section summary table">
                        <TableHead>
                            <TableRow className={"header-row"}>
                                <TableCell align="center">Section Name</TableCell>
                                <TableCell align="center">Counts</TableCell>
                                <TableCell align="center">Points</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                totalRootPoints > 0 &&
                                <TableRow className={"root-points-row"}>
                                    <TableCell>Questions without section</TableCell>
                                    <TableCell align="center">{totalRootQuestions}</TableCell>
                                    <TableCell align="center">{totalRootPoints}</TableCell>
                                </TableRow>
                            }

                            {
                                sectionsArray.map((sectionItem, index) =>
                                    <TableRow key={"section-detail-row-" + (index + 1)}>
                                        <TableCell>{sectionItem[0]}</TableCell>
                                        <TableCell align="center">{sectionItem[1]}</TableCell>
                                        <TableCell align="center">{sectionItem[2]}</TableCell>
                                    </TableRow>
                                )
                            }
                            <TableRow className={"total-row"}>
                                <TableCell><strong>TOTAL</strong></TableCell>
                                <TableCell align="center"><strong>{totalSectionSummaryCounts}</strong></TableCell>
                                <TableCell align="center"><strong>{totalSectionSummaryPoints}</strong></TableCell>
                            </TableRow>

                        </TableBody>
                    </Table>
                </TableContainer>
            }

            <TableContainer component={Paper} className="question-summary-container">
                <Table size="small" className="summary-table" aria-label="summary table">
                    <TableHead>
                        <TableRow className={"header-row"}>
                            <TableCell align="center">Question Type</TableCell>
                            <TableCell align="center">Counts</TableCell>
                            <TableCell align="center"><a href="https://qcon-guide.ltc.bcit.ca/additional-info/points/" target="_blank" rel="noopener noreferrer">Points</a></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {mcLength > 0 &&
                            <TableRow>
                                <TableCell><a href="https://qcon-guide.ltc.bcit.ca/detailed-question-types/multiple-choice/" target="_blank" rel="noopener noreferrer">Multiple Choice (MC)</a></TableCell>
                                <TableCell align="center">{mcLength}</TableCell>
                                <TableCell align="center">{mcPoints}</TableCell>
                            </TableRow>
                        }

                        {tfLength > 0 &&
                            <TableRow>
                                <TableCell><a href="https://qcon-guide.ltc.bcit.ca/detailed-question-types/true-false/" target="_blank" rel="noopener noreferrer">True/False (TF)</a></TableCell>
                                <TableCell align="center">{tfLength}</TableCell>
                                <TableCell align="center">{tfPoints}</TableCell>
                            </TableRow>
                        }

                        {msLength > 0 &&
                            <TableRow>
                                <TableCell><a href="https://qcon-guide.ltc.bcit.ca/detailed-question-types/multiple-select/" target="_blank" rel="noopener noreferrer">Multiple-Select (MS)</a></TableCell>
                                <TableCell align="center">{msLength}</TableCell>
                                <TableCell align="center">{msPoints}</TableCell>
                            </TableRow>
                        }

                        {ordLength > 0 &&
                            <TableRow>
                                <TableCell><a href="https://qcon-guide.ltc.bcit.ca/detailed-question-types/ordering/" target="_blank" rel="noopener noreferrer">Ordering (ORD)</a></TableCell>
                                <TableCell align="center">{ordLength}</TableCell>
                                <TableCell align="center">{ordPoints}</TableCell>
                            </TableRow>
                        }

                        {matLength > 0 &&
                            <TableRow>
                                <TableCell><a href="https://qcon-guide.ltc.bcit.ca/detailed-question-types/matching/" target="_blank" rel="noopener noreferrer">Matching (MAT)</a></TableCell>
                                <TableCell align="center">{matLength}</TableCell>
                                <TableCell align="center">{matPoints}</TableCell>
                            </TableRow>
                        }

                        {fibLength > 0 &&
                            <TableRow>
                                <TableCell><a href="https://qcon-guide.ltc.bcit.ca/detailed-question-types/fill-in-blanks/" target="_blank" rel="noopener noreferrer">Fill In the Blanks (FIB)</a></TableCell>
                                <TableCell align="center">{fibLength}</TableCell>
                                <TableCell align="center">{fibPoints}</TableCell>
                            </TableRow>
                        }

                        {wrLength > 0 &&
                            <TableRow>
                                <TableCell><a href="https://qcon-guide.ltc.bcit.ca/detailed-question-types/written-response/" target="_blank" rel="noopener noreferrer">Written Response (WR)</a></TableCell>
                                <TableCell align="center">{wrLength}</TableCell>
                                <TableCell align="center">{wrPoints}</TableCell>
                            </TableRow>
                        }
                        {noTypeLength > 0 &&
                            <TableRow className={"error-row"}>
                                <TableCell>NO TYPE</TableCell>
                                <TableCell align="center">{noTypeLength}</TableCell>
                                <TableCell align="center">{noTypePoints}</TableCell>
                            </TableRow>
                        }
                        {errorArray.length > 0 &&
                            <TableRow className={"error-row"}>
                                <TableCell>ERROR</TableCell>
                                <TableCell align="center">{errorArray.length}</TableCell>
                                <TableCell align="center">{errorPoints}</TableCell>
                            </TableRow>
                        }

                        <TableRow className={"total-row"}>
                            <TableCell><strong>TOTAL</strong></TableCell>
                            <TableCell align="center"><strong>{totalQuestions}</strong></TableCell>
                            <TableCell align="center"><strong>{totalPoints}</strong></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>

            {sectionErrorArray.length > 0 &&
                <TableContainer component={Paper} className="error-summary-container">
                    <Table size="small" className="summary-table" aria-label="section error summary table">
                        <TableHead className="background-error">
                            <TableRow className={"header-row"}>
                                <TableCell align="center">Section</TableCell>
                                <TableCell align="center">Error Message(s)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sectionErrorArray.map((errorItem, index) =>
                                <TableRow key={"summary-section-error-table-row-" + (index + 1)}>
                                    <TableCell align="center">{errorItem[0]}</TableCell>
                                    <TableCell>{errorItem[1]}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            }

            {errorArray.length > 0 &&
                <TableContainer component={Paper} className="error-summary-container">
                    <Table size="small" className="summary-table" aria-label="question summary table">
                        <TableHead className="background-error">
                            <TableRow className={"header-row"}>
                                <TableCell align="center">Question Number</TableCell>
                                <TableCell align="center">Error Message(s)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {errorArray.map((errorItem, index) =>
                                <TableRow key={"summary-question-error-table-row-" + (index + 1)}>
                                    <TableCell align="center">{errorItem[0]}</TableCell>
                                    <TableCell>{errorItem[1]}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            }
        </Fragment>
    );
}

export default Summary;
