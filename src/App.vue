<script setup lang="ts">
import { onMounted, ref } from "vue";
import axios from "axios";
import Load from "@/components/Load.vue";
import Globe from "./components/Globe.vue";

const planesRef: any = ref([]);
const ViewList = ref("plane");
const countries = ref();
const airports = ref();
const load = ref(false);
const messageLoad = ref("");
const search = ref("");
const time = ref();

const planeChoise = ref(false);

onMounted(async () => {
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

  countries.value = await getCountrie();
  airports.value = await getAirport();

  let max = 200;

  const username = "Gafy33";
  const password = "Armalbdf33380";

  messageLoad.value = "Récupération des avions";
  getPlane();

  async function getPlane() {
    let count = 0;
    await axios
      .get("https://opensky-network.org/api/states/all", {
        auth: {
          username: username,
          password: password,
        },
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((data) => {
        time.value = data.data.time;
        planesRef.value = [];
        data.data.states.forEach((plane: any) => {
          if (count < max) {
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

            planesRef.value.push(object);
            count++;
          }
        });
      });
  }

  messageLoad.value = "Création de la planète";
  load.value = true;

  // setInterval(getPlane(), 2000);
});

const HandleplaneChoise = () => {
  planeChoise.value = !planeChoise.value
}
</script>

<template>
  <div
    class="relative w-full h-screen flex flex-row bg-main-primary z-[0] overflow-hidden"
  >
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
        class="relative flex-col h-[calc(100vh-190px)] overflow-y-auto"
        :class="ViewList === 'plane' ? 'flex' : 'hidden'"
      >
        <!-- <button @click="HandleplaneChoise">{{planeChoise}}</button> -->
        <template v-if="planesRef">
          <template v-for="plane in planesRef">
            <template
              v-if="
                !search ||
                (search &&
                  (plane.icao24.toUpperCase().includes(search) ||
                    plane.icao24.includes(search)))
              "
            >
              <div
                class="w-full flex flex-row gap-4 justify-start items-center px-4 py-4 text-white text-sm cursor-pointer uppercase hover:bg-extra-secondary border-b border-main-secondary/50"
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
        class="relative h-[calc(100vh-190px)]"
        :class="ViewList === 'airport' ? 'flex' : 'hidden'"
      >
        <div class="relative flex flex-col h-full overflow-y-auto w-full">
          <template v-if="airports">
            <template v-for="airport in airports.airports">
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
                      airport.city.includes(search)))
                "
              >
                <div
                  class="w-full flex flex-row gap-4 justify-start items-center px-4 h-[50px] shrink-0 text-white text-sm cursor-pointer uppercase hover:bg-extra-secondary border-b border-main-secondary/50"
                >
                  <span class="bg-extra-primary p-1">{{ airport.icao }}</span>
                  <span class="text-xs normal-case"
                    >{{ airport.time_position }} <br />
                    {{ airport.country }} | {{ airport.city }}</span
                  >
                </div>
              </template>
            </template>
          </template>
        </div>
      </div>
    </div>
    <template v-if="airports && countries && planesRef">
      <div class="relative w-4/5 flex flex-row h-full bg-main-primary overflow-hidden">
        <div class="relative bg-red-500 h-full duration-300 ease-in-out overflow-hidden" :class="planeChoise ? 'w-1/5': 'w-0'">
          <button @click="HandleplaneChoise">Close</button>
        </div>
        <Globe
          :airports="airports.airports"
          :countries="countries.features"
          :planes="planesRef"
          :plane-choise="planeChoise"
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
</style>
