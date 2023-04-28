<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import axios from "axios";
import Load from "@/components/Load.vue";
import Globe from "./components/Globe.vue";
import Aeroport from "./components/Aeroport.vue";
import Plane from "./components/Plane.vue";

const planesRef: any = ref([]); // Liste des avions
const ViewList = ref("plane"); // Affiche la liste, soit "avion" soit "aeroport"
const countries = ref(); // La liste des continents
const airports: any = ref(); // la liste des aéroports
const load = ref(false); // Pour attendre le chargement des différents composant
const messageLoad = ref(""); // Message pour le chargement
const search = ref(""); // POur la barre de recherche
const time = ref(); 
const max = ref(100);
const objectChoose = ref(); // L'objet choisi, soit une avion, soit un aeroport
const messageError = ref();
const indexObject = ref(); // index Objet

const showSettings = ref(false);

//Récupere l'identifiant API si il existe dans le local storage sinon null par default
let auth = localStorage.getItem("auth")
  ? JSON.parse(<string>localStorage.getItem("auth"))
  : null;

const username = auth ? ref(auth.username) : ref();
const password = auth ? ref(auth.password) : ref();

const usernameAPI = auth ? ref(auth.username) : ref();
const passwordAPI = auth ? ref(auth.password) : ref();

onMounted(async () => {

  //Récupère les continents depuis un fichier
  async function getCountrie() {
    messageLoad.value = "Récupération des continents";
    const { data } = await axios.get("./assets/globe-data-min.json");
    return data;
  }

  //Récupère un aéroports depuis un fichier
  async function getAirport() {
    messageLoad.value = "Récupération des aéroports";
    const { data } = await axios.get("./assets/airport.json");
    return data;
  }

  //Ajoute les continents et les aéroports
  countries.value = await getCountrie();
  airports.value = await getAirport();
  messageLoad.value = "Création de la planète";
});

//Attend que le globe soit initialiser pour aller demander a l'API Open sky de récupérer les avions. Récupère les avions tous les 5sec
function intervalGetPlane() {
  setInterval(getPlane, 5000);
}


//Récupère les avions, les formates opur correspondre au globe
async function getPlane() {
  messageLoad.value = "Récupération des avions";
  let count = 0;

  //Si connecter avec les identifiants sinon sans identifiants
  if (usernameAPI.value && passwordAPI.value) {
    await axios
      .get("https://opensky-network.org/api/states/all", {
        auth: {
          username: usernameAPI.value,
          password: passwordAPI.value,
        },
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((data) => {
        time.value = data.data.time;
        let tabPlane: any = [];
        data.data.states.forEach((plane: any) => {
          if (count < max.value) {
            let object: any = {
              icao24: plane[0],
              callsign: plane[1],
              origin_country: plane[2],
              time_position: plane[3],
              lng: plane[5],
              lat: plane[6],
              alt: plane[7] / 6371 / 25,
              on_ground: plane[8],
              velocity: plane[9],
              true_track: plane[10],
              vertical_rate: plane[11],
              geo_altitude: plane[13],
              category: plane[16],
            };

            tabPlane.push(object);
            count++;
          }
        });
        planesRef.value = tabPlane;
      })
      .catch((error) => {
        messageError.value =
          "L'identification à échouée. L'api ne peut pas fonctionner";

        setTimeout(() => {
          messageError.value = null;
        }, 2500);
      });
  } else {
    await axios
      .get("https://opensky-network.org/api/states/all")
      .then((data) => {
        time.value = data.data.time;
        let tabPlane: any = [];
        data.data.states.forEach((plane: any) => {
          if (count < max.value) {
            let object: any = {
              icao24: plane[0],
              callsign: plane[1],
              origin_country: plane[2],
              time_position: plane[3],
              lng: plane[5],
              lat: plane[6],
              alt: plane[7] / 6371 / 25,
              on_ground: plane[8],
              velocity: plane[9],
              true_track: plane[10],
              vertical_rate: plane[11],
              geo_altitude: plane[13],
              category: plane[16],
            };

            tabPlane.push(object);
            count++;
          }
        });
        planesRef.value = tabPlane;
      })
      .catch((error) => {
        messageError.value = "L'api ne peut pas fonctionner";

        setTimeout(() => {
          messageError.value = null;
        }, 2500);
      });
  }
  messageLoad.value = "Récupération des avions";
  load.value = true;
}


//Quand on arrête de choisir un objet
const HandleobjectChoose = () => {
  objectChoose.value = null;
  indexObject.value = null;
};

//Sauvegarde les identifiants de l'api
const saveUsernamePasswordApi = () => {
  localStorage.setItem(
    "auth",
    JSON.stringify({ username: username.value, password: password.value })
  );
  passwordAPI.value = password.value;
  usernameAPI.value = username.value;
};


//Choisi un aéroport dans la liste airports depuis son index et défini ObjectChoose 
const handleChooseAeroport = (index: number) => {
  indexObject.value = index;
  objectChoose.value = {
    type: "aeroport",
    airport: airports.value.airports[index],
  };
};

//Choisi un avion dans la liste PlanesRef depuis son index et défini ObjectChoose 
const handleChoosePlane = (index: number) => {
  indexObject.value = index;
  objectChoose.value = {
    type: "plane",
    plane: planesRef.value[index],
  };
};

//permet de passer au suivant dans les listes
const suivantListe = () => {
  if (objectChoose.value && objectChoose.value.type === "plane") {
    if (indexObject.value < max.value) {
      handleChoosePlane(indexObject.value + 1);
    }
  } else if (objectChoose.value && objectChoose.value.type === "aeroport") {
    if (indexObject.value < 2266) {
      handleChooseAeroport(indexObject.value + 1);
    }
  }
};

//permet de passer au suivant dans les listes
const precedentListe = () => {
  if (indexObject.value > 0) {
    if (objectChoose.value && objectChoose.value.type === "plane") {
      handleChoosePlane(indexObject.value - 1);
    } else if (objectChoose.value && objectChoose.value.type === "aeroport") {
      handleChooseAeroport(indexObject.value - 1);
    }
  }
};

//Permet de récupérer l'objet d'un liste si on clique depuis le globe
const chooseObjectHandle = (data:any) => {

  //Si l'objet sélectionné est un avion
  if(data.type === 'plane') {
    planesRef.value.forEach((plane:any, index:number) => {
      if(plane.icao24 === data.icao) {
        handleChoosePlane(index)
      }
    })
  }

  //Si l'objet sélectionné est un aéorport
  if(data.type === 'aeroport') {
    airports.value.airports.forEach((airport:any, index:number) => {
      if(airport.icao === data.icao) {
        handleChooseAeroport(index)
      }
    })
  }

  //Si il déselectionné
  if(data.type === "deselect") {
    objectChoose.value = null;
  }
}
</script>

<template>
  <div
    class="relative w-full h-screen flex flex-row bg-main-primary z-[0] overflow-hidden"
  >
    <div
      class="absolute top-4 left-1/2 bg-red-500 py-4 px-8 z-[99] rounded-full text-white text-xs -translate-x-[calc(100%/2)]"
      v-if="messageError"
    >
      {{ messageError }}
    </div>
    <div
      class="absolute top-0 flex flex-col flex-column bg-main-secondary h-full z-[99] w-[350px] duration-300 ease-in-out"
      :class="showSettings ? 'right-0' : '-right-[350px]'"
    >
      <div class="absolute right-4 top-4 text-sm text-white">
        <ion-icon
          name="close-outline"
          class="w-6 h-6 cursor-pointer"
          @click="showSettings = !showSettings"
        ></ion-icon>
      </div>
      <div class="Orbitron text-white w-full py-4 text-xl text-center">
        Paramètres
      </div>
      <div class="flex flex-col px-4">
        <div class="text-white py-2 text-sm">Nbr Avions à afficher</div>
        <input
          type="number"
          class="text-white bg-main-primary text-xs py-3 px-4 rounded outline-none"
          v-model="max"
        />
      </div>

      <div class="flex flex-col px-4 mt-16">
        <div class="text-white py-2">Identifiant à l'API (non nécessaire)</div>
      </div>
      <div class="flex flex-col px-4">
        <div class="text-white py-2 text-sm">Username</div>
        <input
          type="text"
          class="text-white bg-main-primary text-xs py-3 px-4 rounded outline-none"
          v-model="username"
        />
      </div>
      <div class="flex flex-col px-4">
        <div class="text-white py-2 text-sm">Mot de passe</div>
        <input
          type="password"
          class="text-white bg-main-primary text-xs py-3 px-4 rounded outline-none"
          v-model="password"
        />
      </div>
      <div class="flex flex-col px-4 mt-4">
        <button
          class="text-white bg-extra-secondary hover:bg-extra-primary text-xs py-3 px-4 rounded outline-none"
          @click="saveUsernamePasswordApi"
        >
          Sauvegarder
        </button>
      </div>
    </div>
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
          v-model="search"
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
          <span class="ml-2 text-xs font-mono" v-if="planesRef"
            >({{ planesRef.length }})</span
          >
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
          <span class="ml-2 text-xs font-mono" v-if="airports"
            >({{ airports.airports.length }})</span
          >
        </div>
      </div>
      <div
        class="relative flex flex-col h-[calc(100vh-190px)]"
        :class="ViewList === 'plane' ? 'flex' : 'hidden'"
      >
        <div class="relative flex flex-col h-[93%] overflow-y-auto w-full">
          <template v-if="planesRef">
            <template v-for="(plane, index) in planesRef">
              <template
                v-if="
                  !search ||
                  (search &&
                    (plane.icao24.toUpperCase().includes(search) ||
                      plane.icao24.includes(search) ||
                      plane.origin_country.toLowerCase().includes(search) ||
                      plane.origin_country.includes(search)))
                "
              >
                <div
                  class="w-full flex flex-row gap-4 justify-start items-center px-4 h-[50px] shrink-0 text-white text-sm cursor-pointer uppercase hover:bg-extra-secondary border-b border-main-secondary/50"
                  @click="handleChoosePlane(index)"
                  :class="
                    objectChoose &&
                    objectChoose.type === 'plane' &&
                    objectChoose.plane.icao24 === plane.icao24
                      ? 'bg-main-secondary'
                      : ''
                  "
                >
                  <span class="bg-extra-primary p-1">{{ plane.icao24 }}</span>
                  <span class="text-xs normal-case"
                    >{{ plane.on_ground ? "Au sol" : "En vol" }} <br />
                    {{ plane.origin_country }} | {{ plane.callsign }}</span
                  >
                </div>
              </template>
            </template>
          </template>
        </div>
        <div
          class="relative flex flex-row gap-4 h-[7%] justify-center items-center w-full border-t-2 border-main-secondary"
        >
          <button
            type="button"
            class="w-32 py-2 bg-extra-secondary hover:bg-extra-primary text-white text-xs"
            @click="precedentListe"
          >
            Précédent
          </button>
          <button
            type="button"
            class="w-32 py-2 bg-extra-secondary hover:bg-extra-primary text-white text-xs"
            @click="suivantListe"
          >
            Suivant
          </button>
        </div>
      </div>
      <div
        class="relative h-[calc(100vh-190px)] flex flex-col"
        :class="ViewList === 'airport' ? 'flex' : 'hidden'"
      >
        <div class="relative flex flex-col h-[93%] overflow-y-auto w-full">
          <template v-if="airports">
            <template v-for="(airport, index) in airports.airports">
              <template
                v-if="
                  !search ||
                  (search &&
                    (airport.icao.includes(search) ||
                      airport.text.toLowerCase().includes(search) ||
                      airport.country.toLowerCase().includes(search) ||
                      airport.city.toLowerCase().includes(search) ||
                      airport.text.includes(search) ||
                      airport.country.includes(search) ||
                      airport.city.includes(search))) ||
                  airport.text.includes(search)
                "
              >
                <div
                  class="w-full flex flex-row gap-4 justify-start items-center px-4 h-[50px] shrink-0 text-white text-sm cursor-pointer uppercase hover:bg-extra-secondary border-b border-main-secondary/50"
                  @click="handleChooseAeroport(index)"
                  :class="
                    objectChoose &&
                    objectChoose.type === 'aeroport' &&
                    objectChoose.airport.icao === airport.icao
                      ? 'bg-main-secondary'
                      : ''
                  "
                >
                  <span class="bg-extra-primary p-1">{{ airport.icao }}</span>
                  <span class="text-xs normal-case"
                    >{{ airport.text }} <br />
                    {{ airport.country }} | {{ airport.city }}</span
                  >
                </div>
              </template>
            </template>
          </template>
        </div>
        <div
          class="relative flex flex-row gap-4 h-[7%] justify-center items-center w-full border-t-2 border-main-secondary"
        >
          <button
            type="button"
            class="w-32 py-2 bg-extra-secondary hover:bg-extra-primary text-white text-xs"
            @click="precedentListe"
          >
            Précédent
          </button>
          <button
            type="button"
            class="w-32 py-2 bg-extra-secondary hover:bg-extra-primary text-white text-xs"
            @click="suivantListe"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
    <template v-if="airports && countries">
      <div
        class="relative w-4/5 flex flex-row h-full bg-main-primary overflow-hidden"
      >
        <div class="absolute left-4 bottom-4 text-sm text-white">
          time : {{ time }}
        </div>
        <div class="absolute right-4 top-4 text-sm text-white z-[98]">
          <ion-icon
            name="settings-outline"
            class="w-8 h-8 cursor-pointer"
            @click="showSettings = !showSettings"
          ></ion-icon>
        </div>
        <!-- Menu pour le détails des aérorports -->
        <Aeroport
          :object-choose="objectChoose"
          @closeObjectChoose="HandleobjectChoose"
          :key="objectChoose"
        />
        <!-- Menu pour le détails des avions -->
        <Plane
          :object-choose="objectChoose"
          @closeObjectChoose="HandleobjectChoose"
          :key="objectChoose"
        />
        <!-- Le globe en 3D -->
        <Globe
          :airports="airports.airports"
          :countries="countries.features"
          :planes="planesRef"
          :object-choose="objectChoose"
          @choose-object="chooseObjectHandle"
          @globe-ready="intervalGetPlane"
        />
      </div>
    </template>
  </div>
  <div
    class="absolute top-0 lef-0 w-full h-screen flex flex-col justify-center items-center bg-main-primary gap-10 z-[1]"
    :class="!load ? 'flex' : 'hidden'"
  >
    <div class="text-white text-2xl Orbitron">{{ messageLoad }}</div>
    <Load />
  </div>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Orbitron&display=swap");

.Orbitron {
  font-family: "Orbitron", sans-serif;
}

::-webkit-scrollbar {
  width: 14px;
}

/*Appliquer des modifications sur le fond de la zone de l'ascenseur.*/
::-webkit-scrollbar-track {
  border: solid 3px transparent;
}

/*Cible l'ascenseur lui-même.*/
::-webkit-scrollbar-thumb {
  box-shadow: inset 0 0 10px 10px #34acc5;
  border: solid 5px transparent;
  border-radius: 10px;
}

.shadow-css {
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
}
</style>
