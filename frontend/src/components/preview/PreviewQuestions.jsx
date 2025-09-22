import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import Container from '@mui/material/Container';
import Accordion from '@mui/material/Accordion';
import Summary from '../summary/Summary';
import QuestionHeader from './question/QuestionHeader';
import MultipleChoice from './question/MultipleChoice';
import TrueFalse from './question/TrueFalse';
import FillInBlanks from './question/FillInBlanks';
import MultiSelect from './question/MultiSelect';
import Ordering from './question/Ordering';
import Matching from './question/Matching';
import WrittenResponse from './question/WrittenResponse';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Collapse from '@mui/material/Collapse';
import Button from '@mui/material/Button';
import Pagination from '@mui/material/Pagination';
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

// Helper component for rendering section accordions
function SectionAccordion({ section, sectionIndex, expandedAccordions, expandQuestions, renderQuestion, listStyle, color, setExpandedAccordions }) {
    return (
        <div className={color ? "sub-section-wrapper accordion-wrapper" : "root-section-wrapper accordion-wrapper"} key={"wrapper-section-" + (sectionIndex + 1)}>
            <Button
                variant="contained"
                className="accordion-side-button"
                {...(color ? { color: "info" } : {})}
                onClick={() => expandQuestions(sectionIndex, section.questions.length)}
                aria-label={
                    expandedAccordions[sectionIndex] && expandedAccordions[sectionIndex].size === section.questions.length
                        ? 'Collapse All'
                        : 'Expand All'
                }
            >
            </Button>
            <div className="accordion-inner-wrapper">
                {section.questions.map((question, questionIndex) => (
                    <Fragment key={"wrapper-question-" + (questionIndex + 1)}>
                        <Accordion
                            className={"wrapper-question-accordion"}
                            expanded={!!(expandedAccordions[sectionIndex] && expandedAccordions[sectionIndex].has(questionIndex))}
                            onChange={() => {
                                setExpandedAccordions(prev => {
                                    const newExpanded = { ...prev };
                                    if (!newExpanded[sectionIndex]) newExpanded[sectionIndex] = new Set();
                                    if (newExpanded[sectionIndex].has(questionIndex)) {
                                        newExpanded[sectionIndex].delete(questionIndex);
                                    } else {
                                        newExpanded[sectionIndex].add(questionIndex);
                                    }
                                    if (newExpanded[sectionIndex].size === 0) delete newExpanded[sectionIndex];
                                    return { ...newExpanded };
                                });
                            }}
                        >
                            <QuestionHeader question={question} />
                            {renderQuestion(question, questionIndex, listStyle, sectionIndex)}
                        </Accordion>
                    </Fragment>
                ))}
            </div>
        </div>
    );
}

function PreviewQuestions(props) {
    // Helper for expand/collapse all aria-label
    const getExpandCollapseLabel = (sectionIndex, questionsLength) =>
        expandedAccordions[sectionIndex] && expandedAccordions[sectionIndex].size === questionsLength
            ? 'Collapse All'
            : 'Expand All';
    const [openSummary, setOpenSummary] = useState(false);
    const [expandedAccordions, setExpandedAccordions] = useState({});
    const parsedJson = JSON.parse(props.jsonString)["data"];
    const listStyles = [null, 'decimal', 'lower-roman', 'upper-roman', 'lower-alpha', 'upper-alpha', 'none'];
    const listStyle = listStyles[parsedJson.enumeration] || 'lower-alpha';
    // let totalSections = 0;
    let isStart = true;
    const totalQuestions = parsedJson.sections.reduce((sum, section) => sum + section.questions.length, 0);

    const [questionsPerPage, setQuestionsPerPage] = useState(10);
    const [totalPage, settotalPage] = useState(Math.ceil(totalQuestions / questionsPerPage));
    const [currentPage, setCurrentPage] = useState(1);
    const [currentQuestions, setCurrentQuestions] = useState(parsedJson);
    let currentFirstQuestionIndex = currentPage * questionsPerPage - questionsPerPage;

    let currentLastQuestionIndex = currentFirstQuestionIndex + questionsPerPage - 1;

    const [isPackage, setIsPackage] = useState(false);
    const convertToPackage = () => {
        setIsPackage(true);
    };

    const processQuestions = (nextFirstQuestionIndex, nextLastQuestionIndex) => {
        let questionCounter = 0;
        const newSections = parsedJson.sections
            .map(section => {
                const filteredQuestions = section.questions.filter(() => {
                    const inRange = questionCounter >= nextFirstQuestionIndex && questionCounter <= nextLastQuestionIndex;
                    questionCounter++;
                    return inRange;
                });
                return filteredQuestions.length > 0 ? { ...section, questions: filteredQuestions } : null;
            })
            .filter(Boolean);
        return { ...parsedJson, sections: newSections };
    };

    const renderQuestion = (question, index, listStyle, sectionIndex) => {
        if (question.error) return null;
        const currentNumber = index + 1;
        const typeMap = {
            MC: (q, i) => <MultipleChoice question={q} key={"question-" + i} questionIndex={i} listStyle={listStyle} />,
            TF: (q, i) => <TrueFalse question={q} key={"question-" + i} questionIndex={i} listStyle={listStyle} />,
            FIB: (q, i) => <FillInBlanks question={q} key={"question-" + i} questionIndex={i} />,
            FMB: (q, i) => <FillInBlanks question={q} key={"question-" + i} questionIndex={i} />,
            MS: (q, i) => <MultiSelect question={q} key={"question-" + i} questionIndex={i} listStyle={listStyle} />,
            MR: (q, i) => <MultiSelect question={q} key={"question-" + i} questionIndex={i} listStyle={listStyle} />,
            MAT: (q, i) => <Matching question={q} key={"question-" + i} questionIndex={i} />,
            MT: (q, i) => <Matching question={q} key={"question-" + i} questionIndex={i} />,
            ORD: (q, i) => <Ordering question={q} key={"question-" + i} questionIndex={i} />,
            WR: (q, i) => <WrittenResponse question={q} key={"question-" + i} />,
            E: (q, i) => <WrittenResponse question={q} key={"question-" + i} />,
        };
        return typeMap[question.questiontype]?.(question, currentNumber) || null;
    };

    // Expand/collapse all accordions in a section
    const expandQuestions = (sectionIndex, questionsLength) => {
        setExpandedAccordions(prev => {
            const isAllExpanded = prev[sectionIndex] && prev[sectionIndex].size === questionsLength;
            const newExpanded = { ...prev };
            if (isAllExpanded) {
                // Collapse all
                newExpanded[sectionIndex] = new Set();
            } else {
                // Expand all
                newExpanded[sectionIndex] = new Set(Array.from({ length: questionsLength }, (_, i) => i));
            }
            return newExpanded;
        });
    };

    const onChangeQuestionPerPage = (event) => {
        let newQuestionPerPage = event.target.value;
        let newTotalPage = Math.ceil(totalQuestions / newQuestionPerPage);
        currentFirstQuestionIndex = (currentPage - 1) * newQuestionPerPage;
        currentLastQuestionIndex = currentFirstQuestionIndex + newQuestionPerPage - 1;

        setQuestionsPerPage(newQuestionPerPage);
        settotalPage(newTotalPage);
        if (currentPage > newTotalPage) {
            setCurrentPage(1);
        }
        setExpandedAccordions({});
    };

    const onChangePagination = (event, selectedPage) => {
        currentFirstQuestionIndex = selectedPage * questionsPerPage - questionsPerPage;
        currentLastQuestionIndex = currentFirstQuestionIndex + questionsPerPage - 1;

        if (currentFirstQuestionIndex < totalQuestions) {
            setCurrentPage(selectedPage);
        } else {
            setCurrentPage(1);
        }
        setExpandedAccordions({});
    };

    useEffect(() => {
        setCurrentQuestions(processQuestions(currentFirstQuestionIndex, currentLastQuestionIndex));
        setExpandedAccordions({}); // Reset expanded accordions on page change
        document.getElementsByClassName("main-content-container")[0].scrollIntoView();

        const reloadMathjax = () => {
            removeMathjax();
            const script = document.createElement('script');
            script.id = "MathJax-script";
            script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js?nocache=" + new Date().getTime();
            script.async = true;
            document.body.appendChild(script);
        };

        const removeMathjax = () => {
            if (document.getElementById('MathJax-script')) {
                document.getElementById('MathJax-script').remove();
                delete window['MathJax'];
            }
        };

        if (document.getElementsByTagName("math")) {
            reloadMathjax();
        }
        return () => {
            removeMathjax();
        };
        // eslint-disable-next-line
    }, [questionsPerPage, currentPage, isStart]);

    useEffect(() => {

        const sendJson = (e) => {

            var loc = window.location;
            const apiurl = loc.protocol + '//' + window.location.host + window.location.pathname + 'getpackage';
            // const apiurl = 'http://localhost:9000/getpackage';
            const configHeaders = {
                'Content-type': 'application/json',
            };

            axios({
                method: 'post',
                url: apiurl,
                data: props.jsonString,
                headers: configHeaders,
                responseType: 'arraybuffer'
            })
                .then(function (response) {
                    if (response.status === 200) {
                        const contentType = response.headers['content-type'];
                        const blob = new Blob([response.data], { type: contentType, encoding: 'UTF-8' });
                        props.changeLinkHref(window.URL.createObjectURL(blob));
                        let zipName = (response.headers['content-disposition'].split('filename=')[1]).replace(/^"(.+?)"$/, '$1');
                        props.changeZipfileName(zipName);
                        props.changeState("DOWNLOAD");
                    } else {
                        console.log(response.status, ":", response.statusText);
                        props.changeErrorMessage(response.statusText);
                        props.changeState('ERROR');
                    }

                })
                .catch(error => {
                    let errorMessage = error;
                    props.changeErrorMessage(errorMessage);
                    console.log(error);
                    props.changeState('ERROR');
                });

        };

        if (isPackage) {
            sendJson();
        }
        // eslint-disable-next-line
    }, [isPackage]);



    return (
        <Container className='preview-container' maxWidth='md'>
            <div className='main-content-container'>
                <Typography className="section-name" variant="h2">
                    {parsedJson.main_title}
                </Typography>

                {
                    currentQuestions.sections.map((section, sectionIndex) => (
                        section.is_main_content ?
                            <SectionAccordion
                                section={section}
                                sectionIndex={sectionIndex}
                                expandedAccordions={expandedAccordions}
                                expandQuestions={expandQuestions}
                                renderQuestion={renderQuestion}
                                listStyle={listStyle}
                                setExpandedAccordions={setExpandedAccordions}
                                key={"wrapper-section-" + (sectionIndex + 1)}
                            />
                            :
                            <Container className='section-container' maxWidth='md' key={"wrapper-section-" + (sectionIndex + 1)}>
                                <Typography className="section-name" variant="h3">
                                    {section.title}
                                </Typography>
                                <div className="section-text" dangerouslySetInnerHTML={{ __html: section.text }}></div>
                                {
                                    section.error &&
                                    <Grid item xs={12} md={12} className="section-error">
                                        <Paper elevation={3} className="error-message background-error">
                                            <p><strong>ERROR:</strong></p>
                                            <p>{section.error}</p>
                                        </Paper>
                                    </Grid>
                                }
                                <SectionAccordion
                                    section={section}
                                    sectionIndex={sectionIndex}
                                    expandedAccordions={expandedAccordions}
                                    expandQuestions={expandQuestions}
                                    renderQuestion={renderQuestion}
                                    listStyle={listStyle}
                                    color="info"
                                    setExpandedAccordions={setExpandedAccordions}
                                />
                            </Container>
                    ))
                }
            </div>
            <div className="select-question-limit">
                <FormControl variant="outlined" className="question-limit">
                    <InputLabel id="question-limit-label"></InputLabel>
                    <Select
                        labelId={"question-limit-label"}
                        defaultValue={10}
                        onChange={onChangeQuestionPerPage}
                    >
                        <MenuItem value={1}>1 per page</MenuItem>
                        <MenuItem value={5}>5 per page</MenuItem>
                        <MenuItem value={10}>10 per page</MenuItem>
                        <MenuItem value={20}>20 per page</MenuItem>
                        <MenuItem value={50}>50 per page</MenuItem>
                        <MenuItem value={100}>100 per page</MenuItem>
                        <MenuItem value={200}>200 per page</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <div className="preview-pagination">
                <Pagination count={totalPage} page={currentPage} defaultPage={1} siblingCount={2} boundaryCount={1} onChange={onChangePagination} />
            </div>

            <Box textAlign='center' className='view-summary-wrapper'>
                {openSummary ?
                    <Button variant="text" onClick={() => setOpenSummary(false)}>Hide Summary<KeyboardArrowUpIcon fontSize="large" /></Button>
                    :
                    <Button variant="text" onClick={() => setOpenSummary(true)}>View Summary<KeyboardArrowDownIcon fontSize="large" /></Button>
                }
            </Box>

            <Collapse in={openSummary} timeout="auto">
                <Summary jsonString={props.jsonString} />
            </Collapse>

            {isPackage ?
                <Container align='center'>
                    <CircularProgress className='circular-progress' size='10rem' />
                    <Typography variant="h3">
                        Processing...
                    </Typography>
                </Container>
                :
                <div className="buttons-group">
                    <Button variant="outlined" display='block' onClick={() => props.changeState('UPLOAD')}>New Conversion</Button>
                    <Button variant="contained" onClick={convertToPackage}>Next</Button>
                </div>
            }
        </Container>
    );
}

export default PreviewQuestions;
