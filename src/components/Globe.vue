<script setup lang="ts">
import axios from "axios";
import Globe from "globe.gl";
import { Mesh, Color, MeshBasicMaterial } from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { onMounted, ref, watch } from "vue";

const canvasGlobe = ref();
const lastPLane = ref();
const earth: any = ref();

const emit = defineEmits(["chooseObject", "globeReady"]);

const props = defineProps({
  countries: Array as any,
  airports: Array as any,
  planes: Array as any,
  objectChoose: Object as any,
});

onMounted(async () => {
  await init();
  await initGlobe();

  // Initialise les fonctions de click ou resiez pour le globe (window)
  async function init() {
    // messageLoad.value = "Création de la planète";

    window.addEventListener("resize", onWindowResize, false);

    //Déselecte et dézoom quand ou double click
    window.addEventListener("dblclick", function (e: any) {
      e.preventDefault();
      emit("chooseObject", { type: "deselect" });
      let oldCoord: any = earth.value.pointOfView();
      earth.value.pointOfView(
        { lat: oldCoord.lat, lng: oldCoord.lng, altitude: 2.5 },
        2000
      );
    });

    //Resize le globe quand le menu détail est ouvert ou fermé
    const resizeObserver = new ResizeObserver((entries) => {
      onWindowResize();
    });
    resizeObserver.observe(canvasGlobe.value);
  }

  // SECTION Globe
  async function initGlobe() {

    // Chargement du model de l'avion
    var objLoader = new OBJLoader();
    objLoader.setPath("./plane/");
    objLoader.load("11805_airplane_v2_L2.obj", async function (object: any) {

      // Création du Globe
      // Ajout des continents
      // Modifie les paramètres du globe
      // Modifie les hover ou click de chache objet 3D ( plane )
      //Gestion du globe et des objets dans le globe ( objet three )
      earth.value = Globe()
        .backgroundColor("rgba(0,0,0,0)")
        .width(canvasGlobe.value.clientWidth)
        .height(canvasGlobe.value.clientHeight)
        .objectLat("lat")
        .objectLng("lng")
        .objectAltitude("alt")
        .objectRotation((e: any) => {
          e.__threeObj.rotation.z = (e.true_track * 6.25) / 100;
          return e;
        }) // Tourne l'avion
        .objectFacesSurface(true)
        .showAtmosphere(true)
        .atmosphereColor("#3a228a")
        .atmosphereAltitude(0.25)
        .hexPolygonsData(props.countries) // Les continents
        .hexPolygonResolution(4)
        .hexPolygonMargin(0.5)
        .hexPolygonColor((e: any) => {
          return "rgba(255,255,255, 0.5)";
        })
        .pointLabel((d: any) => {
          return `
            <div><b>${d.text}</b></div>
          `;
        }) // affichage du text quand la souris passe sur un aéroport
        .pointColor((e) => {
          return "#00ff00";
        })
        .onGlobeReady(() => {
          emit("globeReady");
        }) // Quand le globe est ready
        .pointAltitude(0.001)
        .pointRadius(0.2)
        .pathColor(() => ["rgba(0,0,255,0.6)", "rgba(255,0,0,0.6)"])
        .pathDashLength(0.01)
        .pathDashGap(0.004)
        .pathDashAnimateTime(100000)
        .pathPointLat((arr) => arr[0])
        .pathPointLng((arr) => arr[1])
        .pathPointAlt((arr) => arr[2]) // Path de l'avion ( son parcours )
        .pathStroke(8)
        .onObjectHover((object: any, prevObject: any) => {
          if (object) {
            if (!lastPLane.value || lastPLane.value.icao24 !== object.icao24) {
              if (object.__threeObj) {
                object.__threeObj.children[0].children[0].material.color.set(
                  0xff0000
                );
                object.__threeObj.children[0].children[1].material.color.set(
                  0xff0000
                );
              }
              document.body.style.cursor = "pointer";
            }
          } else {
            if (
              !lastPLane.value ||
              lastPLane.value.icao24 !== prevObject.icao24
            ) {
              if (prevObject.__threeObj) {
                prevObject.__threeObj.children[0].children[0].material.color.set(
                  0xffd700
                );
                prevObject.__threeObj.children[0].children[1].material.color.set(
                  0xffd700
                );
              }
            }
            document.body.style.cursor = "default";
          }
        })
        .onObjectClick((obj: any) => {
          emit("chooseObject", { type: "plane", icao: obj.icao24 });
        })
        .onPointHover((object: any) => {
          if (object) {
            document.body.style.cursor = "pointer";
          } else {
            document.body.style.cursor = "default";
          }
        })
        .onPointClick((obj: any) => {
          emit("chooseObject", { type: "aeroport", icao: obj.icao });
        })(canvasGlobe.value);


      //Materiel du globe pour three JS 
      const globeMaterial = earth.value.globeMaterial();
      globeMaterial.color = new Color(0x3a228a);
      globeMaterial.emissive = new Color(0x220038);
      globeMaterial.emissiveIntensity = 0.1;
      globeMaterial.shininess = 0.7;

      //ajouts des aéroports sur le globe
      earth.value.pointsData(props.airports);

      //ajouts des avions sur le globe
      //Création d'un objet 3D pour chaque avion
      earth.value.objectThreeObject((e: any) => {
        let MeshBras: any;
        let MeshBody: any;
        if (lastPLane.value && e.icao24 === lastPLane.value.icao24) {
          MeshBras = new Mesh(
            object.children[1].geometry,
            new MeshBasicMaterial({ color: 0xff0000 })
          );
          MeshBody = new Mesh(
            object.children[0].geometry,
            new MeshBasicMaterial({ color: 0xff0000 })
          );

          lastPLane.value = e;
        } else {
          MeshBras = new Mesh(
            object.children[1].geometry,
            new MeshBasicMaterial({ color: 0xffd700 })
          );
          MeshBody = new Mesh(
            object.children[0].geometry,
            new MeshBasicMaterial({ color: 0xffd700 })
          );
        }

        const cube: any = new Mesh();
        cube.add(MeshBras);
        cube.add(MeshBody);

        cube.scale.x = 0.003;
        cube.scale.y = 0.003;
        cube.scale.z = 0.003;
        return cube;
      });

    });
  }

  //Resize le globe si on modifie la taille de la fenetre
  async function onWindowResize() {
    if (earth.value) {
      earth.value.width(canvasGlobe.value.clientWidth);
      earth.value.height(canvasGlobe.value.clientHeight);
    }
  }
});

//Rajoute les avions quand il reçoit les nouveaux avions depuis l'api ( tous les 5 sec ). Met à jour l'affichage des avions
watch(
  () => props.planes,
  (newValue) => {
    if (earth.value) {
      earth.value.objectsData(newValue);
    }
  }
);

//Met à jour l'objet choisi pour montrer à l'utilisateur soit l'avion soit l'aéroport choisi sur le globe
// Fixe la caméra sur l'objet en question
watch(
  () => props.objectChoose,
  (newValue) => {
    if (newValue) {
      if (newValue.type === "plane") {
        props.planes.forEach((data: any) => {
          if (data.icao24 === newValue.plane.icao24) {
            if (lastPLane.value) {
              if (lastPLane.value.__threeObj) {
                lastPLane.value.__threeObj.children[0].children[0].material.color.set(
                  0xffd700
                );
                lastPLane.value.__threeObj.children[0].children[1].material.color.set(
                  0xffd700
                );
              }
            }
            lastPLane.value = data;
            if (data.__threeObj) {
              data.__threeObj.children[0].children[0].material.color.set(
                0xff0000
              );
              data.__threeObj.children[0].children[1].material.color.set(
                0xff0000
              );
            }
            earth.value.pointOfView(
              { lat: data.lat, lng: data.lng, altitude: 0.3 },
              2000
            );

            //défini le parcours de l'avions
            getTrackPlane(data.icao24);
          }
        });
      }

      if (newValue.type === "aeroport") {
        props.airports.forEach((data: any) => {
          if (data.icao === newValue.airport.icao) {
            earth.value.pointOfView(
              { lat: data.lat, lng: data.lng, altitude: 0.3 },
              2000
            );
          }
        });
      }
    } else {
      if (lastPLane.value) {
        lastPLane.value.__threeObj.children[0].children[0].material.color.set(
          0xffd700
        );
        lastPLane.value.__threeObj.children[0].children[1].material.color.set(
          0xffd700
        );

        lastPLane.value = null;
      }

      earth.value.pathsData([]);
      let oldCoord: any = earth.value.pointOfView();
      earth.value.pointOfView(
        { lat: oldCoord.lat, lng: oldCoord.lng, altitude: 2.5 },
        2000
      );
    }
  }
);


//Récupère le parcours de l'avion depuis l'api et dessine le parcours sur le globe
async function getTrackPlane(icao24: number) {
  await axios
    .get(`https://opensky-network.org/api/tracks/all?icao24=${icao24}&time=0`)
    .then((data: any) => {
      const N_PATHS = 1;
      const pathPlane = [...Array(N_PATHS).keys()].map(() => {
        let lat = 0;
        let lng = 0;
        let alt = 0;

        return [
          ...data.data.path.map((point: any) => {
            lat = point[1] ? point[1] : 0;
            lng = point[2] ? point[2] : 0;
            alt = point[3] ? point[3] / 6371 / 25 : 0;
            return [lat, lng, alt];
          }),
        ];
      });
      earth.value.pathsData(pathPlane);
    });
}
</script>

<template>
  <div
    ref="canvasGlobe"
    class="h-full duration-300 ease-in-out"
    :class="objectChoose ? 'w-9/12' : 'w-full'"
  ></div>
</template>
