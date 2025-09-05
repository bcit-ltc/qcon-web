import React, { useMemo, useState, Fragment } from 'react';
import { useDropzone } from 'react-dropzone';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import DescriptionIcon from '@mui/icons-material/Description';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import HelpIcon from '@mui/icons-material/Help';
import Tooltip from '@mui/material/Tooltip';
import IntroBlurb from '../blurb/IntroBlurb';

const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#b3b3b3',
    borderStyle: 'dashed',
    backgroundColor: '#f2f2f2',
    color: 'black',
    outline: 'none',
    transition: 'border .24s ease-in-out'
};

const activeStyle = {
    borderColor: '#3399ff',
    backgroundColor: 'cce6ff'
};

const acceptStyle = {
    borderColor: '#00994f',
    backgroundColor: '#ccffe6'
};

const rejectStyle = {
    borderColor: '#ff1744',
    backgroundColor: '#ffb3c2'
};

function Homepage(props) {
    const [wordFile, setWordFile] = useState(null);
    const [additionalOptions, setAdditionalOptions] = useState(null);
    const [randomizeAnswer, setRandomizeAnswer] = useState(null);
    const [isEnum, setIsEnum] = useState(null);
    const [answerEnum, setAnswerEnum] = useState(4);
    const [customFolder, setCustomFolder] = useState(null);
    const [folderName, setFolderName] = useState('assessment-assets');

    const onDrop = (acceptedFiles) => {
        // setwordFilename(acceptedFiles[0].name);
        setWordFile(acceptedFiles[0]);
        props.setWordFile(acceptedFiles[0]);
        props.updateFileName(acceptedFiles[0].name);
        // console.log("ondrop");
    };

    const checkAdditionalOptions = () => {
        let qconadditionaloptions = JSON.parse(sessionStorage.getItem('qconadditionaloptions')) !== null ? JSON.parse(sessionStorage.getItem('qconadditionaloptions')) : {};

        if (randomizeAnswer) {
            qconadditionaloptions['randomize_answer'] = randomizeAnswer;
        }

        if (isEnum) {
            qconadditionaloptions['enumeration'] = answerEnum;
        }

        if (customFolder) {
            qconadditionaloptions['media_folder'] = folderName;
        }

        sessionStorage.setItem('qconadditionaloptions', JSON.stringify(qconadditionaloptions));
    };

    const uploadWordFile = () => {
        // console.log("upload clicked in dropzone");
        if (additionalOptions) {
            checkAdditionalOptions();
        }

        props.setSubmitClicked(true);
        props.updateTryConnection(true);
        props.changeState('PROGRESS');
    };

    const removeFile = (event) => {
        event.stopPropagation();
        acceptedFiles.splice(0, 1);
        setWordFile(null);
    };

    const handleAdditionalOptionsCheckbox = (event) => {
        setAdditionalOptions(event.target.checked);
    };

    const handleRandomizeCheckbox = (event) => {
        setRandomizeAnswer(event.target.checked);
    };

    const handleEnumCheckbox = (event) => {
        setIsEnum(event.target.checked);
    };

    const handleSelectEnum = (event) => {
        setAnswerEnum(event.target.value);
    };

    const handleCustomFolderCheckbox = (event) => {
        setCustomFolder(event.target.checked);
    };

    const handleCustomFolderInput = (event) => {
        setFolderName(event.target.value.replace(/[^a-z0-9\-/]/gi, ''));
    };

    const checkJsonString = () => {
        // eslint-disable-next-line
        if (props.jsonString != null && props.jsonString != 'null') {
            // eslint-disable-next-line
            if (JSON.parse(props.jsonString)["data"] != null) {
                return true;
            }
        }
        return false;
    };

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject,
        acceptedFiles
        // rejectedFiles
    } = useDropzone({ onDrop, accept: {'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']} });

    const style = useMemo(() => ({
        ...baseStyle,
        ...(isDragActive ? activeStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [
        isDragActive,
        isDragReject,
        isDragAccept
    ]);

    const removeSessionStorage = () => {
        props.setJsonString(null);
        sessionStorage.removeItem('qconjsonresult');
    };

    return (
        <Container className="homepage-container" maxWidth='md' align='center'>
            <IntroBlurb></IntroBlurb>
            <Box className="dropzone" {...getRootProps({ style })}>
                <input {...getInputProps()} />
                <p>
                    {!isDragActive && "Drag a docx file or click here to choose a file"}
                    {isDragActive && !isDragReject && "Drop docx file here"}
                    {isDragReject && "Wrong file format!"}

                </p>
                {wordFile &&
                    <Fragment>
                        <DescriptionIcon color="primary" fontSize="large"></DescriptionIcon>
                        <p>{wordFile.name}</p>
                        <Button variant="contained" color="secondary" display='block' disabled={!wordFile} onClick={removeFile}>DELETE</Button>
                    </Fragment>
                }
            </Box>

            <FormGroup className='additional-options-form-group'>
                <FormGroup className='additional-options-checkbox'>
                    <FormControlLabel
                        control={<Checkbox color="primary" onChange={handleAdditionalOptionsCheckbox} inputProps={{ 'aria-label': 'Additional Options checkbox' }} />}
                        label='Additional Options' />
                </FormGroup>
                {
                    additionalOptions &&
                    <FormGroup className='additional-options-choices'>
                        <FormControlLabel
                            control={<Checkbox color="primary" onChange={handleRandomizeCheckbox} inputProps={{ 'aria-label': 'randomize answers checkbox' }} />}
                            label={
                                <Fragment>
                                    Randomize answers
                                    <Tooltip
                                        placement="right-start"
                                        aria-label="randomize-answer-tooltip"
                                        interactive="true"
                                        arrow
                                        title={
                                            <Fragment>
                                                <p>Randomize all Multiple Choice & Multi-Select answers unless specified directly in the word document.</p>
                                                <p>Matching & Ordering answers is automatically randomized.</p>
                                            </Fragment>
                                        }>
                                        <HelpIcon color="secondary" fontSize="small"></HelpIcon>
                                    </Tooltip>
                                </Fragment>
                            }
                        />

                        <FormGroup className='answer-enum'>
                            <FormControlLabel
                                control={<Checkbox color="primary" onChange={handleEnumCheckbox} inputProps={{ 'aria-label': 'answer enumeration checkbox' }} />}
                                label={
                                    <Fragment>
                                        Answer Enumeration
                                        <Tooltip
                                            placement="right-start"
                                            aria-label="answer enumerations tooltip"
                                            interactive="true"
                                            arrow
                                            title={
                                                <Fragment>
                                                    <p>This will change the all the answers enumeration on MC, TF, and MS.</p>
                                                </Fragment>
                                            }>
                                            <HelpIcon color="secondary" fontSize="small"></HelpIcon>
                                        </Tooltip>
                                    </Fragment>
                                }
                            />
                            {
                                isEnum &&
                                <FormControlLabel className='answer-enum-select' control={
                                    <Select value={answerEnum} label="enumeration" onChange={handleSelectEnum}>
                                        <MenuItem value={4}>Letters (a,b,c)</MenuItem>
                                        <MenuItem value={5}>Uppercase Letters (A,B,C)</MenuItem>
                                        <MenuItem value={1}>Numbers (1,2,3)</MenuItem>
                                        <MenuItem value={2}>Roman Numerals (i,i,iii)</MenuItem>
                                        <MenuItem value={3}>Uppercase Roman Numerals (I,II,III)</MenuItem>
                                        <MenuItem value={6}>No enumeration</MenuItem>
                                    </Select>
                                } />
                            }
                        </FormGroup>

                        <FormGroup className='custom-folder'>
                            <FormControlLabel
                                control={<Checkbox color="primary" onChange={handleCustomFolderCheckbox} inputProps={{ 'aria-label': 'custom image folder checkbox' }} />}
                                label={
                                    <Fragment>
                                        Custom Image Folder
                                        <Tooltip
                                            placement="right-start"
                                            aria-label="custom folder tooltip"
                                            interactive="true"
                                            arrow
                                            title={
                                                <Fragment>
                                                    <p>This will be the location of the images in the course Manage Files area.</p>
                                                </Fragment>
                                            }>
                                            <HelpIcon color="secondary" fontSize="small"></HelpIcon>
                                        </Tooltip>
                                    </Fragment>
                                }
                            />
                            {
                                customFolder &&
                                <FormControlLabel className='custom-folder-input' control={<TextField onChange={handleCustomFolderInput} value={folderName} />} />
                            }
                        </FormGroup>
                    </FormGroup>
                }

            </FormGroup>
            <div className="buttons-group">
                {checkJsonString() ?
                    <Fragment>
                        <Button variant="outlined" color="secondary" display='block' onClick={removeSessionStorage}>Clear History</Button>
                        <Button variant="outlined" display='block' onClick={() => props.changeState('PREVIEW')}>Previous Conversion</Button>
                    </Fragment> : ""
                }

                <Button variant="contained" color="primary" display='block' disabled={!wordFile} onClick={uploadWordFile}>Upload File</Button>
            </div>
        </Container>
    );
}

export default Homepage;
