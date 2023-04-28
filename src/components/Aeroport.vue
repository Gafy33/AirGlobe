<template>
  <div
    class="relative bg-main-secondary h-full duration-300 ease-in-out overflow-hidden"
    :class="
      objectChoose && objectChoose.type === 'aeroport'
        ? 'w-3/12 shadow-css'
        : 'w-0'
    "
  >
    <button
      class="absolute top-3 right-3 text-white text border flex justify-center items-center w-6 h-6 rounded-full"
      @click="$emit('closeObjectChoose')"
    >
      <ion-icon name="close-outline"></ion-icon>
    </button>

    <template v-if="objectChoose && objectChoose.type === 'aeroport'">
      <div
        class="bg-extra-secondary w-full h-[50px] flex justify-center items-center text-white"
      >
        {{ objectChoose?.airport.text }}
      </div>
      <div class="h-[220px] flex flex-col py-4 px-4 gap-2">
        <div class="text-white">Ville : {{ objectChoose?.airport.city }}</div>
        <div class="text-white">Pays : {{ objectChoose?.airport.country }}</div>
        <div class="text-white">
          Longitude : {{ objectChoose?.airport.lng }}
        </div>
        <div class="text-white">latitude : {{ objectChoose?.airport.lat }}</div>
        <div class="text-white">ICAO : {{ objectChoose?.airport.icao }}</div>
        <div class="text-white">IATA : {{ objectChoose?.airport.iata }}</div>
      </div>

      <div class="h-[50px] flex flex-col justify-center items-center text-white text-xs">
        Du {{ new Date(dateBegin * 1000).toLocaleDateString() }} au {{ new Date(dateEnd * 1000).toLocaleDateString() }}
      </div>
      <div class="w-full h-[calc(100vh-320px)] flex flex-col">
        <div class="w-full h-1/2">
          <div
            class="w-full h-[50px] flex items-center px-4 text-white bg-main-primary"
          >
            Arrivées à l'aéroport
          </div>
          <div class="w-full h-[calc(100%-50px)] flex flex-col overflow-y-auto">
            <template v-if="loadArrival">
              <template v-if="!errorArrival">
                <template v-for="plane in planeArrival" :key="plane">
                  <div
                    class="w-full flex flex-row justify-start items-center px-4 gap-4 h-[50px] shrink-0 text-white text-sm uppercase hover:bg-extra-secondary border-b border-main-primary/50"
                  >
                    <span class="bg-extra-primary p-1">{{ plane.icao24 }}</span>
                    <span class="text-xs normal-case"
                      >Aéroport Départ : {{ plane.estDepartureAirport }} <br />
                      Aéroport Arrivé : {{ plane.estArrivalAirport }}</span
                    >
                  </div>
                </template>
              </template>
              <template v-else>
                <div
                  class="relative w-full h-full flex justify-center items-center text-white"
                >
                  {{ errorArrival }}
                </div>
              </template>
            </template>
            <template v-else>
              <div
                class="relative w-full h-full flex justify-center items-center"
              >
                <LoadVue />
              </div>
            </template>
          </div>
        </div>
        <div class="w-full h-1/2">
          <div
            class="w-full h-[50px] flex items-center px-4 text-white bg-main-primary"
          >
            Départs de l'aéroport
          </div>
          <div class="w-full h-[calc(100%-50px)] flex flex-col overflow-y-auto">
            <template v-if="loadDeparture">
              <template v-if="!errorDeparture">
                <template v-for="plane in planeDeparture">
                  <div
                    class="w-full flex flex-row justify-start items-center px-4 gap-4 h-[50px] shrink-0 text-white text-sm uppercase hover:bg-extra-secondary border-b border-main-primary/50"
                  >
                    <span class="bg-extra-primary p-1">{{ plane.icao24 }}</span>
                    <span class="text-xs normal-case"
                      >Aéroport Départ : {{ plane.estDepartureAirport }} <br />
                      Aéroport Arrivé : {{ plane.estArrivalAirport }}</span
                    >
                  </div>
                </template>
              </template>
              <template v-else>
                <div
                  class="relative w-full h-full flex justify-center items-center text-white"
                >
                  {{ errorDeparture }}
                </div>
              </template>
            </template>
            <template v-else>
              <div
                class="relative w-full h-full flex justify-center items-center"
              >
                <LoadVue />
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import axios from "axios";
import LoadVue from "./Load.vue";

export default {
  name: "Aeroport",
  props: {
    objectChoose: Object,
  },
  data() {
    return {
      planeArrival: [] as any,
      planeDeparture: [] as any,
      dateBegin: new Date(new Date().toDateString()).getTime() / 1000,
      dateEnd: null as any,
      loadArrival: false,
      loadDeparture: false,
      errorArrival: "",
      errorDeparture: "",
    };
  },
  async mounted() {
    if (this.objectChoose && this.objectChoose.type === "aeroport") {
      //Ajoute 1 jour a la date actuel
      function addDaysToDate(date: string | number | Date, days: number) {
        var res = new Date(date);
        res.setDate(res.getDate() + days);
        return res;
      }

      let tmpDate = new Date(new Date().toDateString()); // Récupère la date actuel à 0h00
      let newDate = addDaysToDate(tmpDate, 1); // Ajoute 1Jour 
      this.dateEnd = newDate.getTime() / 1000; // Enlève les nombres décimals
      if (this.dateEnd) {

        // Récupère les avions qui arrivent dans l'aéroport entre les dates
        await axios
          .get(
            `https://opensky-network.org/api/flights/arrival?airport=${this.objectChoose.airport.icao}&begin=${this.dateBegin}&end=${this.dateEnd}`
          )
          .then((data: any) => {
            this.planeArrival = data.data;
            this.loadArrival = true;
          })
          .catch((error) => {
            this.errorArrival = "Aucune arrivé de prévue";
            this.loadArrival = true;
          });

        // Récupère les avions qui partent de l'aéroport entre les dates
        axios
          .get(
            `https://opensky-network.org/api/flights/departure?airport=${this.objectChoose.airport.icao}&begin=${this.dateBegin}&end=${this.dateEnd}`
          )
          .then((data: any) => {
            this.planeDeparture = data.data;
            this.loadDeparture = true;
          })
          .catch((error) => {
            this.errorDeparture = "Aucun départ de prévu";
            this.loadDeparture = true;
          });
      }
    }
  },
  components: { LoadVue },
};
</script>

<style>
.shadow-css {
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
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
