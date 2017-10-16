/*
Takes an array of nested objects and arrays and returns either:
Nested html list

Example input array (passed via props.listArray)
Array[3]
	0 : Object
		id : 1
		title: "Level 1"
		routeLabel : "level1"
	1 : Array[3]
		0 : Object
			id : 2
			title: "Level 2"
			routeLabel : "level2"
		1 : Array[1]
			0 : Object
				id : 5
				title: "Level 3"
				routeLabel : "level3"
		2 : Object
			id : 4
			title: "Level 2"
			routeLabel : "level2"
	2 : Object
		id : 3
		title: "Level 1"
		routeLabel : "level1"

Note:
- Each Object needs a unqiue id
- title and routeLabel properties are required

*/

const React = require('react');
import ReactDOM from 'react-dom'

const {Link} = require('react-router');

import styles from '../style/list.css';

const List = React.createClass({
	getInitialState:function(){
		var collapsed = [];
		var _this = this;

		function getDefaultCollapsed(listArray, root) {
			for(var j = 0; j < listArray.length; j++)
			{
				if(listArray[j].constructor !== Array)
				{
					var hasChildren = listArray.length > j + 1 && listArray[j+1].constructor === Array;
					if(_this.props.showToggles && hasChildren && !root)
						collapsed.push(listArray[j].id);
					if(hasChildren)
						getDefaultCollapsed(listArray[j+1]);
				}
			}

		}
		getDefaultCollapsed(this.props.listArray, true);

		return {
			collapsed:collapsed,
			checked:this.props.checked || [],
			disabled:[],
			hidden:{} // used in conjunction with p.hideMoreThan
		}
	},
	componentDidMount(){
		if(this.props.showCheckboxes)
		{	
			var checked = this.state.checked.slice();
			for(var i = 0; i < checked.length; i++)
				checked = this.handleChildren(checked, checked[i].toString(), true);
			this.setState({checked:checked});
		}
	},
	toggleItem: function(itemId) {
		var collapsed = this.state.collapsed;
		var key = collapsed.indexOf(itemId);
		if(key == -1)
			collapsed.push(itemId);
		else
			collapsed.splice(key, 1);
		this.setState({collapsed:collapsed});
	},
	onCheckboxChange:function(itemId){
		var checked = this.state.checked.slice();
		var key = checked.indexOf(itemId.toString());

		if(key == -1)
			checked.push(itemId.toString());
		else
			checked.splice(key, 1);

		checked = this.handleChildren(checked, itemId, key == -1);

		this.setState({checked:checked});
	},
	contentClicked: function(itemId) {
		var _this = this;
		var checked = this.state.checked.slice();
		// var key = checked.indexOf(itemId.toString());
		checked = this.props.unCheckAllOnChange ? [] : checked;


		// if(key == -1)
			checked.push(itemId.toString());
		// else
		// 	checked.splice(key, 1);
		var disabled = this.state.disabled.slice();
		var disabledKey = disabled.indexOf(itemId.toString());
		if(disabledKey !== -1)
			disabled.splice(disabledKey, 1);

		this.setState({disabled:disabled}, ()=>{
			checked = _this.handleChildren(checked, itemId, true);

			_this.setState({checked:checked}, function() {
				if(_this.props.contentClicked)
					_this.props.contentClicked(itemId);
			});
		})

	},
	handleChildren: function(checkedArray, itemId, check) {
		if(this.props.checkChildren){
			var liDomNode = ReactDOM.findDOMNode(this.refs["checkbox"+itemId]).parentNode;
			var childUl = liDomNode.getElementsByTagName('ul')[0];
			if(childUl)
			{
				var disabled = this.state.disabled.slice();
				var childInputs = childUl.getElementsByTagName('input');
				for(var i = 0; i < childInputs.length; i++)
				{
					var v = childInputs[i].value.toString();

					var childKey = checkedArray.indexOf(v);
					var disabledKey = disabled.indexOf(v);

					if(check)
					{
						if(childKey == -1)
							checkedArray.push(v);
						if(disabledKey == -1)
							disabled.push(v);
					}
					else
					{
						if(childKey !== -1)
							checkedArray.splice(childKey, 1);
						if(disabledKey !== -1)
							disabled.splice(disabledKey, 1);
					}
				}
				this.setState({disabled:disabled});
			}
		}
		return checkedArray;
	},
	get_list_item: function(listArray, routeLabels, depth) {
		var _this = this;
		var p = this.props;
		var s = this.state;

		var items = [];

		if(!routeLabels)
			routeLabels = [];


		for(var j = 0; j < listArray.length; j++)
		{

				if(listArray[j].constructor !== Array)
				{
					(function(listArray, j){
						var newRouteLabels = routeLabels.slice(0);					
						newRouteLabels.push(listArray[j].routeLabel);

						var hasChildren = listArray.length > j + 1 && listArray[j+1].constructor === Array;

						var childItems = hasChildren && s.collapsed.indexOf(listArray[j].id) == -1 ? _this.get_list_item(listArray[j+1], newRouteLabels, depth+1) : [];

						items.push(
							<li
								data-position={p.positionField ? listArray[j][p.positionField] : null}
								key={listArray[j].id}
								style={p.itemStyle}
								className={p.listItemClass}
							>
								{p.showToggles && hasChildren ?
									<span
		                                className={"toggle "+ (s.collapsed.indexOf(listArray[j].id) != -1 ? "up" : "")}
		                                onClick={(e)=>{
		                                    _this.toggleItem(listArray[j].id);
		                                }}
		                            />
	                            :null}

	                            <div className={p.listItemContainerClass}>
									{p.showCheckboxes && !(p.parentStatic && depth==0 && j==0) ?
										<input
											ref={"checkbox"+listArray[j].id}
											type="checkbox"
											name={p.checkboxName ? p.checkboxName + "[]" : "checkedboxes[]"}
											onChange={(e)=>{
												if(p.onCheckboxChange)
												{
													if(p.onCheckboxChange(e) !== false)
														_this.onCheckboxChange(listArray[j].id);
												}
												else
													_this.onCheckboxChange(listArray[j].id);
											}}
											value={listArray[j].id}
											checked={s.checked.indexOf(listArray[j].id.toString())==-1 ? false : true}
											disabled={s.disabled.indexOf(listArray[j].id.toString())==-1 ? false : 'disabled'}
										/>
									: null}

									<span onClick={p.parentStatic && depth==0 && j==0 ? null : _this.contentClicked.bind(null, listArray[j].id)}>
										{p.liContent ? p.liContent(
												listArray[j],
												s.checked.indexOf(listArray[j].id.toString())!=-1,
												s.disabled.indexOf(listArray[j].id.toString())!=-1
											)
										:
											<Link
												to={'/help/'+newRouteLabels.join('/')}
												activeClassName={styles.activeLink}
												className={_this.props.linkClass}
												onClick={(e)=>{
													window.location = '/help/'+newRouteLabels.join('/');
													e.stopPropagation();
												}}
											>
												{listArray[j].title}
											</Link>
										}
									</span>
								</div>

								{hasChildren && s.collapsed.indexOf(listArray[j].id) == -1 ?
									<span>
										<ul
											style={_this.props.listStyle}
											className={_this.props.listClass}
										>
											{p.hideMoreThan && childItems.length > p.hideMoreThan && !s.hidden['_'+listArray[j].id] ? 
												childItems.slice(0, p.hideMoreThan)
											:
												childItems
											}
										</ul>
										{p.hideMoreThan && childItems.length > p.hideMoreThan && !s.hidden['_'+listArray[j].id] ?
											<a
												href="#"
												className={styles.more}
												onClick={(e)=>{
													var hidden = Object.assign(s.hidden);
													hidden['_'+listArray[j].id] = true;
													_this.setState({hidden:hidden});
													e.preventDefault();
												}}
											>
												More
											</a>
										:null}
									</span>
								:null}
							</li>
						);

					})(listArray, j);
				}
		}

		if(p.positionField)
			items = items.sort((a,b)=>{return a.props["data-position"] - b.props["data-position"];});

		return items;
	},
    render() {
    	var p = this.props;
    	var childItems = this.get_list_item(p.listArray, null, 0);

		return (
			<span>
				<ul
					style={Object.assign({}, p.listStyle || {}, p.outerListStyle || {})}
					className={p.outerListClass}
				>
					{childItems}
				</ul>
				{/* 'Show more' not needed in the tree root yet 
				p.hideMoreThan && childItems.length > p.hideMoreThan ? <a href="#" className={styles.more}>More</a>:null*/}
			</span>
		);
	}
});

module.exports = List;