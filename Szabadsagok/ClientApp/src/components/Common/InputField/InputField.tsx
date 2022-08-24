import React from "react";
import { InputFieldModel } from "./InputFieldModel";
import { InputText } from 'primereact/inputtext';

import 'primeicons/primeicons.css';

export interface IState {
  touched: boolean;
  value: string;
}

export class InputField extends React.Component<any, IState>{

  public state: IState = { touched: false, value: "" };
  public errors = { required : true, email : true, minLength : true };

  constructor(props: any) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.keyPress = this.keyPress.bind(this);
    this.validate = this.validate.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.validateRequired = this.validateRequired.bind(this);
    this.validateEmail = this.validateEmail.bind(this);
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
      const isValid = !this.errors.required && !this.errors.email && !this.errors.minLength;
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
      email: this.validateEmail(),
      minLength: this.validateLength()
    }
  }

  validateRequired(): boolean {
    return this.props.config.required && this.state.value === "";
  }
  validateEmail(): boolean {
    return this.props.config.email && !(/\S+@\S+\.\S+/.test(this.state.value));
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
    let conf: InputFieldModel = this.props.config;
    let errors = this.errors;

    return (
      <div className={this.state.touched && (errors.email || errors.required) ? "MuiFormControl-fullWidth validation-error" : "MuiFormControl-fullWidth"}>
        {conf.label !== undefined ? (
          <label
            htmlFor={conf.id ? conf.id : "input_field"}
            className={this.props.config.required ? 'required-label' : ''}
          >
            {conf.label}
          </label>
        ) : null}
        {conf && conf.icon ?<i className="{conf.icon}"></i> : <></>}
        <InputText
          classes={{
          }}
          autoComplete="off"
          onBlur={this.handleBlur}
          value={this.state.value}
          onChange={this.handleChange}
          onKeyUp={this.keyPress}
          id={conf.id ? conf.id : "input_field"}
          type={conf.type}
          {...conf.otherProps}
        />
        {this.state.touched && errors.required ? <div className="validation-error-message">A mező kitöltése kötelező</div> : <></>}
        {this.state.touched && errors.email ? <div className="validation-error-message">Nem érvényes email cím</div> : <></>}
        {this.state.touched && errors.minLength ? <div className="validation-error-message">Minimális karakterszám: {this.props.config.minLength}</div> : <></>}
      </div>
    );
  }
}

export default InputField