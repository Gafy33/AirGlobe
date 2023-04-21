<script setup lang="ts">
import ThreeGlobe from "three-globe";
import {
  WebGLRenderer,
  Scene,
  Mesh,
  MeshLambertMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Color,
  Fog,
  PointLight,
  Vector3,
} from "three";
import { InteractionManager } from "three.interactive";
import Stats from "stats.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { onMounted, ref } from "vue";
import axios from "axios";

import Load from "@/components/Load.vue";

const canvasGlobe = ref();
const ViewList = ref("plane");
const countries = ref();
const airports = ref();
const load = ref(false);
const messageLoad = ref("");

onMounted(async () => {
  let renderer: any,
    camera: any,
    scene: any,
    controls: any,
    interactionManager: any;
  let Globe: any;
  let stats: any;

  await init();
  await initGlobe();
  await onWindowResize();
  await animate();

  function createStats() {
    let stats: any = new Stats();
    stats.setMode(0);
    return stats;
  }

  async function getCountrie() {
    messageLoad.value = "Récupération des continents";
    const { data } = await axios.get("./assets/globe-data-min.json");
    return data;
  }

  async function getAirport() {
    messageLoad.value = "Récupération des aéroports";
    const { data } = await axios.get("./assets/airport.json");
    return data;
  }

  // SECTION Initializing core ThreeJS elements
  async function init() {
    countries.value = await getCountrie();
    airports.value = await getAirport();

    messageLoad.value = "Création de la planète";
    // Initialize renderer
    renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(
      canvasGlobe.value.clientWidth,
      canvasGlobe.value.clientHeight
    );
    canvasGlobe.value.appendChild(renderer.domElement);

    // Initialize scene, light
    scene = new Scene();
    scene.add(new AmbientLight(0xbbbbbb, 0.3));

    // Initialize camera, light
    camera = new PerspectiveCamera();
    camera.aspect =
      canvasGlobe.value.clientWidth / canvasGlobe.value.clientHeight;
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

    interactionManager = new InteractionManager(
      renderer,
      camera,
      renderer.domElement
    );

    window.addEventListener("resize", onWindowResize, false);

    stats = createStats();
    document.body.appendChild(stats.domElement);
  }

  // SECTION Globe
  async function initGlobe() {
    messageLoad.value = "Ajout des continents";
    console.log(countries.value.features);
    // Initialize the Globe
    Globe = new ThreeGlobe({
      waitForGlobeReady: true,
      animateIn: true,
    })
      .objectLat("lat")
      .objectLng("lng")
      .objectAltitude("alt")
      .objectFacesSurface(false)
      .showAtmosphere(true)
      .atmosphereColor("#3a228a")
      .atmosphereAltitude(0.25)
      .hexPolygonsData(countries.value.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.5)
      .hexPolygonColor((e: any) => {
        return "rgba(255,255,255, 1)";
      });

    messageLoad.value = "Ajout des avions";

    const satGeometry = new OctahedronGeometry(
      (80 * Globe.getGlobeRadius()) / 6371 / 1.5,
      0
    );

    Globe.objectThreeObject((e: any) => {
      const satMaterial = new MeshLambertMaterial({
        color: "palegreen",
        opacity: 1,
      });

      const cube: any = new Mesh(satGeometry, satMaterial);
      cube.airportData = {
        city: e.city,
        country: e.country,
        lat: e.lat,
        lng: e.lng,
      };
      cube.addEventListener("mouseover", (event: any) => {
        event.target.material.color.set(0xff0000);
        document.body.style.cursor = "pointer";
      });
      cube.addEventListener("mouseout", (event: any) => {
        event.target.material.color.set(0xffffff);
        document.body.style.cursor = "default";
      });

      cube.addEventListener("click", (event: any) => {
        console.log(event.target);
        console.log(Globe.toGeoCoords(event.target.parent.position))
        camera.position.longitude(event.target.parent.position.x)
      });

      interactionManager.add(cube);
      return cube;
    });

    // NOTE Arc animations are followed after the globe enters the scene
    // console.log(airportHistory.airports)
    // Globe.labelsData(airports_modif.airports)
    //   .labelColor(() => "#ffcb21")
    //   .labelDotRadius(0.3)
    //   // .labelSize((e: { size: any; }) => e.size)
    //   // .labelText("city")
    //   // .labelResolution(6)
    // .labelAltitude(0.01)

    Globe.rotateY(-Math.PI * (5 / 9));
    Globe.rotateZ(-Math.PI / 6);
    const globeMaterial = Globe.globeMaterial();
    globeMaterial.color = new Color(0x3a228a);
    globeMaterial.emissive = new Color(0x220038);
    globeMaterial.emissiveIntensity = 0.1;
    globeMaterial.shininess = 0.7;
    scene.add(Globe);

    //ajouts des aéroports
    Globe.pointsData(airports.value.airports)
      .pointColor(() => "#00ff00")
      .pointsMerge(true)
      .pointAltitude(0.001)
      .pointRadius(0.4);

    //ajouts des planes
    Globe.objectsData(airports.value.airports).objectAltitude(0.3);

    setTimeout(() => {
      load.value = true;
    }, 1000);
  }

  async function getPlane(uuid: any) {
    console.log(airports.value);
  }
  async function onWindowResize() {
    camera.aspect =
      canvasGlobe.value.clientWidth / canvasGlobe.value.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(
      canvasGlobe.value.clientWidth,
      canvasGlobe.value.clientHeight
    );
  }

  function animate() {
    controls.update();
    interactionManager.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    stats.update();
  }
});
</script>

<template>
  <div class="relative w-full h-screen flex flex-row bg-main-primary z-[0]">
    <div
      class="relative w-1/5 h-full bg-main-primary border-r-4 border-main-secondary"
    >
      <div
        class="text-2xl text-white font-extrabold text-center uppercase Orbitron h-[90px] flex justify-center items-center"
      >
        Air globe
      </div>
      <div class="relative flex flex-row bg-main-secondary h-[50px]">
        <div
          class="text-white text-xl w-14 h-full flex justify-center items-center"
        >
          <ion-icon name="search-outline"></ion-icon>
        </div>
        <input
          type="text"
          class="w-full pr-2 h-full bg-main-secondary text-white outline-none text-sm"
          placeholder="Rechercher"
        />
      </div>
      <div
        class="relative flex flex-row h-[50px] border-b-4 border-main-secondary"
      >
        <div
          class="h-full w-1/2 flex justify-center items-center text-white text-sm Orbitron cursor-pointer uppercase"
          :class="
            ViewList === 'plane'
              ? 'bg-extra-secondary'
              : 'hover:bg-extra-secondary'
          "
          @click="ViewList = 'plane'"
        >
          Avion
        </div>
        <div
          class="h-full w-1/2 flex justify-center items-center text-white text-sm Orbitron hover:bg-extra-secondary cursor-pointer uppercase"
          :class="
            ViewList === 'airport'
              ? 'bg-extra-secondary'
              : 'hover:bg-extra-secondary'
          "
          @click="ViewList = 'airport'"
        >
          Aéroport
        </div>
      </div>
      <div
        class="relative flex-col h-[calc(100vh-190px)] overflow-y-auto"
        :class="ViewList === 'plane' ? 'flex' : 'hidden'"
        @click="ViewList = 'plane'"
      >
        <div
          class="h-[50px] w-full flex justify-start items-center px-4 text-white text-sm Orbitron cursor-pointer uppercase hover:bg-extra-secondary"
          @click="ViewList = 'plane'"
        >
          Avion
        </div>
      </div>
      <div
        class="relative flex-col h-[calc(100vh-190px)] overflow-y-auto"
        :class="ViewList === 'airport' ? 'flex' : 'hidden'"
        @click="ViewList = 'plane'"
      >
        <div
          class="h-[50px] w-full flex justify-start items-center px-4 text-white text-sm Orbitron cursor-pointer uppercase hover:bg-extra-secondary"
          @click="ViewList = 'plane'"
        >
          Avion
        </div>
      </div>
    </div>
    <div ref="canvasGlobe" class="relative w-4/5 h-full bg-main-primary"></div>
  </div>
  <div
    class="absolute top-0 lef-0 w-full h-screen flex flex-col justify-center items-center bg-main-primary gap-10 z-[1]"
    :class="!load ? 'flex' : 'hidden'"
  >
    <div class="text-white text-2xl Orbitron">{{ messageLoad }}</div>
    <Load />
  </div>

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

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Orbitron&display=swap");

.Orbitron {
  font-family: "Orbitron", sans-serif;
}
</style>
