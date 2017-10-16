const React        = require('react');

import PlaySVG from 'material-ui/svg-icons/av/play-circle-outline';

import {Card,CardMedia} from 'material-ui/Card';

const VideoPlayerWrapper = React.createClass({
	getInitialState:function() {
		return {};
	},
	componentDidMount:function(){
        require.ensure([], (require) => {
              this.setState({videoPlayer:require('xbuilder-templates/video/videoPlayer')});
        });
	},
	showVideo:function(){
		this.setState({showVideo:1});
	},
	render() {
		var _this = this;
		var s = this.state;
		var p = this.props;

		return (
			<div
				style={{position:'relative',overflow:'hidden'}}
				onMouseEnter={()=>this.setState({mouseOver:1})}
				onMouseLeave={()=>this.setState({mouseOver:0})}
			>
				<div>
					{!s.videoPlayer ? null :
						<s.videoPlayer
							ref="videoPlayer"
							fluid={p.fluid || false}
							width={p.width || 340}
							src={p.video}
							srcPrefix={"https://storage.googleapis.com/weestay-cloud-storage/"}
							format={p.format}
							stopped={()=>this.setState({videoPlaying:0})}
							playing={()=>this.setState({videoPlaying:1})}
							showBackBtn={s.videoPlaying}
						/>
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