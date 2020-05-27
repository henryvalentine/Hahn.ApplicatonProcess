import "../styles/loader.css";
import * as React from "react";
import * as AuthStore from "../store/Auth";
import { connect } from "react-redux";
import { ApplicationState } from '../store';

type AuthProps =
    AuthStore.AuthState // ... state we've requested from the Redux store
    & typeof AuthStore.actionCreators // ... plus action creators we've requested

class Loader extends React.Component<AuthProps>
{
    //componentWillReceiveProps(nextProps: any)
    //{
    //    if (nextProps.show)
    //    {
    //        document.getElementById("loder")?.style.display = "block";
    //    }
    //    else
    //    {
    //        document.getElementById("loder")?.style.display = "none";
    //    }
    //    console.log(this.props.show);
    //}
    public render()
    {
        
        return <div id="loder" className="loader-bg">
                   <div className="sk-circle">
                       <div className="sk-circle1 sk-child"></div>
                       <div className="sk-circle2 sk-child"></div>
                       <div className="sk-circle3 sk-child"></div>
                       <div className="sk-circle4 sk-child"></div>
                       <div className="sk-circle5 sk-child"></div>
                       <div className="sk-circle6 sk-child"></div>
                       <div className="sk-circle7 sk-child"></div>
                       <div className="sk-circle8 sk-child"></div>
                       <div className="sk-circle9 sk-child"></div>
                       <div className="sk-circle10 sk-child"></div>
                       <div className="sk-circle11 sk-child"></div>
                       <div className="sk-circle12 sk-child"></div>
                   </div>
               </div>;
    }
}

export default connect(
    (state: ApplicationState) => state.auth, // Selects which state properties are merged into the component's props
    AuthStore.actionCreators // Selects which action creators are merged into the component's props
)(Loader as any);