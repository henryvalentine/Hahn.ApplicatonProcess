import * as React from 'react';
import { Container } from 'reactstrap';
import { withRouter } from "react-router";
import { Redirect } from "react-router";
import * as AuthStore from "../store/Auth";
import { connect } from "react-redux";
import { ApplicationState } from '../store';
import NavMenu from './NavMenu';
import Footer from './Footer';
import Loader from './Loader';


type AAppProps =
    AuthStore.AuthState // ... state we've requested from the Redux store
    & typeof AuthStore.actionCreators // ... plus action creators we've requested

class Layout extends React.Component<AAppProps>
{
    render()
    {       

        return <React.Fragment>
            <NavMenu />
            <Container>
                { this.props.children }
            </Container>
            <Footer />
            {
                this.props.show ?
                    <Loader />
                    :
                    ''
            }            
        </React.Fragment>;
    }
}

var component =  connect(
    (state: ApplicationState) => state.auth, // Selects which state properties are merged into the component's props
    AuthStore.actionCreators // Selects which action creators are merged into the component's props
)(Layout as any);

export default withRouter(component);
