import * as React from 'react';
import { withRouter } from "react-router";
import { NavLink } from "react-router-dom";
import './NavMenu.css';
import * as AuthStore from "../store/Auth";
import { logo } from '../img';
import { connect } from "react-redux";
import { ApplicationState } from '../store';
import { Navbar } from 'reactstrap';
import { Menu } from 'antd';
import { OrderedListOutlined  } from '@ant-design/icons/lib';

type AppProps =
    AuthStore.AuthState // ... state we've requested from the Redux store
    & typeof AuthStore.actionCreators // ... plus action creators we've requested

class NavMenu extends React.Component<AppProps>
{
    public state = { isOpen: false, current: '' };

    handleClick(e: { key: any; })
    {
        this.setState({
            current: e.key,
        });
    }

    render()
    {  
        return <header>
            <Navbar className="navbar-expand-sm navbar-toggleable-sm border-bottom box-shadow mb-3 c-header" light>
                    <div className="navbar navbar-default">
                        <div className="container-fluid">
                            <div className="lgg">
                                <NavLink exact to={'/'} className="navbar-brand">
                                <img className="logo2" src={logo} alt="" />
                                </NavLink>
                        </div>                       
                        <Menu className="ant-mn c-header" onClick={(e) => this.handleClick(e)} selectedKeys={[this.state.current]} mode="horizontal">                            
                            <Menu.Item key="swagger">
                                <OrderedListOutlined />
                                <span> <a href="/swagger/ui/index.html">Api Documentation</a></span>
                            </Menu.Item>  
                        </Menu>               
                        </div>
                    </div>
                </Navbar>
            </header>;
    }

}

var component = connect(
    (state: ApplicationState) => state.auth, // Selects which state properties are merged into the component's props
    AuthStore.actionCreators // Selects which action creators are merged into the component's props
)(NavMenu as any);

export default withRouter(component);