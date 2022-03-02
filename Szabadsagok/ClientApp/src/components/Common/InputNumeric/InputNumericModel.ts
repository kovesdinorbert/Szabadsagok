import { FontAwesomeIconProps } from '@fortawesome/react-fontawesome';

export class InputNumericModel {
    label?: string;
    id?: string;
    min?: number;
    max?: number;
    required?: boolean;
    icon?: FontAwesomeIconProps;
    type?: string;
    otherProps?: any;
  }