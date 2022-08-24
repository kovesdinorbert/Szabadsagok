import * as React from 'react';
import { Route } from 'react-router';
import Layout from './components/Layout';

import 'primereact/resources/themes/nova/theme.css';
import 'primereact/resources/primereact.min.css';
// import 'primeicons/primeicons.css';

import AuthenticationService from '../src/services/authentication.service';
import * as UserStore from './store/AppContextStore';

import './custom.css'
import HolidayPage from './components/Pages/HolidayPage/HolidayPage';
import UserPage from './components/Pages/UserPage/UserPage';
import ConfigYearPage from './components/Pages/ConfigYearPage/ConfigYearPage';
import HomePage from './components/Pages/HomePage/HomePage';
import TempLoginPage from './components/Pages/TempLoginPage/templogin';
import { RoleEnum } from './enums/RoleEnum';
import { connect } from 'react-redux';


function Appli(props: any) {
    const authenticationService: AuthenticationService = new AuthenticationService();
    return(
    <Layout>
        {authenticationService.isInRole(props.token,RoleEnum[RoleEnum.Admin]+'') ? console.log('OK') : console.log('NOK')}
        <Route exact path='/' component={HomePage} />
        <Route exact path='/request' component={HolidayPage} />
        <Route path='/users' component={UserPage} />
        <Route path='/configyear' component={ConfigYearPage} />
        <Route path='/login' component={TempLoginPage} />
    </Layout>)
};

function mapStateToProps(state :any) {
    const token = state.appcontext.token;
    return {
      token
    };
  }

export default connect(
    mapStateToProps,
    UserStore.actionCreators
  )(Appli);