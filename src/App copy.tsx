import React from 'react';
import './App.css';
import {
  Color,
  Group,
  MeshBasicMaterial,MeshStandardMaterial,
  BoxGeometry, Mesh, MeshNormalMaterial, PerspectiveCamera,
  RepeatWrapping,
  Raycaster,
  Scene,
  Texture,
  TextureLoader,
  
  WebGLRenderer, 
  Vector2,
  Mapping
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// let canvas:HTMLCanvasElement
let renderer:WebGLRenderer
const scene = new Scene()
const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000)
// const controls = new OrbitControls( camera, renderer.domElement );
let controls:OrbitControls

camera.position.z = 15;
camera.position.y = 10;
camera.lookAt(0, 0, 0)

const cabinetes:Mesh[]=[]
const maps = new Map()
maps.set('cabinet-hover.jpg', new TextureLoader().load(`./models/cabinet-hover.jpg`))

const gltfLoader = new GLTFLoader();
function loadModel() {
  gltfLoader.load('./models/machineRoom.gltf', ({ scene: { children } }) => { 
    children.forEach((obj:Mesh) => {
      const material = obj.material as MeshStandardMaterial
      const { color, map, name } = material
      if (map) {
        const imgName = map.name
        let curTexture=maps.get(imgName)
        if (!curTexture) {
          curTexture=new TextureLoader().load(`./models/${imgName}`)
          curTexture.flipY = false
          curTexture.wrapS = 1000
          curTexture.wrapT = 1000
          maps.set(
            imgName,
            curTexture
          )
        }
        obj.material = new MeshBasicMaterial({ map: curTexture })
        
        // 寻找机箱
        if (name.includes('cabinet')) {
          cabinetes.push(obj)
        }
      } else {
        obj.material = new MeshBasicMaterial({color})
      }
    })
    scene.add(...children);
  })
}

const raycaster = new Raycaster()
const pointer = new Vector2()
let curObj:Mesh=null

class App extends React.Component {
  canvas: HTMLCanvasElement|null
  constructor(props:object) {
    super(props)
    this.canvas = null
  }
  componentDidMount() {
    const { canvas } = this
    if (!canvas) { return }
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    renderer = new WebGLRenderer({ canvas })
    controls = new OrbitControls(camera, renderer.domElement);
    loadModel()
    this.animation()
  }
  animation() {
    renderer.render(scene, camera)

    requestAnimationFrame(() => {
      this.animation()
    })
  }
  move(event) {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1

    // 通过摄像机和鼠标位置更新射线
    raycaster.setFromCamera( pointer, camera );

    // 计算物体和射线的焦点
    const intersect = raycaster.intersectObjects(cabinetes)[0]
    let intersectObj=intersect?intersect.object as Mesh:null
    if (curObj&&curObj!==intersectObj) {
      const material =curObj.material as MeshBasicMaterial
      material.setValues({
        map: maps.get('cabinet.jpg')
      })
    }
    if (intersectObj) {
      if (intersectObj !== curObj) {
        curObj=intersectObj
        const material = intersectObj.material as MeshBasicMaterial
        material.setValues({
          map: maps.get('cabinet-hover.jpg')
        })
      }
    } else {
      curObj=null
    }
  }
  render() {
    return <div className="App" onMouseMove={this.move}>
      {/* <div id='plane'>提示板</div> */}
      <canvas
        id='canvas'
        ref={canvas => this.canvas = canvas}
      ></canvas>
    </div>
  }
}

export default App;
