import React from "react";
import { InputNumericModel } from "./InputNumericModel";
import { InputNumber } from 'primereact/inputnumber';


import 'primeicons/primeicons.css';

export interface IState {
  touched: boolean;
  value: string;
}

export class InputNumeric extends React.Component<any, IState>{

  public state: IState = { touched: false, value: "" };
  public errors = { required : true, min : true, max: true };

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
  componentDidMount() {
    this.setState({value: this.props.value}, () => {
      this.validate();
    });
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({value: event.target.value}, () => {
      this.validate();
      const isValid = !this.errors.required && !this.errors.min && !this.errors.max;
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
      min: this.validateMinLength(),
      max: this.validateMaxLength()
    }
  }

  validateRequired(): boolean {
    return this.props.config.required && this.state.value === "";
  }

  validateMinLength(): boolean {
    return this.props.config.min && this.state.value < this.props.config.min;
  }

  validateMaxLength(): boolean {
    return this.props.config.max && this.state.value > this.props.config.max;
  }

  handleBlur() {
    this.setState({
      touched: true,
    });
  }

  public render() {
    let conf: InputNumericModel = this.props.config;
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
        <InputNumber
          classes={{
          }}
          onBlur={this.handleBlur}
          value={this.state.value}
          onValueChange={this.handleChange}
          onKeyUp={this.keyPress}
          id={conf.id ? conf.id : "input_field"}
          type={conf.type}
          // endAdornment={conf.icon ? <FontAwesomeIcon className="login-brand-icon" icon={conf.icon.icon} /> : <></>}
          {...conf.otherProps}
        />
        {this.state.touched && errors.required ? <div className="validation-error-message">A mező kitöltése kötelező</div> : <></>}
        {this.state.touched && errors.min ? <div className="validation-error-message">Minimális érték: {this.props.config.min}</div> : <></>}
        {this.state.touched && errors.max ? <div className="validation-error-message">Maximális érték: {this.props.config.max}</div> : <></>}
      </div>
    );
  }
}

export default InputNumeric