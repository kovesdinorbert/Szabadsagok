import React from "react";
// import FormControl from "@material-ui/core/FormControl";
// import InputLabel from "@material-ui/core/InputLabel";
// import Input from "@material-ui/core/Input";
import { InputTextAreaModel } from "./InputTextAreaModel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InputTextarea } from 'primereact/inputtextarea';

// import './style.css';
// import { FormattedMessage } from "react-intl";

export interface IState {
  touched: boolean;
}

export class InputTextArea extends React.Component<any, IState>{

  public state: IState = { touched : false };

  constructor(props: any) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.keyPress = this.keyPress.bind(this);
    this.validate = this.validate.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.validateRequired = this.validateRequired.bind(this);
    // this.validateEmail = this.validateEmail.bind(this);
    this.validateLength = this.validateLength.bind(this);
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
    // email: this.validateEmail(),
    minLength: this.validateLength()
  };
 }

validateRequired() :boolean {
  return this.props.config.required && this.props.value === "";
}
// validateEmail() :boolean {
//   return this.props.config.email && !(/\S+@\S+\.\S+/.test(this.props.value));
// }
validateLength() :boolean {
  return this.props.config.minLength && !(this.props.value.length >= this.props.config.minLength);
}

 handleBlur() {
  this.setState({
    touched: true,
  });
}

  public render() {   
      let conf : InputTextAreaModel = this.props.config;  
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
            <InputTextarea
              classes={{
              }}
              onBlur={this.handleBlur}
              value={this.props.value}
              onChange={this.handleChange}
              onKeyUp={this.keyPress}
              rows={conf.rows ? conf.rows : 5} 
              cols={conf.cols ? conf.cols : 30} 
              id={conf.id ? conf.id : "input_field"}
              type={conf.type}
              // endAdornment={conf.icon ? <FontAwesomeIcon className="login-brand-icon" icon={conf.icon.icon} /> : <></>}
              {...conf.otherProps}
            />
            {this.state.touched && errors.required ?<div className="validation-error-message">A mező kitöltése kötelező</div> : <></>}
            {/* {this.state.touched && errors.email ?<div className="validation-error-message">Nem érvényes email cím</div> : <></>} */}
            {this.state.touched && errors.minLength ?<div className="validation-error-message">Minimális karakterszám: {this.props.config.minLength}</div> : <></>}
          </div>
      );
    }
}

export default InputTextArea