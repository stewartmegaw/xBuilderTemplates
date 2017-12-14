const React = require('react');
/*
Some nice info on the difference between layoutExtended & layoutWrapper
https://medium.com/@franleplant/react-higher-order-components-in-depth-cf9032ee6c3e#.t3r6zwj02
*/

const AppState = require('xbuilder-core/lib/appState');
const PopupMessage = require('xbuilder-core/helpers/bottomPopupMessage');
const param = require("jquery-param");
const parseUrl = require('parse-url');

if(!serverSide)
{     
	require('script-loader!event-pubsub/event-pubsub-browser.js');
	window.emitter = new window.EventPubSub();
}



var uaTests = AppState.getProp('config.browserDetect',[]);
var uaTestFails = [];
if(uaTests.length)
{
	var uaParser = require('ua-parser-js');
	var ua;
	if(!serverSide)
		ua = new uaParser();
	else
		ua = new uaParser(userAgent);
	ua = ua.getResult();


	for(var i = 0; i< uaTests.length; i++)
	{
		var testSet = uaTests[i];
		var passed = true;
		dance:
		for(var j=0; j< testSet.tests.length; j++)
		{
			var test = testSet.tests[j];
			switch(test.type){
				case "lessThan":
					if(!test.browser || test.browser.name == ua.browser.name)
						if(!test.os || test.os.name == ua.os.name)
							if(ua.browser.major && Number(ua.browser.major) < Number(test.version))
							{
								passed = false;
								break dance;
							}
					break;
				case "*":
					if((!test.browser || test.browser.name == ua.browser.name))
					{
						if(!test.os || (test.os.name == ua.os.name))
						{	
							passed = false;
							break dance;
						}
					}
					break;
			}
		}

		if(!passed)
			uaTestFails.push(testSet.msg);
	}
}



import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
var muiThemeOptions = {};
if (serverSide)
      muiThemeOptions.userAgent = userAgent;
const muiTheme = getMuiTheme(muiThemeOptions);


/*
HOC Type 1: Props Proxy
Use this to:
1) Wrap the child in components
2) Manipulate the props
3) Abstract the state
*/
const HOC_PP_layout1 = function(WrappedComponent) {
	var Wrapped = class extends React.Component {
		constructor(props) {
			super(props);
		}
		render() {
			var s = this.state;

			return (
				<span>
					{uaTestFails.length ?
						<div style={{background:'#3a95d2'}} className="browserSupport">
							<div>Weestay sad face :(</div>
							<ul>
								{uaTestFails.map((msg,i)=>{
									return <li key={i} dangerouslySetInnerHTML={{__html:msg}}/>
								})}
								<li>For the best experience please switch to the latest <a style={{color:"white"}} href="https://www.google.com/chrome/browser" target="_blank">Google Chrome</a> (except iOS)</li>
							</ul>
						</div>
					:null}
					<MuiThemeProvider muiTheme={ muiTheme }>
						<WrappedComponent {...this.props} />
					</MuiThemeProvider>
				</span>
			);
		}
	};

	return Wrapped;
}

/*
HOC Type 2: Inheritance Inversion
Use this to:
1) Override methods of the child
2) Render hijacking
3) Set state
*/
const HOC_II_layout1 = function(layout) {
	return HOC_PP_layout1(class extends layout {
		getInitialState(){
            return super.getInitialState ? super.getInitialState() : {};
      	}

		componentDidMount() {
			if(super.componentDidMount)
				super.componentDidMount();

			this.check_message();

			var _this = this;
            emitter.on(
                  'loadingCover',
                  function(o) {
                        _this.setState({loadingCover:o.s});
                        setTimeout(function() {
                               _this.setState({loadingCover:o.s,loadingCover_dark:o.d});
                        },50);
                  }
            );
		}

		getContent(options) {
			var p = this.props;
			options = options || {};

			// Show exception unless its 404
            if(AppState.getProp('exception') && !(p.route.notFound404))
            	return (
	                  <span style={options.errorContainerStyle || {}}>
	                  {AppState.getProp('exception') === true ?
	                        <div style={{padding:'50px 20px',textAlign:'center'}}><h1>Oh no, something went wrong!</h1><h3>We know about the problem and are working to fix it.</h3><h3>Please accept our apologies and check back again soon.</h3></div>
	                  :
	                        <div dangerouslySetInnerHTML={{__html:AppState.getProp('exception')}} />
	                  }
	                  </span>
                  );
            else
	            return <span style={p.route.notFound404 && options.errorContainerStyle ? options.errorContainerStyle : {}}>{p.children}</span>
		}

		getPopupMessage(){
			return <PopupMessage/>
		}

		getLoadingCover(){
			if(this.state.loadingCover)
				return (
					<span>
						<div id="loadingCover" className={this.state.loadingCover_dark?'semi_dark':''} />
						<div id="loadingCoverSpin"/>
					</span>
				);
			else
				return null;
		}

		check_message(){
		    var msg = AppState.getProp('queryParams.msg',false);
		    if(msg)
		    {
          		var parsedUrl = parseUrl(window.location.href);	
          		
			        var query = AppState.getProp('queryParams',{});
			    	if(query.msg)
						delete query.msg;
					history.replaceState({},"", parsedUrl.protocols[0]+'://'+parsedUrl.resource + parsedUrl.pathname + '?' + param(query));
		    }

		    if (msg)
		        emitter.emit('info_msg', msg);
		}

		render() {
			return super.render();
		}
	})
}

module.exports = HOC_II_layout1;