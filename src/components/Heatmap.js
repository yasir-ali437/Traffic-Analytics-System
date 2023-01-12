import React, { Component } from 'react';
import h337 from 'heatmap.js'
class Heatmap extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isImageLoaded: false,
            scale: 0,
            points: []
        }
    }

    componentDidMount() {
        this.imageElement = document.createElement("img");
        this.imageElement.src = this.props.map;
        this.imageElement.addEventListener('load', () => {
            this.setState({ isImageLoaded: true });
            setTimeout(() => {
                this.heatmapInstance = h337.create({
                    container: document.querySelector('#live-heatmap'),
                    radius: 11,
                    opacity: .7,
                    visible: true,
                    gradient: {
                        0.05: '#ffffff',
                        '0.10': '#265BF9',
                        0.15: '#3785F9',
                        '0.20': '#47AFFA',
                        0.25: '#59DBFB',
                        '0.30': '#65FBF2',
                        0.35: '#65FA9D',
                        '0.40': '#64F94D',
                        0.45: '#64F92C',
                        '0.50': '#78FA26',
                        0.55: '#92FA28',
                        '0.60': '#B1FC2A',
                        0.65: '#D2FC2C',
                        '0.70': '#F5FD2F',
                        0.75: '#F8DE2C',
                        '0.80': '#EC8923',
                        0.85: '#E7601F',
                        '0.90': '#E43A1C',
                        0.95: '#E3231B',
                        '1.0': '#b80701' // highest red
                    }
                });
                setTimeout(() => {
                    let data = this.processHeatmapData(this.props.heatmapData);
                    this.heatmapInstance.setData(data);
                }, 200);

            }, 200);
        });
    }

    processHeatmapData = (heatmapData) => {
        let min = Number.MAX_SAFE_INTEGER - 1;
        let max = Number.MIN_SAFE_INTEGER - 1;
        var data = [];
        for (var i = 0; i < heatmapData.length; i++) {
            var val = heatmapData[i].v;
            var record = heatmapData[i];

            data.push({ x: record.x, y: record.y, value: record.v });
            if (val < min) {
                min = val;
            }
            if (val > max) {
                max = val;
            }
        }
        return { max: max, data: data };
    }

    componentWillUpdate() {
    }

    componentDidUpdate() {
        try {
            if (this.state.isImageLoaded && this.heatmapInstance) {
                let data = this.processHeatmapData(this.props.heatmapData);
                this.heatmapInstance.setData(data);
            }
        } catch (e) {
            console.log(e);
        }
    }

    // mouseMove = (point) => {
    //     this.heatmapInstance.addData({ x: point.offsetX, y: point.offsetY, value: 1 });
    // }

    // getData = () => {
    //     console.log(JSON.stringify(this.heatmapInstance.getData().data));
    // }

    render() {
        return (
            <React.Fragment>
                {this.state.isImageLoaded &&
                    <div>
                     {this.props.dye != null && this.props.dye.length > 0 && <img width={this.imageElement.width} height={this.imageElement.height} src={this.props.dye} style={{ position: "absolute", zIndex: 2 }} alt='' />}
                        {/* {this.props.map != null && this.props.map.length > 0 && <img onMouseMove={(e)=>this.mouseMove(e.nativeEvent)} width={this.imageElement.width} height={this.imageElement.height} src={this.props.map} style={{ position: "absolute", zIndex: 2,  opacity:0.1}} alt=''  />} */}
                        <div id="live-heatmap" style={{ width: this.imageElement.width + "px", height: this.imageElement.height + "px", overflow: "auto", margin: "0px", padding: "0px" }}>
                            {/* <svg height={this.imageElement.height} width={this.imageElement.width} style={{ position: "absolute", zIndex: 2 }}>
                               
                            </svg> */}
                            <img width={this.imageElement.width} height={this.imageElement.height} src={this.props.map} alt='' />
                        </div>
                        {/* <button onClick={()=>this.getData()}>Get Data</button> */}
                    </div>
                }
            </React.Fragment>
        );
    }
}

export default Heatmap;