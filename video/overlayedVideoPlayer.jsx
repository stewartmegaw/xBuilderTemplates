const React        = require('react');

import PlaySVG from 'material-ui/svg-icons/av/play-circle-outline';

import {Card,CardMedia} from 'material-ui/Card';

const VideoPlayerWrapper = React.createClass({
	getInitialState:function() {
		return {};
	},
	componentDidMount:function(){
        require.ensure([], (require) => {
              this.setState({videoPlayer:require('alpha-client-lib/partials/video/videoPlayer')});
        });
	},
	touchDivClick: function(e) {
		if(!this.state.mouseOver)
		{
			this.setState({mouseOver:1});
		}
		else
		{
			this.refs.videoPlayer.restart();
			this.setState({mouseOver:0});	
		}
		e.stopPropagation();
	},
	mouseEnteredContainer(e){
		// Bug
		// Mouse entered is trigged when tapping on touch devices.
		// It triggers the first time only in Chrome mobile
		// It tiggers before onClick
		// Deley setting mouseOver:1 allows touchDivClick to run properly
		setTimeout(()=>this.setState({mouseOver:1}),200);
	},
	render() {
		var _this = this;
		var s = this.state;
		var p = this.props;


		return (
			<div
				style={{position:'relative',overflow:'hidden'}}
				onMouseEnter={this.mouseEnteredContainer}
				onMouseLeave={()=>this.setState({mouseOver:0})}
			>
				<div>
					{!s.videoPlayer ? null :
						<s.videoPlayer
							ref="videoPlayer"
							fluid={p.fluid || false}
							width={p.width || 340}
							height={p.height || null}
							src={p.video}
							srcPrefix={"https://storage.googleapis.com/weestay-cloud-storage/"}
							format={p.format}
							stopped={()=>this.setState({videoPlaying:0})}
							playing={()=>this.setState({videoPlaying:1})}
							showBackBtn={s.videoPlaying}
						/>
					}
					{/*Div for touch devices. Should have no affect for desktop*/}
					{s.videoPlaying ? null :
						<span>
							<div style={{position:'absolute',top:0,left:'20%',width:'80%',height:'100%'}} onClick={this.touchDivClick}/>
							<div style={{position:'absolute',top:'35%',left:0,width:'100%',height:'65%'}} onClick={this.touchDivClick}/>
						</span>
					}
				</div>

				{s.videoPlaying || s.mouseOver ? null :
					<div
						style={{position:'absolute',bottom:0,left:0,width:'100%',height:150,pointerEvents:'none'}}
					>
						<div style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%,rgba(0,0,0,0) 2%,rgba(0,0,0,0.8) 100%)'}}/>
						<div style={{position:'absolute',bottom:0,left:0,width:'100%',textAlign:'left'}}>	
							{p.overlay}
						</div>
					</div>
				}
				{s.videoPlaying || !s.mouseOver || (!p.mouseOverOverlay && !p.mouseOverBottomBtns) ? null :
					<div>
						{p.mouseOverOverlay || null}
						{p.mouseOverBottomBtns || null}
					</div>
				}
				{p.children || null}
			</div>
		);
	}
});

module.exports = VideoPlayerWrapper;