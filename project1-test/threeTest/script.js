let gyroAlpha = 0;
let gyroBeta = 0;
let gyroGamma = 0;
let euler;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(2, 4, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

// function animate(time) {
//   renderer.render(scene, camera);
// }

// renderer.setAnimationLoop(animate);
function animate() {
  requestAnimationFrame(animate);

  // cube.rotation.x = gyroAlpha;
  if (euler) {
    console.log(euler);
    // cube.rotation = euler;
    // cube.quaternion.setFromEuler(euler);
  }
  // cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}
animate();

function handleOrientation(event) {
  document.querySelector("#requestOrientationButton").style.display = "none";

  // gyroAlpha = eventData.alpha;
  // gyroBeta = eventData.beta;
  // gyroGamma = eventData.gamma;

  const alpha = (event.alpha || 0) * (Math.PI / 180); // Z axis
  const beta = (event.beta || 0) * (Math.PI / 180); // X axis
  const gamma = (event.gamma || 0) * (Math.PI / 180); // Y axis

  // console.log(gyroAlpha);

  const euler = new THREE.Euler(beta, gamma, alpha, "YXZ");

  let quaternion = new THREE.Quaternion().setFromEuler(euler);

  // const axis = new THREE.Vector3(0, 0, 1); // Normalized rotation axis
  // const angle = Math.PI / 4; // Angle in radians
  // const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, gamma);

  // cube.setRotationFromQuaternion(quaternion); //
  // cube.rotation.x = 0;
  // cube.rotation.y = 0;
  // cube.rotation = euler;
  // console.log(quaternion);
  const forward = new THREE.Vector3(0, 1, 0);
  forward.applyQuaternion(quaternion);
  // forward.normalize();

  // console.log(forward);
  forward.z = 0;
  // forward.y = 0;
  forward.normalize();
  cube.lookAt(forward);

  // console.log(forward.z);
  // let aa = Math.atan2(forward.x, forward.z);
  // console.log(aa);
  // let deg = degrees(aa);
  // if (!startAngle) {
  //   startAngle = deg;
  // } else {
  //   deg = deg - startAngle;
  // }
  // console.log(deg);
}
