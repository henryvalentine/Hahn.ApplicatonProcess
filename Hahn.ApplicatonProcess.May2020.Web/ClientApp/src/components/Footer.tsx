import * as React from "react";

export default class Footer extends React.Component 
{
    render() {
        return <footer className="footer text-center">
            <p>Copyright (c) {new Date().getFullYear()} - <a href="https://www.hahn-softwareentwicklung.de/Datenschutz.html">Hahn Softwareentwicklung</a></p>
        </footer>;
    }
}