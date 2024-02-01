import React from 'react';

class JiraHelp extends React.Component {

    constructor(props) {
        super(props);
        this._ref = React.createRef();
    }
    render() {
        return (
            <div ref={this._ref}>
                {/* <div id="widget-div"></div> */}
                {/* <script id="widget" data-jsd-embedded src="https://jsd-widget.atlassian.com/assets/embed.js" data-base-url="https://jsd-widget.atlassian.com" data-key="4f196b26-806e-4fbf-ae3f-08e0dbafa90a"></script> */}
            </div>
        );
    }

    componentDidMount() {

        // const script = document.createElement('script');
        // script.ref = 'widget'
        // script.id = 'widget'
        // script.src = 'https://jsd-widget.atlassian.com/assets/embed.js'
        // script.async = true;
        // script.innerHTML = /* JSON-ENCODED SETTINGS STRING FROM EMBED CODE */
        // this._ref.current.appendChild(script);

        // // var element = ReactDOM.findDOMNode(this.refs.widget);
        // const element = document.getElementById("widget");
        // element.setAttribute('data-jsd-embedded', 'true');
        // element.setAttribute('data-base-url', 'https://jsd-widget.atlassian.com');
        // element.setAttribute('data-key', '4f196b26-806e-4fbf-ae3f-08e0dbafa90a');
    }

}

export default JiraHelp;
