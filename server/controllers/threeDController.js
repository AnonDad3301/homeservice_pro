import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class ThreeDViewer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    
    // Сцена
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf8f9fa);
    
    // Камера
    this.camera = new THREE.PerspectiveCamera(
      75, 
      this.container.clientWidth / this.container.clientHeight, 
      0.1, 
      1000
    );
    this.camera.position.z = 5;
    
    // Рендерер
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(
      this.container.clientWidth, 
      this.container.clientHeight
    );
    this.container.appendChild(this.renderer.domElement);
    
    // Контроллер
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    
    // Освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    this.scene.add(directionalLight);
    
    // Загрузчик
    this.loader = new STLLoader();
    
    // Обработка ресайза
    window.addEventListener('resize', this.onResize.bind(this));
    
    // Анимация
    this.animate();
  }
  
  loadModel(url) {
    this.loader.load(url, geometry => {
      // Очистка предыдущей модели
      if (this.model) {
        this.scene.remove(this.model);
      }
      
      const material = new THREE.MeshPhongMaterial({
        color: 0x4361ee,
        specular: 0x111111,
        shininess: 200,
        flatShading: true
      });
      
      this.model = new THREE.Mesh(geometry, material);
      
      // Центрирование модели
      const box = new THREE.Box3().setFromObject(this.model);
      const center = box.getCenter(new THREE.Vector3());
      this.model.position.sub(center);
      
      // Масштабирование
      const size = box.getSize(new THREE.Vector3()).length();
      this.model.scale.setScalar(2 / size);
      
      this.scene.add(this.model);
    });
  }
  
  onResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(
      this.container.clientWidth, 
      this.container.clientHeight
    );
  }
  
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
  
  calculateVolume() {
    if (!this.model) return 0;
    
    const position = this.model.geometry.attributes.position;
    const faces = position.count / 3;
    let sum = 0;
    
    for (let i = 0; i < faces; i++) {
      const p1 = new THREE.Vector3().fromBufferAttribute(position, i * 3);
      const p2 = new THREE.Vector3().fromBufferAttribute(position, i * 3 + 1);
      const p3 = new THREE.Vector3().fromBufferAttribute(position, i * 3 + 2);
      
      const v1 = new THREE.Vector3().subVectors(p2, p1);
      const v2 = new THREE.Vector3().subVectors(p3, p1);
      const cross = new THREE.Vector3().crossVectors(v1, v2);
      
      sum += p1.dot(cross);
    }
    
    return Math.abs(sum) / 6;
  }
}