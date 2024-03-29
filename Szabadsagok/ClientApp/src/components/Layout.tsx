import * as React from 'react';
import { Container } from 'reactstrap';
import { ApplicationState } from '../store';
import NavMenu from './NavMenu';
import * as AppContextStore from '../store/AppContextStore';
import { connect } from 'react-redux';
import { PageLoading } from './Common/PageLoading/PageLoading';
import Toastr from './Common/Toastr/Toastr';

class Layout extends React.PureComponent<any, { children?: React.ReactNode }> {
    public render() {
        return (
            <React.Fragment>
                <PageLoading show={this.props.loading}></PageLoading>
                <Toastr toastr={this.props.message} />
                <NavMenu />
                <Container>
                    {this.props.children}
                </Container>
            </React.Fragment>
        );
    }
}


export default connect(
    (state: ApplicationState) => state.appcontext,
    AppContextStore.actionCreators
  )(Layout as any);