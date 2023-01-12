import React, { Component } from 'react';
// import './CameraSection.css'

export class DrawPointsOnScaleImage extends Component {
    constructor(props) {
        super(props);
        console.log(props.sections);
        this.myInput = React.createRef();
        this.poly = React.createRef()

        this.state = {
            isImageLoaded: false,
            scale: 1,
            points: [],
            sclaePoints: [],
            selectedArea: this.props.section

        }
    }

    componentDidMount() {
        console.log("Component Mounted");
        this.imageElement = document.createElement("img");
        console.log('this.imageElement.width', this.imageElement.width);

        this.imageElement.src = this.props.map;
        console.log(this.imageElement.src);
        this.imageElement.addEventListener('load', () => {
            console.log(this.imageElement.width, this.imageElement.height);
            this.setState({ isImageLoaded: true });
        });
        this.imageElement.onload = () => {

            // var drawingWidth = document.getElementById("live-heatmap").offsetWidth;
            // console.log('jkdfbsdjbfsdf',this.myInput.current.offsetWidth)
            if (this.myInput.current) {
                console.log('this.myInput.current', this.myInput.current);
                var drawingWidth = this.myInput.current.offsetWidth;
                let scale = drawingWidth / this.imageElement.width;
                console.log('scalescale', scale, drawingWidth, this.imageElement.width);
                this.setState({ scale: scale })
            }



        }

    }

    componentWillUpdate() {
        console.log("Will update", this.props);
    }

    componentDidUpdate() {
        console.log("Did update", this.props);
    }









    clickPoint = (event) => {
        console.log(event.nativeEvent);

        var scalePoints = this.props.points.slice();
        scalePoints.push({ x: event.nativeEvent.offsetX / this.state.scale, y: event.nativeEvent.offsetY / this.state.scale });

        console.log('scalePoints', scalePoints);
        this.props.setPoints(scalePoints)
    }

    render() {
        return (
            <React.Fragment>
                {this.state.isImageLoaded &&
                    <div style={{ backgroundColor: '', width: '100%' }} ref={this.myInput} id="live-heatmap">

                        <div style={{ backgroundColor: '', width: this.imageElement.width + "px" * this.state.scale, height: this.imageElement.height + "px" * this.state.scale, overflow: "auto", margin: "0px", padding: "0px" }}>
                            <svg onClick={(e) => this.props.flag && this.clickPoint(e)} height={this.imageElement.height * this.state.scale} width={this.imageElement.width * this.state.scale} style={{ position: "absolute", zIndex: 2, cursor : this.props.cursor }}>
                                {
                                    this.props.points.length > 0 &&
                                    this.props.points.map((point, index) => {
                                        if (index == 0) {
                                            return <circle cx={point.x * this.state.scale} cy={point.y * this.state.scale} r="4" stroke="red" strokeWidth="1" fill="red" key={"linedots_" + index} />
                                        } else {
                                            return <line x1={this.props.points[index - 1].x * this.state.scale} y1={this.props.points[index - 1].y * this.state.scale} x2={point.x * this.state.scale} y2={point.y * this.state.scale} stroke="red" strokeWidth="2" key={"line_" + index} />
                                        }
                                    })
                                }

                                {this.props.sections.length > 0 &&
                                    this.props.sections.map((section, ind) => {
                                        let points = "";
                                        var xCords = [];
                                        var yCords = [];

                                        section.coordinate.map((point, index) => {
                                            if (index > 0) {
                                                points += " " + point.x * this.state.scale + "," + point.y * this.state.scale;
                                            } else {
                                                points += point.x * this.state.scale + "," + point.y * this.state.scale;
                                            }
                                            xCords.push(point.x * this.state.scale);
                                            yCords.push(point.y * this.state.scale);
                                        });
                                        var text = {
                                            x: Math.floor(Math.min(...xCords) + (Math.max(...xCords) - Math.min(...xCords)) / 2),
                                            y: Math.floor(Math.min(...yCords) + (Math.max(...yCords) - Math.min(...yCords)) / 2)
                                        };


                                        return (
                                            <React.Fragment key={"section_" + ind}>
                                                <text x={text.x} y={text.y} textAnchor="middle" fill="#0000008a" fontFamily='bold' fontSize="16">{section.title}</text>
                                                <polygon
                                                    onClick={() => this.props.setSection_id(section._id)}
                                                    style={{ fill: 'rgba(0,0,0,0.2)' }}
                                                    className="it"
                                                    points={points}
                                                />
                                            </React.Fragment>
                                        )
                                    })
                                }
                            </svg>
                            <img width={this.imageElement.width * this.state.scale} height={this.imageElement.height * this.state.scale} src={this.props.dye} />
                        </div>
                    </div>
                }
            </React.Fragment>
        );
    }

}

export default DrawPointsOnScaleImage;


