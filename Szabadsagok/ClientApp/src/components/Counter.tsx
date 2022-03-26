import { faTurkishLiraSign } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { ApplicationState } from '../store';
import * as CounterStore from '../store/Counter';
import * as UserStore from '../store/UserStore';
// import { initialState } from '../store/UserStore';
import IncomingHolidayPage from './Pages/IncomingHolidaysPage/IncomingHolidayPage';

type CounterProps =
    UserStore.UserState &
    typeof UserStore.actionCreators &
    RouteComponentProps<{}>;

class Counter extends React.PureComponent<CounterProps> {

    constructor(props: any) {
        super(props);
    }

    public render() {
        return (
            <React.Fragment>
                <h1>Counter</h1>

                <IncomingHolidayPage />
                {/* <IncomingHolidayPage></IncomingHolidayPage>  */}
                 <p aria-live="polite">Current count: <strong>{this.props.token}</strong></p>


                {/*<button type="button"
                    className="btn btn-primary btn-lg"
                    onClick={() => { this.props.increment(); }}>
                    Increment
                </button> */}
            </React.Fragment>
        );
    }
};

export default connect(
    (state: ApplicationState) => state.user,
    UserStore.actionCreators
)(Counter);
