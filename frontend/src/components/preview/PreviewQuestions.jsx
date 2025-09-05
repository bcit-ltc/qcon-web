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

function PreviewQuestions(props) {
    const [openSummary, setOpenSummary] = useState(false);
    const [openAccordion, setOpenAccordion] = useState(false);
    const parsedJson = JSON.parse(props.jsonString)["data"];
    let listStyle;
    switch (parsedJson.enumeration) {
        case 1:
            listStyle = 'decimal';
            break;
        case 2:
            listStyle = 'lower-roman';
            break;
        case 3:
            listStyle = 'upper-roman';
            break;
        case 4:
            listStyle = 'lower-alpha';
            break;
        case 5:
            listStyle = 'upper-alpha';
            break;
        case 6:
            listStyle = 'none';
            break;
        default:
            listStyle = 'lower-alpha';
            break;
    }
    // let totalSections = 0;
    let totalQuestions = 0;
    let isStart = true;
    parsedJson.sections.forEach((section, sectionIndex) => {
        // if (section.is_main_content == false) {
        //     totalSections += 1;
        // }
        totalQuestions += section.questions.length;

    });

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
        let newJson = { ...parsedJson };
        let sections = newJson.sections;
        let newTotalQuestions = totalQuestions;
        for (let sectionIndex = sections.length - 1; sectionIndex >= 0; sectionIndex--) {


            let newCurrentQuestions = sections[sectionIndex].questions;
            for (let questionIndex = newCurrentQuestions.length - 1; questionIndex >= 0; questionIndex--) {
                newTotalQuestions--;
                if (newTotalQuestions >= nextFirstQuestionIndex && newTotalQuestions <= nextLastQuestionIndex) {
                    // console.log(newTotalQuestions);
                } else {
                    newCurrentQuestions.splice(questionIndex, 1);
                }
            }
            if (newCurrentQuestions.length === 0) {
                sections.splice(sectionIndex, 1);
            }
        }

        return newJson;
    };

    const renderQuestion = (question, index, listStyle) => {
        if (!question.error) {
            let currentNumber = index + 1;
            // eslint-disable-next-line
            switch (question.questiontype) {
                case 'MC':
                    return <MultipleChoice question={question} key={"question-" + currentNumber} questionIndex={currentNumber} listStyle={listStyle} />;
                case 'TF':
                    return <TrueFalse question={question} key={"question-" + currentNumber} questionIndex={currentNumber} listStyle={listStyle} />;
                case 'FIB':
                case 'FMB':
                    return <FillInBlanks question={question} key={"question-" + currentNumber} questionIndex={currentNumber} />;
                case 'MS':
                case 'MR':
                    return <MultiSelect question={question} key={"question-" + currentNumber} questionIndex={currentNumber} listStyle={listStyle} />;
                case 'MAT':
                case 'MT':
                    return <Matching question={question} key={"question-" + currentNumber} questionIndex={currentNumber} />;
                case 'ORD':
                    return <Ordering question={question} key={"question-" + currentNumber} questionIndex={currentNumber} />;
                case 'WR':
                case 'E':
                    return <WrittenResponse question={question} key={"question-" + currentNumber} />;
            }
        }
    };

    const expandQuestions = (event) => {
        let buttonEl = event.target;
        let nextSibling = buttonEl.nextElementSibling; // .question-wrapper
        let accordions = nextSibling.getElementsByClassName("wrapper-question-accordion");

        if (openAccordion) {
            for (let accordion of accordions) {
                if (accordion.classList.contains("Mui-expanded")) {
                    accordion.children[0].click();
                }
            }
            setOpenAccordion(false);
        } else {
            for (let accordion of accordions) {
                if (!accordion.classList.contains("Mui-expanded")) {
                    accordion.children[0].click();
                }
            }
            setOpenAccordion(true);
        }

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

        let accordionSummary = document.querySelectorAll('.accordion-inner-wrapper>.MuiAccordion-root>.MuiAccordionSummary-root');
        var summaryArray = [...accordionSummary];
        summaryArray.forEach(summary => {
            if (summary.getAttribute("aria-expanded") === "true") {
                summary.click();
            }
        });
        setOpenAccordion(false);
    };

    const onChangePagination = (event, selectedPage) => {
        currentFirstQuestionIndex = selectedPage * questionsPerPage - questionsPerPage;
        currentLastQuestionIndex = currentFirstQuestionIndex + questionsPerPage - 1;

        if (currentFirstQuestionIndex < totalQuestions) {
            setCurrentPage(selectedPage);
        } else {
            setCurrentPage(1);
        }

        let accordionSummary = document.querySelectorAll('.accordion-inner-wrapper>.MuiAccordion-root>.MuiAccordionSummary-root');
        var summaryArray = [...accordionSummary];
        summaryArray.forEach(summary => {
            if (summary.getAttribute("aria-expanded") === "true") {
                summary.click();
            }
        });
        setOpenAccordion(false);
    };

    useEffect(() => {
        setCurrentQuestions(processQuestions(currentFirstQuestionIndex, currentLastQuestionIndex));
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
                            <div className="root-section-wrapper accordion-wrapper" key={"wrapper-section-" + (sectionIndex + 1)}>
                                <Button variant="contained" className="accordion-side-button" onClick={expandQuestions}></Button>
                                <div className="accordion-inner-wrapper">
                                    {
                                        section.questions.map((question, questionIndex) => (
                                            <Fragment key={"wrapper-root-question-" + (questionIndex + 1)}>
                                                <Accordion className={"wrapper-question-accordion"}>
                                                    <QuestionHeader question={question} />
                                                    {renderQuestion(question, questionIndex, listStyle)}
                                                </Accordion>

                                            </Fragment>
                                        ))
                                    }
                                </div>
                            </div>
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
                                <div className="sub-section-wrapper accordion-wrapper">

                                    <Button variant="contained" className="accordion-side-button" color="info" onClick={expandQuestions}></Button>
                                    <div className="accordion-inner-wrapper">
                                        {
                                            section.questions.map((question, questionIndex) => (
                                                <Fragment key={"wrapper-section-question-" + (questionIndex + 1)}>
                                                    <Accordion className={"wrapper-question-accordion"}>
                                                        <QuestionHeader question={question} />
                                                        {renderQuestion(question, questionIndex, listStyle)}
                                                    </Accordion>

                                                </Fragment>
                                            ))
                                        }
                                    </div>
                                </div>
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
                <Summary />
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
