import { FontAwesomeIconProps } from '@fortawesome/react-fontawesome';

export class InputTextAreaModel {
    label?: string;
    id?: string;
    minLength?: number;
    rows?: number;
    cols?: number;
    required?: boolean;
    // email?: boolean;
    icon?: FontAwesomeIconProps;
    type?: string;
    otherProps?: any;
  }