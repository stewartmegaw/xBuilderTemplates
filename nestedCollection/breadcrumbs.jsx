/*
Takes an array of nested objects and arrays and returns:
Breadcrumbs array

Example input array (passed via props.listArray)
Array[3]
	0 : Object
		id : 1
		title : "Level 1"
	1 : Array[3]
		0 : Object
			id : 2
			title" : "Level 2"
		1 : Array[1]
			0 : Object
				id : 5
				title: "Level 3"
		2 : Object
			id : 4
			title : "Level 2"
	2 : Object
		id : 3
		title : ":Level 1"

Note:
- Each Object needs a unqiue key
- title is required

*/

const React = require('react');

const Breadcrumbs = React.createClass({
	get_breadcrumbs: function(listArray, breadcrumbs) {
		if(!breadcrumbs)
			breadcrumbs = [];


		for(var j = 0; j < listArray.length; j++)
		{
			if(listArray[j].constructor !== Array)
			{
				var newBreadcrumbs = breadcrumbs.slice(0);					
				newBreadcrumbs.push(listArray[j].title);

				if(this.props.activeItemId === listArray[j].id)
					return newBreadcrumbs;
				else if(listArray.length > j + 1 && listArray[j+1].constructor === Array)
				{
					var crumbs = this.get_breadcrumbs(listArray[j+1], newBreadcrumbs);
					if(crumbs)
						return crumbs;
				}
			}
		};

		return null;
	},
    render() {

		var breadcrumbs = this.get_breadcrumbs(this.props.listArray);
		var breadcrumbsTmp = [];
		for(var i = 0; i <breadcrumbs.length; i++)
		{
			if(i != 0)
				breadcrumbsTmp.push(<span key={'d'+i}>{this.props.delimiterNode}</span>);
			breadcrumbsTmp.push(<span key={i}>{breadcrumbs[i]}</span>);
		}

		return (
			<span>{breadcrumbsTmp}</span>
		);
	}
});

module.exports = Breadcrumbs;