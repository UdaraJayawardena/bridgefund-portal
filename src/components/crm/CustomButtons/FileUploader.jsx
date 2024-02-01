import React, { forwardRef } from 'react';
import CustomButton from "components/CustomButtons/Button.jsx";
import Tooltip from "@material-ui/core/Tooltip";

const Button = forwardRef((props, ref) => {

  const { id, name, onClick, color, label, styles } = props;

  let customeStyles = styles ? styles : {};

  return (
    <CustomButton type="button" color={color} style={customeStyles}
      data-owner={id} id={id} name={name} data-name={name} onClick={onClick} >{label}</CustomButton>
  )
});

const FileUploader = ((props) => {

  let { id, name, color, label, docuemnt, documentRef, accept, tooltipPlacement, tooltipId, onChange } = props;

  const refForDocument = documentRef ? documentRef : React.createRef();

  accept = accept ? accept : '.pdf';

  tooltipPlacement = tooltipPlacement ? tooltipPlacement : 'top';

  tooltipId = tooltipId ? tooltipId : 'tooltip-top';
  
  color = color ? color : 'info';

  return (
    <React.Fragment>
      <Tooltip id={tooltipId} title={docuemnt ? docuemnt.name : ''} placement={tooltipPlacement} >
        <Button onClick={() => { refForDocument.current.click(); }} id={id} name={name} label={label} color={color} />
      </Tooltip>
      <input type="file" key={Math.random()} ref={refForDocument} style={{ display: 'none' }} accept={accept} data-owner={id} id={id} name={name} data-name={name} onChange={onChange} />
    </React.Fragment>
  )
});

export default FileUploader;