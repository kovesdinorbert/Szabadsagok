import React from 'react';
import BlockUi from 'react-block-ui';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dialog } from 'primereact/dialog';

export const PageLoading = (props:any) => 
<Dialog header="Header" onHide={() => {}} visible={props.show} style={{ width: '50vw' }} footer={<></>}>
  <BlockUi tag="div" blocking={true}>
      <ProgressSpinner />
  </BlockUi>
</Dialog>