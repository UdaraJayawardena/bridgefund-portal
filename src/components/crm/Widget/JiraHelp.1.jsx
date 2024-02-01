// import React from 'react';

// class JiraHelp extends React.Component {
//     state = {
//         open: false,
//     };


//     componentDidMount() {

//     }


//     render() {
//         return (
//             <div>

//             </div>
//         )
//     }
// }

// export default JiraHelp;

import React from 'react';

class JiraHelp extends React.Component {

    constructor(props) {
        super(props);
        this._ref = React.createRef();
    }
    render() {

        // const element = document.getElementById("widget");
        // if(element){
        //     element.setAttribute('data-jsd-embedded', 'true');
        //     element.setAttribute('data-base-url', 'https://jsd-widget.atlassian.com');
        //     element.setAttribute('data-key', '4f196b26-806e-4fbf-ae3f-08e0dbafa90a');
        // }
        return (
            // <div class="tradingview-widget-container" ref={this._ref}>
            //     <div class="tradingview-widget-container__widget"></div>
            // <a class="twitter-timeline" 
            //     href={'https://jsd-widget.atlassian.com/assets/embed.js'} 
            //     data-base-url={'https://jsd-widget.atlassian.com'} 
            //     data-key={'4f196b26-806e-4fbf-ae3f-08e0dbafa90a'} > 

            //     Help

            // </a>
            // </div>

            // <div ref={this._ref}>
            //     <div 
            //         id="app"
            //         src="https://jsd-widget.atlassian.com/assets/embed.js" 
            //         data-base-url='https://jsd-widget.atlassian.com' 
            //         data-key='4f196b26-806e-4fbf-ae3f-08e0dbafa90a'>


            //     </div>
            // </div>
            <div ref={this._ref}>
                <div id="widget-div"></div>
                {/* <script id="widget" src="https://jsd-widget.atlassian.com/assets/embed.js" data-jsd-embedded data-base-url="https://jsd-widget.atlassian.com" data-key="4f196b26-806e-4fbf-ae3f-08e0dbafa90a"></script> */}
            </div>
        );
    }

    componentDidUpdate() {

        // const element = document.getElementById("widget");
        // element.setAttribute('data-base-url', 'https://jsd-widget.atlassian.com');
        // element.setAttribute('data-key', '4f196b26-806e-4fbf-ae3f-08e0dbafa90a');
    }
    componentDidMount() {
        // const script = document.createElement('script');
        // script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js'
        // script.async = true;
        // script.innerHTML = /* JSON-ENCODED SETTINGS STRING FROM EMBED CODE */
        // this._ref.current.appendChild(script);

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

        // const props = {"data-jsd-embedded":true, "data-base-url":"https://jsd-widget.atlassian.com", "data-key": "4f196b26-806e-4fbf-ae3f-08e0dbafa90a" };
        // const script = document.createElement('script', props, document.getElementById("widget-div"));
        // script.ref = 'widget'
        // script.id = 'widget'
        // script.src = 'https://jsd-widget.atlassian.com/assets/embed.js'
        // script.async = true;
        // script.innerHTML = /* JSON-ENCODED SETTINGS STRING FROM EMBED CODE */
        // this._ref.current.appendChild(script);
    }

}

export default JiraHelp;
