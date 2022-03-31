import * as React from 'react';
import { Container } from 'reactstrap';
import { ApplicationState } from '../store';
import NavMenu from './NavMenu';
import * as AppContextStore from '../store/AppContextStore';
import { connect } from 'react-redux';
import { PageLoading } from './Common/PageLoading/PageLoading';

class Layout extends React.PureComponent<any, { children?: React.ReactNode }> {
    public render() {
        return (
            <React.Fragment>
                <PageLoading show={this.props.loading}></PageLoading>
                <NavMenu />
                <Container>
                    {this.props.children}
                </Container>
            </React.Fragment>
        );
    }
}


export default connect(
    (state: ApplicationState) => state.appContext,
    AppContextStore.actionCreators
  )(Layout as any);