import { FontAwesomeIconProps } from '@fortawesome/react-fontawesome';

export class InputFieldModel {
    label?: string;
    id?: string;
    minLength?: number;
    required?: boolean;
    email?: boolean;
    icon?: FontAwesomeIconProps;
    type?: string;
    otherProps?: any;
  }