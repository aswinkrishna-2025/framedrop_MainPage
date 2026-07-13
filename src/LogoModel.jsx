import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js'

const MARK_PATH_INDEXES = new Set([1, 6, 9])

function LogoModel() {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [staticMode, setStaticMode] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const compactViewport = window.matchMedia('(max-width: 780px)').matches

    if (reduceMotion || compactViewport || !container || !canvas) {
      setStaticMode(true)
      return undefined
    }

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
    } catch {
      setStaticMode(true)
      return undefined
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
    camera.position.set(0, 0, 10.5)

    const root = new THREE.Group()
    const logoGroup = new THREE.Group()
    const haloGroup = new THREE.Group()
    scene.add(root)
    root.add(haloGroup, logoGroup)

    const ambientLight = new THREE.HemisphereLight(0xdce7ff, 0x170604, 2.2)
    const keyLight = new THREE.DirectionalLight(0xffffff, 5.2)
    keyLight.position.set(-3.5, 4, 7)
    const rimLight = new THREE.PointLight(0xf03a17, 34, 18, 2)
    rimLight.position.set(4.2, -1.2, 4)
    scene.add(ambientLight, keyLight, rimLight)

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xdfe6ef,
      metalness: 0.05,
      roughness: 0.12,
      transparent: true,
      opacity: 0.22,
      transmission: 0.72,
      thickness: 0.5,
      depthWrite: false,
      side: THREE.DoubleSide,
    })

    const ringOne = new THREE.Mesh(new THREE.TorusGeometry(3.55, 0.018, 10, 150), glassMaterial)
    ringOne.rotation.x = 0.55
    ringOne.rotation.y = 0.18
    const ringTwo = new THREE.Mesh(new THREE.TorusGeometry(3.05, 0.012, 10, 130), glassMaterial.clone())
    ringTwo.rotation.x = -0.45
    ringTwo.rotation.y = 0.68
    const glassShell = new THREE.Mesh(
      new THREE.SphereGeometry(3.15, 42, 28),
      new THREE.MeshPhysicalMaterial({
        color: 0x9aabc2,
        roughness: 0.08,
        metalness: 0,
        transparent: true,
        opacity: 0.045,
        transmission: 0.88,
        thickness: 0.9,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    )
    haloGroup.add(ringOne, ringTwo, glassShell)

    const particleCount = 74
    const positions = new Float32Array(particleCount * 3)
    for (let index = 0; index < particleCount; index += 1) {
      const radius = 3.4 + Math.random() * 1.5
      const angle = Math.random() * Math.PI * 2
      positions[index * 3] = Math.cos(angle) * radius
      positions[index * 3 + 1] = (Math.random() - 0.5) * 7
      positions[index * 3 + 2] = Math.sin(angle) * radius * 0.32
    }
    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0xf2eee8,
        size: 0.022,
        transparent: true,
        opacity: 0.48,
        depthWrite: false,
      }),
    )
    root.add(particles)

    const logoMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf2eee8,
      metalness: 0.58,
      roughness: 0.26,
      clearcoat: 1,
      clearcoatRoughness: 0.18,
      emissive: 0x190402,
      emissiveIntensity: 0.16,
      side: THREE.DoubleSide,
    })

    let disposed = false
    let resourcesDisposed = false
    let targetX = -0.04
    let targetY = -0.14
    let currentX = targetX
    let currentY = targetY
    let frameId = null
    let isVisible = true

    const disposeResources = () => {
      if (resourcesDisposed) return
      resourcesDisposed = true
      scene.traverse((object) => {
        object.geometry?.dispose?.()
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose())
        else object.material?.dispose?.()
      })
      renderer.dispose()
    }

    const failToStatic = () => {
      if (disposed) return
      isVisible = false
      if (frameId !== null) cancelAnimationFrame(frameId)
      frameId = null
      disposeResources()
      setStaticMode(true)
    }

    const loader = new SVGLoader()
    loader.load(
      '/brand-logo-source.svg',
      (data) => {
        if (disposed) return
        data.paths.forEach((path, pathIndex) => {
          if (!MARK_PATH_INDEXES.has(pathIndex)) return
          const shapes = path.toShapes()
          shapes.forEach((shape) => {
            const geometry = new THREE.ExtrudeGeometry(shape, {
              depth: 17,
              bevelEnabled: true,
              bevelThickness: 2.2,
              bevelSize: 1.4,
              bevelSegments: 3,
              curveSegments: 9,
            })
            geometry.computeVertexNormals()
            const mesh = new THREE.Mesh(geometry, logoMaterial)
            mesh.scale.set(0.013, -0.013, 0.013)
            logoGroup.add(mesh)
          })
        })

        if (logoGroup.children.length === 0) {
          failToStatic()
          return
        }

        const bounds = new THREE.Box3().setFromObject(logoGroup)
        const center = bounds.getCenter(new THREE.Vector3())
        logoGroup.position.set(-center.x, -center.y, -center.z)
        logoGroup.rotation.set(-0.04, -0.14, -0.025)
        setReady(true)
      },
      undefined,
      failToStatic,
    )

    const onPointerMove = (event) => {
      const rect = container.getBoundingClientRect()
      const normalizedX = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const normalizedY = ((event.clientY - rect.top) / rect.height) * 2 - 1
      targetY = normalizedX * 0.38
      targetX = -normalizedY * 0.2
    }

    const onPointerLeave = () => {
      targetX = -0.04
      targetY = -0.14
    }

    const resize = () => {
      if (resourcesDisposed) return
      const width = Math.max(container.clientWidth, 1)
      const height = Math.max(container.clientHeight, 1)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }

    const render = (time = 0) => {
      frameId = null
      currentX += (targetX - currentX) * 0.045
      currentY += (targetY - currentY) * 0.045
      root.rotation.x = currentX
      root.rotation.y = currentY
      root.rotation.z = Math.sin(time * 0.00032) * 0.035
      ringOne.rotation.z = time * 0.00012
      ringTwo.rotation.z = -time * 0.00016
      particles.rotation.y = time * 0.000035
      renderer.render(scene, camera)
      if (isVisible && !document.hidden) frameId = requestAnimationFrame(render)
    }

    const start = () => {
      if (frameId === null && isVisible && !document.hidden) frameId = requestAnimationFrame(render)
    }

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
      if (isVisible) start()
      else if (frameId !== null) {
        cancelAnimationFrame(frameId)
        frameId = null
      }
    }, { rootMargin: '120px' })

    const onVisibilityChange = () => {
      if (document.hidden && frameId !== null) {
        cancelAnimationFrame(frameId)
        frameId = null
      } else {
        start()
      }
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    visibilityObserver.observe(container)
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerleave', onPointerLeave)
    document.addEventListener('visibilitychange', onVisibilityChange)
    resize()
    start()

    return () => {
      disposed = true
      if (frameId !== null) cancelAnimationFrame(frameId)
      visibilityObserver.disconnect()
      resizeObserver.disconnect()
      container.removeEventListener('pointermove', onPointerMove)
      container.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      disposeResources()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`logo-model ${ready ? 'is-ready' : ''} ${staticMode ? 'is-static' : ''}`}
      role="img"
      aria-label="Three-dimensional Frame Drop Interactive mark"
    >
      <img className="logo-model-fallback" src="/brand-mark.png" alt="" aria-hidden="true" />
      <canvas ref={canvasRef} aria-hidden="true" />
      <span className="model-loading" aria-hidden="true">Building geometry</span>
    </div>
  )
}

export default LogoModel
