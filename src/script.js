import './style.css'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {Clock} from 'three'

const textureLoader = new THREE.TextureLoader()

import coreVertexShader from './shaders/core/vertex.glsl'
import coreFragmentShader from './shaders/core/fragment.glsl'
import shellVertexShader from './shaders/shell/vertex.glsl'
import shellFragmentShader from './shaders/shell/fragment.glsl'

//window sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    //update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    //update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    //update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/** Camera */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 4)
scene.add(camera)

//controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true //плавность вращения камеры


/** Renderer */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) //ограничение кол-ва рендеров в завис-ти от плотности пикселей

const clock = new Clock()

const coreGeometry = new THREE.SphereBufferGeometry(1, 128, 128)
const coreMaterial = new THREE.ShaderMaterial({
    vertexShader: coreVertexShader,
    fragmentShader: coreFragmentShader,
    side: THREE.DoubleSide,
    // wireframe: true,
    uniforms: {
        uTime: {value: 0}
    }
})
const core = new THREE.Mesh(coreGeometry, coreMaterial)
scene.add(core)

const positionsNumber = 4000;
const positions = new Float32Array(positionsNumber * 3)

let inc = Math.PI * (3 - Math.sqrt(5))
let offset = 2 / positionsNumber
for (let i = 0; i < positionsNumber; ++i) {
    let y = i * offset - 1 + (offset / 2)
    let r = Math.sqrt(1 - y*y)
    let phi = i * inc
    const radius = 1.7

    positions[3 * i] = radius * Math.cos(phi) * r
    positions[3 * i + 1] = radius * y
    positions[3 * i + 2] = radius * Math.sin(phi) * r
}

const shellGeometry = new THREE.BufferGeometry();
shellGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
const shellMaterial = new THREE.ShaderMaterial({
    vertexShader: shellVertexShader,
    fragmentShader: shellFragmentShader,
    transparent: true,
    uniforms: {
        uTime: {value: 0}
    }
})
const shell = new THREE.Points(shellGeometry, shellMaterial)
scene.add(shell)

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    coreMaterial.uniforms.uTime.value = elapsedTime
    shellMaterial.uniforms.uTime.value = elapsedTime
    shell.rotation.y = elapsedTime * 0.5
    //Update controls
    controls.update() //если включён Damping для камеры необходимо её обновлять в каждом кадре

    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()
