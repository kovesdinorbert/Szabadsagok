import React from "react";
// import FormControl from "@material-ui/core/FormControl";
// import InputLabel from "@material-ui/core/InputLabel";
// import Input from "@material-ui/core/Input";
import { InputNumericModel } from "./InputNumericModel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InputNumber } from 'primereact/inputnumber';

// import './style.css';
// import { FormattedMessage } from "react-intl";

export interface IState {
  touched: boolean;
}

export class InputNumeric extends React.Component<any, IState>{

  public state: IState = { touched : false };

  constructor(props: any) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.keyPress = this.keyPress.bind(this);
    this.validate = this.validate.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.validateRequired = this.validateRequired.bind(this);
    this.validateMinLength = this.validateMinLength.bind(this);
    this.validateMaxLength = this.validateMaxLength.bind(this);
  }

  handleChange (event: React.ChangeEvent<HTMLInputElement>){
    this.props.onInputValueChange(event.target.value);
  };

  keyPress(e: any){
    if(this.props.enterPressed && e.keyCode == 13){
      this.props.enterPressed();
    }
 }  

 validate() {
   return {
    required: this.validateRequired(),
    min: this.validateMinLength(),
    max: this.validateMaxLength()
  };
 }

validateRequired() :boolean {
  return this.props.config.required && this.props.value === "";
}

validateMinLength() :boolean {
  return this.props.config.min && this.props.value < this.props.config.min;
}

validateMaxLength() :boolean {
  return this.props.config.max && this.props.value > this.props.config.max;
}

 handleBlur() {
  this.setState({
    touched: true,
  });
}

  public render() {   
      let conf : InputNumericModel = this.props.config;  
      let errors = this.validate();
      
      return (
          <div className={this.state.touched && (errors.required) ? "MuiFormControl-fullWidth validation-error": "MuiFormControl-fullWidth"}>
            {conf.label !== undefined ? (
              <label
                htmlFor={conf.id ? conf.id : "input_field"}
                className={this.props.config.required ? 'required-label' : ''}
              >
                {conf.label}
              </label>
            ) : null}
            {conf && conf.icon ? <FontAwesomeIcon className="login-brand-icon" icon={conf.icon.icon} /> :  <></>}
            <InputNumber
              classes={{
              }}
              onBlur={this.handleBlur}
              value={this.props.value}
              onValueChange={this.handleChange}
              onKeyUp={this.keyPress}
              // min={conf.min ? conf.min : null} 
              // max={conf.max ? conf.max : null} 
              id={conf.id ? conf.id : "input_field"}
              type={conf.type}
              // endAdornment={conf.icon ? <FontAwesomeIcon className="login-brand-icon" icon={conf.icon.icon} /> : <></>}
              {...conf.otherProps}
            />
            {this.state.touched && errors.required ?<div className="validation-error-message">A mező kitöltése kötelező</div> : <></>}
            {/* {this.state.touched && errors.email ?<div className="validation-error-message">Nem érvényes email cím</div> : <></>} */}
            {this.state.touched && errors.min ?<div className="validation-error-message">Minimális érték: {this.props.config.min}</div> : <></>}
            {this.state.touched && errors.max ?<div className="validation-error-message">Maximális érték: {this.props.config.max}</div> : <></>}
          </div>
      );
    }
}

export default InputNumeric