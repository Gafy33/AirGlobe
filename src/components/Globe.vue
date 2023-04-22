<script setup lang="ts">
import Globe from "globe.gl";
import { Mesh, Color, MeshBasicMaterial } from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { onMounted, ref, watch } from "vue";

const canvasGlobe = ref();
const lastPLane = ref();
const earth = ref();

const props = defineProps({
  countries: Array as any,
  airports: Array as any,
  planes: Array as any,
});

onMounted(async () => {

  await init();
  await initGlobe();

  // SECTION Initializing core ThreeJS elements
  async function init() {
    // messageLoad.value = "Création de la planète";

    window.addEventListener("resize", onWindowResize, false);
    window.addEventListener("dblclick", function (e: any) {
      e.preventDefault();
      let oldCoord: any = earth.pointOfView();
      earth.pointOfView(
        { lat: oldCoord.lat, lng: oldCoord.lng, altitude: 2.5 },
        2000
      );
    });
  }

  // SECTION Globe
  async function initGlobe() {
    if (props.countries && props.airports && props.planes) {
      // messageLoad.value = "Chargement du model 'plane.obj'";

      // Chargement du model de l'avion avec c'est texture
      var objLoader = new OBJLoader();
      objLoader.setPath("./plane/");
      objLoader.load("11805_airplane_v2_L2.obj", async function (object: any) {
        //   messageLoad.value = "Ajout des continents";

        // Création du Globe
        // Ajout des continents
        earth.value = Globe()
          .backgroundColor("rgba(0,0,0,0)")
          .width(canvasGlobe.value.clientWidth)
          .height(canvasGlobe.value.clientHeight)
          .objectLat("lat")
          .objectLng("lng")
          .objectAltitude("alt")
          .objectRotation((e: any) => {
            e.__threeObj.rotation.z = e.true_track / 100;
            return e;
          })
          .objectFacesSurface(true)
          .showAtmosphere(true)
          .atmosphereColor("#3a228a")
          .atmosphereAltitude(0.25)
          .hexPolygonsData(props.countries)
          .hexPolygonResolution(3)
          .hexPolygonMargin(0.5)
          .hexPolygonColor((e: any) => {
            return "rgba(255,255,255, 0.5)";
          })
          .pointLabel((d: any) => {
            return `
            <div><b>${d.icao}</b></div>
          `;
          })
          .pointColor(() => "#00ff00")
          .pointAltitude(0.001)
          .pointRadius(0.2)
          .onObjectHover((object: any, prevObject: any) => {
            if (object) {
              if (
                !lastPLane.value ||
                lastPLane.value.icao24 !== object.icao24
              ) {
                object.__threeObj.children[0].children[0].material.color.set(
                  0xff0000
                );
                object.__threeObj.children[0].children[1].material.color.set(
                  0xff0000
                );
                document.body.style.cursor = "pointer";
              }
            } else {
              if (
                !lastPLane.value ||
                lastPLane.value.icao24 !== prevObject.icao24
              ) {
                prevObject.__threeObj.children[0].children[0].material.color.set(
                  0xffd700
                );
                prevObject.__threeObj.children[0].children[1].material.color.set(
                  0xffd700
                );
              }
              document.body.style.cursor = "default";
            }
          })
          .onObjectClick((obj: any, event, { lat, lng }) => {
            if (lastPLane.value) {
              lastPLane.value.__threeObj.children[0].children[0].material.color.set(
                0xffd700
              );
              lastPLane.value.__threeObj.children[0].children[1].material.color.set(
                0xffd700
              );
            }
            lastPLane.value = obj;
            obj.__threeObj.children[0].children[0].material.color.set(0xff0000);
            obj.__threeObj.children[0].children[0].material.color.set(0xff0000);
            earth.value.pointOfView({ lat, lng, altitude: 0.3 }, 2000);
          })(canvasGlobe.value);

        //   messageLoad.value = "Ajout des avions";

        // NOTE Arc animations are followed after the globe enters the scene
        // console.log(airportHistory.airports)
        // Globe.labelsData(airports_modif.airports)
        //   .labelColor(() => "#ffcb21")
        //   .labelDotRadius(0.3)
        //   // .labelSize((e: { size: any; }) => e.size)
        //   // .labelText("city")
        //   // .labelResolution(6)
        // .labelAltitude(0.01)

        const globeMaterial = earth.value.globeMaterial();
        globeMaterial.color = new Color(0x3a228a);
        globeMaterial.emissive = new Color(0x220038);
        globeMaterial.emissiveIntensity = 0.1;
        globeMaterial.shininess = 0.7;
        // scene.add(earth);

        //ajouts des aéroports sur le globe
        earth.value.pointsData(props.airports);

        //Création d'un objet 3D pour chaque avion
        earth.value.objectThreeObject((e: any) => {
          let MeshBras = new Mesh(
            object.children[1].geometry,
            new MeshBasicMaterial({ color: 0xffd700 })
          );
          let MeshBody = new Mesh(
            object.children[0].geometry,
            new MeshBasicMaterial({ color: 0xffd700 })
          );

          const cube: any = new Mesh();
          cube.add(MeshBras);
          cube.add(MeshBody);

          cube.scale.x = 0.003;
          cube.scale.y = 0.003;
          cube.scale.z = 0.003;

          cube.dataPlane = {
            alt: e.alt,
            lat: e.lat,
            lng: e.lng,
          };
          return cube;
        });

        //ajouts des avions sur le globe
        earth.value.objectsData(props.planes);

        //Création d'un objet 3D pour chaque avion
        earth.value.objectThreeObject((e: any) => {
          let MeshBras = new Mesh(
            object.children[1].geometry,
            new MeshBasicMaterial({ color: 0xffd700 })
          );
          let MeshBody = new Mesh(
            object.children[0].geometry,
            new MeshBasicMaterial({ color: 0xffd700 })
          );

          const cube: any = new Mesh();
          cube.add(MeshBras);
          cube.add(MeshBody);

          cube.scale.x = 0.003;
          cube.scale.y = 0.003;
          cube.scale.z = 0.003;

          cube.dataPlane = {
            alt: e.alt,
            lat: e.lat,
            lng: e.lng,
          };
          return cube;
        });

        //   load.value = true;
      });
    }
  }

  async function onWindowResize() {
    earth.value.width(canvasGlobe.value.clientWidth);
    earth.value.height(canvasGlobe.value.clientHeight);
  }
});

watch(
  () => props.planes,
  (first) => {
    earth.value.objectsData(first)
  }
);
</script>

<template>
  <div ref="canvasGlobe" class="relative w-4/5 h-full bg-main-primary"></div>
</template>
