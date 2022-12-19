import React from "react";
import "./App.css";
import MachineRoom from "./component/MachineRoom";
import { getCabinateByName } from "./server/Cabinet";

let room: MachineRoom;
let canvas: HTMLCanvasElement;

class App extends React.Component {
  state = {
    planePos: {
      left: 200,
      top: 200,
    },
    planeDisplay: "",
    curCabinet: {
      name: "cabinet-001",
      temperature: 36,
      capacity: 0,
      count: 0,
    },
  };

  componentDidMount() {
    if (!canvas) {
      return;
    }
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    room = new MachineRoom(canvas);
    room.modelPath = "./models/";
    room.loadGLTF("machineRoom.gltf");
    room.animate();
    room.onMouseOverCabinet = (cabinet) => {
      //显示信息面板
      this.setState({
        planeDisplay: "block",
      });
      //基于cabinet.name 获取机柜数据
      getCabinateByName(cabinet.name).then(({ name, temperature, capacity, count }) => {
        this.setState({
          curCabinet: { name, temperature, capacity, count },
        });
      });
    };
    room.onMouseMoveCabinet = (left, top) => {
      //移动信息面板
      this.setState({
        planePos: { left, top },
      });
    };
    room.onMouseOutCabinet = () => {
      //显示信息面板
      this.setState({
        planeDisplay: "none",
      });
    };
  }
  mouseMove({ clientX, clientY }) {
    room.selectCabinet(clientX, clientY);
  }
  render() {
    const {
      planePos: { left, top },
      planeDisplay: display,
      curCabinet: { name, temperature, capacity, count },
    } = this.state;
    return (
      <div className="App" onMouseMove={this.mouseMove}>
        <canvas id="canvas" ref={(ele) => (canvas = ele)}></canvas>
        <div id="plane" style={{ left, top, display }}>
          <p>机柜名称：{name}</p>
          <p>机柜温度：{temperature}°</p>
          <p>
            使用情况：{count}/{capacity}
          </p>
        </div>
      </div>
    );
  }
}

export default App;
