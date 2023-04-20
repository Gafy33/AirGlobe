<script setup lang="ts">
import ThreeGlobe from "three-globe";
import {
  WebGLRenderer,
  Scene,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  OctahedronGeometry,
} from "three";
import { InteractionManager } from "three.interactive";
import {
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Color,
  Fog,
  PointLight,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import countries from "./assets/globe-data-min.json";
import { onMounted, ref } from "vue";
import airports from "./assets/airport.json";
import { randFloat } from "three/src/math/MathUtils";

const body = ref();

onMounted(() => {
  var renderer: any,
    camera: any,
    scene: any,
    controls: any,
    interactionManager: any;
  let windowHalfX = window.innerWidth / 2;
  let windowHalfY = window.innerHeight / 2;
  var Globe: any;

  init();
  initGlobe();
  onWindowResize();
  animate();

  // SECTION Initializing core ThreeJS elements
  function init() {
    // Initialize renderer
    renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(body.value.innerWidth, body.value.innerHeight);
    // renderer.outputEncoding = THREE.sRGBEncoding;
    body.value.appendChild(renderer.domElement);

    // Initialize scene, light
    scene = new Scene();
    scene.add(new AmbientLight(0xbbbbbb, 0.3));
    scene.background = null;

    // Initialize camera, light
    camera = new PerspectiveCamera();
    camera.aspect = body.value.innerWidth / body.value.innerHeight;
    camera.updateProjectionMatrix();

    var dLight = new DirectionalLight(0xffffff, 0.8);
    dLight.position.set(-800, 2000, 400);
    camera.add(dLight);

    var dLight1 = new DirectionalLight(0x7982f6, 1);
    dLight1.position.set(-200, 500, 200);
    camera.add(dLight1);

    var dLight2 = new PointLight(0x8566cc, 0.5);
    dLight2.position.set(-200, 500, 200);
    camera.add(dLight2);

    camera.position.z = 400;
    camera.position.x = 0;
    camera.position.y = 0;

    scene.add(camera);

    // Additional effects
    scene.fog = new Fog(0x535ef3, 400, 2000);

    // Helpers
    // const axesHelper = new AxesHelper(800);
    // scene.add(axesHelper);
    // var helper = new DirectionalLightHelper(dLight);
    // scene.add(helper);
    // var helperCamera = new CameraHelper(dLight.shadow.camera);
    // scene.add(helperCamera);

    // Initialize controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dynamicDampingFactor = 0.01;
    controls.enablePan = false;
    controls.minDistance = 150;
    controls.maxDistance = 400;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1;
    controls.autoRotate = false;

    // controls.minPolarAngle = Math.PI / 3.5;
    // controls.maxPolarAngle = Math.PI - Math.PI / 3;

    interactionManager = new InteractionManager(
      renderer,
      camera,
      renderer.domElement
    );

    window.addEventListener("resize", onWindowResize, false);
    document.addEventListener("mousemove", onMouseMove);
  }

  // SECTION Globe
  function initGlobe() {
    // Initialize the Globe
    Globe = new ThreeGlobe({
      waitForGlobeReady: true,
      animateIn: true,
    })
      .hexPolygonsData(countries.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.5)
      .objectLat("lat")
      .objectLng("lng")
      .objectAltitude("alt")
      .objectFacesSurface(false)
      .showGraticules(true)
      .showAtmosphere(true)
      .atmosphereColor("#3a228a")
      .atmosphereAltitude(0.25)
      .hexPolygonColor((e: any) => {
        return "rgba(255,255,255, 1)";
      })
      .onGlobeReady(() => {
        console.log("La terre est fini");
      });

    const satGeometry = new OctahedronGeometry(
      (80 * Globe.getGlobeRadius()) / 6371 / 2,
      0
    );
    const satMaterial = new MeshLambertMaterial({
      color: "palegreen",
      transparent: true,
      opacity: 1,
    });

    const cube = new Mesh(satGeometry, satMaterial);

    Globe.objectThreeObject(() => {
      console.log(randFloat(1,1000))
      const cube = new Mesh(satGeometry, satMaterial);
      cube.addEventListener("mouseover", (event) => {
        event.target.material.color.set(0xff0000);
        document.body.style.cursor = "pointer";
      });
      cube.addEventListener("mouseout", (event) => {
        event.target.material.color.set(0xffffff);
        document.body.style.cursor = "default";
      });
      interactionManager.add(cube)
      return cube
      
    });

    // NOTE Arc animations are followed after the globe enters the scene
    setTimeout(() => {
      // console.log(airportHistory.airports)
      // Globe.labelsData(airports_modif.airports)
      //   .labelColor(() => "#ffcb21")
      //   .labelDotRadius(0.3)
      //   // .labelSize((e: { size: any; }) => e.size)
      //   // .labelText("city")
      //   // .labelResolution(6)
      // .labelAltitude(0.01)

      // Globe.pointsData(airports.airports)
      //   .pointColor(() => "#00ff00")
      //   .pointsMerge(true)
      //   .pointAltitude(0.001)
      //   .pointRadius(0.4);

      airports.airports.forEach((d: any) => {
        d.alt = 0.3;
      });

      Globe.objectsData(airports.airports);
    }, 1000);

    Globe.rotateY(-Math.PI * (5 / 9));
    Globe.rotateZ(-Math.PI / 6);
    const globeMaterial = Globe.globeMaterial();
    globeMaterial.color = new Color(0x3a228a);
    globeMaterial.emissive = new Color(0x220038);
    globeMaterial.emissiveIntensity = 0.1;
    globeMaterial.shininess = 0.7;

    // NOTE Cool stuff
    // globeMaterial.wireframe = true;

    scene.add(Globe);
  }

  function onMouseMove(event: any) {
    // mouseX = event.clientX - windowHalfX;
    // mouseY = event.clientY - windowHalfY;
    // console.log("x: " + mouseX + " y: " + mouseY);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    windowHalfX = window.innerWidth / 1.5;
    windowHalfY = window.innerHeight / 1.5;
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    controls.update();
    interactionManager.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
});
</script>

<template>
  <div ref="body" class="w-full h-screen bg-violet-900"></div>
  <!-- <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav> -->

  <!-- <RouterView /> -->

  <!-- <div class="flex flex-col w-full">
    [
    <template v-for="airport in airportsRef">
      <div class="w-full"> {
        "text": "{{ airport.iata_code }}",
        "city": "{{ airport.city }}",
        "country": "{{ airport.country }}",
        "size": 1.0,
        "lat": "{{ airport._geoloc.lat }}",
        "lng": "{{ airport._geoloc.lng }}"
      },
      </div>
    </template>
    ]
  </div> -->
</template>
