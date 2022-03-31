import * as React from 'react';
import { Route } from 'react-router';
import Layout from './components/Layout';

import 'primereact/resources/themes/nova/theme.css';
import 'primereact/resources/primereact.min.css';
// import 'primeicons/primeicons.css';

import './custom.css'
import IncomingHolidayPage from './components/Pages/IncomingHolidaysPage/IncomingHolidayPage';
import HolidayPage from './components/Pages/HolidayPage/HolidayPage';
import UserPage from './components/Pages/UserPage/UserPage';
import ConfigYearPage from './components/Pages/ConfigYearPage/ConfigYearPage';
import HomePage from './components/Pages/HomePage/HomePage';

export default () => (
    <Layout>
        <Route exact path='/' component={HomePage} />
        <Route exact path='/request' component={HolidayPage} />
        <Route path='/incoming' component={IncomingHolidayPage} />
        <Route path='/users' component={UserPage} />
        <Route path='/configyear' component={ConfigYearPage} />
    </Layout>
);
