import React from "react";
import { InputTextAreaModel } from "./InputTextAreaModel";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InputTextarea } from 'primereact/inputtextarea';

import 'primeicons/primeicons.css';

export interface IState {
  touched: boolean;
  value: string;
}

export class InputTextArea extends React.Component<any, IState>{

  public state: IState = { touched: false, value: "" };
  public errors = { required : true, minLength : true };

  constructor(props: any) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.keyPress = this.keyPress.bind(this);
    this.validate = this.validate.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.validateRequired = this.validateRequired.bind(this);
    this.validateLength = this.validateLength.bind(this);
  }

  componentDidMount() {
    this.setState({value: this.props.value}, () => {
      this.validate();
    });
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({value: event.target.value}, () => {
      this.validate();
      const isValid = !this.errors.required && !this.errors.minLength;
      this.props.onInputValueChange(this.state.value, isValid);
    });
  };

  keyPress(e: any) {
    if (this.props.enterPressed && e.keyCode == 13) {
      this.props.enterPressed();
    }
  }

  validate() {
    this.errors ={
      required: this.validateRequired(),
      minLength: this.validateLength()
    }
  }

  validateRequired(): boolean {
    return this.props.config.required && this.state.value === "";
  }
  validateLength(): boolean {
    return this.props.config.minLength && !(this.state.value.length >= this.props.config.minLength);
  }

  handleBlur() {
    this.setState({
      touched: true,
    });
  }

  public render() {
    let conf: InputTextAreaModel = this.props.config;
    let errors = this.errors;

    return (
      <div className={this.state.touched && (errors.required) ? "MuiFormControl-fullWidth validation-error" : "MuiFormControl-fullWidth"}>
        {conf.label !== undefined ? (
          <label
            htmlFor={conf.id ? conf.id : "input_field"}
            className={this.props.config.required ? 'required-label' : ''}
          >
            {conf.label}
          </label>
        ) : null}
        {conf && conf.icon ? <i className="{conf.icon}"></i> : <></>}
        <InputTextarea
          classes={{
          }}
          onBlur={this.handleBlur}
          value={this.state.value}
          onChange={this.handleChange}
          onKeyUp={this.keyPress}
          rows={conf.rows ? conf.rows : 5}
          cols={conf.cols ? conf.cols : 30}
          id={conf.id ? conf.id : "input_field"}
          type={conf.type}
          // endAdornment={conf.icon ? <FontAwesomeIcon className="login-brand-icon" icon={conf.icon.icon} /> : <></>}
          {...conf.otherProps}
        />
        {this.state.touched && errors.required ? <div className="validation-error-message">A mező kitöltése kötelező</div> : <></>}
        {this.state.touched && errors.minLength ? <div className="validation-error-message">Minimális karakterszám: {this.props.config.minLength}</div> : <></>}
      </div>
    );
  }
}

export default InputTextArea