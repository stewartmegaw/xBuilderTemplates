var React = require('react');

const AppState = require('xbuilder-core/lib/appState');

var NotFound404 = React.createClass({
    render: function() {
        return (
            <div style={{margin:'50px 0',textAlign:'center'}}>
                <div dangerouslySetInnerHTML={{__html:AppState.getProp('exception',"404 Route not defined in client")}}/>
            </div>
        );
    }

});

module.exports = NotFound404;
