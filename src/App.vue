<template>
  <v-container fluid>
    <v-row>
      <v-col cols="8">
        <v-text-field type="number" inputmode="decimal" label="Peso per lato" v-model="weightPerSideState" clearable></v-text-field>
      </v-col>

      <v-col cols="4">
        <v-text-field id="tfReps" type="text" inputmode="numeric" label="Reps" v-model="repsState" clearable></v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <v-checkbox v-model="barbellIncludedState" label="Includi bilanciere" class="ml-3"></v-checkbox>

      <v-text-field :disabled="!barbellIncludedState" label="Peso bilanciere in kg" v-model="barbellWeightState" class="ml-3 mr-3"></v-text-field>
    </v-row>

    <h3>Calcolo massimale</h3>

    <v-table density="compact">
      <thead>
        <tr>
          <th class="text-center">
            %
          </th>
          <th class="text-center">
            Carico
          </th>
          <th class="text-center">
            1RM
          </th>
          <th class="text-center">
            Per lato
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in computedDataState.oneRepMaxValues" :key="item.percentage">
          <td class="text-center">{{ item.percentage }}</td>
          <td class="text-center">{{ numFormat(item.percentageTypedWeight) }}</td>
          <td class="text-center">{{ numFormat(item.oneRepMax) }}</td>
          <td class="text-center">{{ numFormat(item.oneRepMaxPerSide) }}</td>
        </tr>
      </tbody>
    </v-table>

    <h3 class="mt-5">Reps target a parità di massimale</h3>

    <v-table density="compact">
      <thead>
        <tr>
          <th class="text-center">
            Reps
          </th>
          <th class="text-center">
            Carico
          </th>
          <th class="text-center">
            Per lato
          </th>
          <th class="text-center">
            / 2
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in computedDataState.repsTargetAParitaDiMassimale" :key="item.repsTarget">
          <td class="text-center">{{ item.repsTarget }}</td>
          <td class="text-center">{{ numFormat(item.equivWeight) }}</td>
          <td class="text-center">{{ numFormat(item.equivWeightBarbellSide) }}</td>
          <td class="text-center">{{ numFormat(item.halfEquivWeight) }}</td>
        </tr>
      </tbody>
    </v-table>

    <p class="colophon mt-5">
      Made for 💪 by <a href="https://alessiobianchi.eu">Alessio Bianchi</a> &mdash;
      sources at <a href="https://github.com/venator85/GymTools">github</a>
    </p>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { wathen, wathenInv, toBarbellSideWeight, fromBarbellSideWeight } from './logic.js'

const weightPerSideState = ref('50')
const repsState = ref('6')
const barbellWeightState = ref('20')
const roundingState = ref('1.25')
const barbellIncludedState = ref(true)

const computedDataState = computed(() => {
  const weightPerSide = numParse(weightPerSideState.value)
  const reps = parseInt(repsState.value)
  const barbellWeight = barbellIncludedState.value ? numParse(barbellWeightState.value) : 0
  const rounding = numParse(roundingState.value)
  return compute(weightPerSide, reps, barbellWeight, rounding)
})

function compute(weightPerSide, reps, barbellWeight, rounding) {
  const oneRepMaxValues = []
  for (let percentage = 100; percentage >= 50; percentage -= 5) {
    const weight = fromBarbellSideWeight(weightPerSide, barbellWeight) * percentage / 100
    const oneRepMax = wathen(weight, reps)
    oneRepMaxValues.push({
      percentage: percentage,
      percentageTypedWeight: toBarbellSideWeight(weight, barbellWeight, rounding),
      oneRepMax: oneRepMax,
      oneRepMaxPerSide: toBarbellSideWeight(oneRepMax, barbellWeight, rounding)
    })
  }

  const oneRepMax = oneRepMaxValues[0].oneRepMax

  const repsTargetAParitaDiMassimale = [];
  for (let repsTarget = 2; repsTarget <= 15; repsTarget++) {
    const equivWeight = wathenInv(oneRepMax, repsTarget)
    repsTargetAParitaDiMassimale.push({
      repsTarget: repsTarget,
      equivWeight: equivWeight,
      equivWeightBarbellSide: toBarbellSideWeight(equivWeight, barbellWeight, rounding),
      halfEquivWeight: equivWeight / 2
    })
  }

  return {
    oneRepMaxValues: oneRepMaxValues,
    repsTargetAParitaDiMassimale: repsTargetAParitaDiMassimale
  }
}

function numParse(string) {
  return parseFloat(string.replace(",", "."))
}

function numFormat(number) {
  return number.toLocaleString(undefined, { maximumFractionDigits: 2 })
}
</script>
