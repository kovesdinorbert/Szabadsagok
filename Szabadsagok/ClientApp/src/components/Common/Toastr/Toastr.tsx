import React, { RefObject } from 'react';
import { Toast, ToastMessage } from 'primereact/toast';
    
class Toastr extends React.PureComponent<any> {
  toast: RefObject<Toast>;

  constructor(props: any) {
    super(props);

    this.toast = React.createRef();
  }

  componentDidUpdate() {
    this.showToast();
  }

  private showToast() {
      if (this.props.toastr && this.toast.current !== null) {
        const p : ToastMessage = this.props.toastr;
        this.toast.current.show({ severity: p.severity, summary: p.summary, detail: p.detail, life: 3000 });
      }
  }

  public render() {
    return (
      <React.Fragment>
        <Toast ref={this.toast} />
      </React.Fragment>
    );
  }
};

export default Toastr

