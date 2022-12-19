import { MeshBasicMaterial, MeshStandardMaterial, Mesh, PerspectiveCamera, Raycaster, Scene, Texture, TextureLoader, WebGLRenderer, Vector2 } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const gltfLoader: GLTFLoader = new GLTFLoader();
const raycaster = new Raycaster();
const pointer = new Vector2();

export default class MachineRoom {
  renderer: WebGLRenderer;
  scene: Scene = new Scene();
  camera: PerspectiveCamera;

  controls: OrbitControls;
  cabinets: Mesh[] = [];
  curCabinet: Mesh;
  maps: Map<string, Texture> = new Map();
  modelPath: string;
  onMouseOverCabinet = (cabinet: Mesh) => {};
  onMouseMoveCabinet = (x: number, y: number) => {};
  onMouseOutCabinet = () => {};

  constructor(canvas: HTMLCanvasElement, modelPath: string = "./models/") {
    this.camera = new PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 1000);
    this.camera.position.set(0, 10, 15);
    this.camera.lookAt(0, 0, 0);
    this.renderer = new WebGLRenderer({ canvas });
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.modelPath = modelPath;
    this.maps.set("cabinet-hover.jpg", new TextureLoader().load(`${modelPath}cabinet-hover.jpg`));
  }

  loadGLTF(modelName: string = "") {
    gltfLoader.load(this.modelPath + modelName, ({ scene: { children } }) => {
      children.forEach((obj: Mesh) => {
        const { color, map, name } = obj.material as MeshStandardMaterial;
        this.changeMat(obj, map, color);
        if (name.includes("cabinet")) {
          this.cabinets.push(obj);
        }
      });
      this.scene.add(...children);
    });
  }
  changeMat(obj, map, color) {
    if (map) {
      // 默认是standrad 材质，即pbr
      obj.material = new MeshBasicMaterial({
        map: this.crtTexture(map.name),
      });
    } else {
      obj.material = new MeshBasicMaterial({ color });
    }
  }
  crtTexture(imgName: string) {
    let curTexture = this.maps.get(imgName);
    if (!curTexture) {
      curTexture = new TextureLoader().load(this.modelPath + imgName);
      curTexture.flipY = false;
      curTexture.wrapS = 1000;
      curTexture.wrapT = 1000;
      this.maps.set(imgName, curTexture);
    }
    return curTexture;
  }
  selectCabinet(x: number, y: number) {
    const { cabinets, renderer, camera, maps, curCabinet } = this;
    const { width, height } = renderer.domElement;

    // 鼠标的canvas坐标转裁剪坐标
    pointer.set((x / width) * 2 - 1, -(y / height) * 2 + 1);
    // 基于鼠标点和相机设置射线投射器
    raycaster.setFromCamera(pointer, camera);
    // 选择机柜
    const intersect = raycaster.intersectObjects(cabinets)[0];
    let intersectObj = intersect ? (intersect.object as Mesh) : null;
    // 若之前已有机柜被选择，且不等于当前所选择的机柜，取消已选机柜的高亮
    if (curCabinet && curCabinet !== intersectObj) {
      const material = curCabinet.material as MeshBasicMaterial;
      material.setValues({
        map: maps.get("cabinet.jpg"),
      });
    }
    /* 
    若当前所选对象不为空：
      触发鼠标在机柜上移动的事件。
      若当前所选对象不等于上一次所选对象：
        更新curCabinet。
        将模型高亮。
        触发鼠标划入机柜事件。
    否则：
      置空curCabinet。
      触发鼠标划出机柜事件。
    */
    if (intersectObj) {
      this.onMouseMoveCabinet(x, y);
      if (intersectObj !== curCabinet) {
        this.curCabinet = intersectObj;
        const material = intersectObj.material as MeshBasicMaterial;
        material.setValues({
          map: maps.get("cabinet-hover.jpg"),
        });
        this.onMouseOverCabinet(intersectObj);
      }
    } else if (curCabinet) {
      this.curCabinet = null;
      this.onMouseOutCabinet();
    }
  }
  // 渲染
  render() {
    this.renderer.render(this.scene, this.camera);
  }
  // 连续渲染
  animate() {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(() => {
      this.animate();
    });
  }
}
