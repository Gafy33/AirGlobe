<template>
  <div
    class="relative bg-main-secondary h-full duration-300 ease-in-out overflow-hidden"
    :class="
      objectChoose && objectChoose.type === 'plane'
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

    <template v-if="objectChoose && objectChoose.type === 'plane'">
      <div
        class="bg-extra-secondary w-full h-[50px] flex justify-center items-center text-white"
      >
        {{ objectChoose?.plane.icao24 }}
      </div>
      <div class="h-[300px] flex flex-col py-4 px-4 gap-2">
        <div class="text-white">Signe d'appel : {{ objectChoose?.plane.callsign }}</div>
        <div class="text-white">Pays d'origine : {{ objectChoose?.plane.origin_country }}</div>
        <div class="text-white">Longitude : {{ objectChoose?.plane.lng }}</div>
        <div class="text-white">latitude : {{ objectChoose?.plane.lat }}</div>
        <div class="text-white">altitude : {{ objectChoose?.plane.geo_altitude }}</div>
        <div class="text-white">Etat : {{ objectChoose?.plane.on_ground ? 'au sol' : 'en vol'}}</div>
        <div class="text-white">velocity : {{ objectChoose?.plane.velocity }} m/s</div>
        <div class="text-white">taux vertical : {{ objectChoose?.plane.vertical_rate }} m/s</div>
      </div>

      <div class="w-full h-[calc(100vh-350px)] flex flex-col">
        <div class="w-full h-full">
          <div
            class="w-full h-[50px] flex items-center px-4 text-white bg-main-primary"
          >
            Vol de l'avion (29 derniers jours)
          </div>
          <div class="w-full h-[calc(100%-50px)] flex flex-col overflow-y-auto">
            <template v-if="loadAirports">
              <template v-if="!errorAirports">
                <template v-for="airport in airports" :key="plane">
                  <div
                    class="w-full flex flex-row justify-start items-center px-4 gap-4 h-[50px] shrink-0 text-white text-sm uppercase hover:bg-extra-secondary border-b border-main-primary/50"
                  >
                    <span class="bg-extra-primary p-1">{{
                      airport.icao24
                    }}</span>
                    <span class="text-xs normal-case"
                      >Aéroport Départ : {{ airport.estDepartureAirport }} | {{ new Date(airport.lastSeen * 1000).toLocaleDateString() }}
                      <br />
                      Aéroport Arrivé : {{ airport.estArrivalAirport }}</span
                    >
                  </div>
                </template>
              </template>
              <template v-else>
                <div
                  class="relative w-full h-full flex justify-center items-center text-white"
                >
                  {{ errorAirports }}
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
  name: "Plane",
  props: {
    objectChoose: Object,
  },
  data() {
    return {
      airports: [] as any,
      dateBegin: new Date(new Date().toDateString()).getTime() / 1000,
      dateEnd: null as unknown as Number,
      loadAirports: false,
      errorAirports: "",
    };
  },
  async mounted() {
    if (this.objectChoose && this.objectChoose.type === "plane") {
      //Enlève 29 jours a la date actuel
      function removeDaysToDate(date: string | number | Date, days: number) {
        var res = new Date(date);
        res.setDate(res.getDate() - days);
        return res;
      }
      let tmpDate = new Date(); // Récupère la date actuel 
      let newDate = removeDaysToDate(tmpDate, 29); // Enlève 29 jours
      this.dateEnd = Math.trunc(newDate.getTime() / 1000); // Enlève les nombres décimals
      if (this.dateEnd) {

        //Récupères les vols de l'avion depuis les 29 derniers jours
        await axios
          .get(
            `https://opensky-network.org/api/flights/aircraft?icao24=${this.objectChoose.plane.icao24}&begin=${this.dateEnd}&end=${this.dateBegin}`
          )
          .then((data: any) => {
            console.log(data)
            this.airports = data.data;
            this.loadAirports = true;
          })
          .catch((error) => {
            this.errorAirports = "Aucun vol";
            this.loadAirports = true;
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
