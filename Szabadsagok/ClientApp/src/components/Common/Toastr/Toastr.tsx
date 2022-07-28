import React, { useEffect, useRef } from 'react';
import { Toast, ToastMessage } from 'primereact/toast';
    
function Toastr(props: any) {
  const toast = useRef<Toast>(null);

  useEffect(() => {
    showToast();
  });

  const showToast = () => {
      if (props.toastr && toast.current) {
        const p : ToastMessage = props.toastr;
        toast.current.show({ severity: p.severity, summary: p.summary, detail: p.detail, life: 3000 });
      }
  }

  return (
      <React.Fragment>
        <Toast ref={toast} />
      </React.Fragment>
    );
};

export default Toastr

