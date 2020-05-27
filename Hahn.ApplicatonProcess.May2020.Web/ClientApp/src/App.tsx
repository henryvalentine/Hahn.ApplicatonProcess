import * as React from 'react';
import { Route, Redirect } from "react-router";
import Layout from './components/Layout';
import Applicants from './components/Applicants';

import 'antd/dist/antd.css';
import "./styles/main.css";

export default () =>
{
    return <Layout>      
        <Route path='/' component={Applicants} />
        <Route path='/applicants' component={Applicants} />
    </Layout>;
}
