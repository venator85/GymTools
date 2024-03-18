<template>
  <v-container fluid>
    <v-row>
      <v-col cols="8">
        <v-text-field label="Peso per lato" v-model="weightPerSideState"></v-text-field>
      </v-col>

      <v-col cols="4">
        <v-text-field type="number" label="Reps" v-model="repsState"></v-text-field>
      </v-col>
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
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { wathen, wathenInv, toBarbellSideWeight, fromBarbellSideWeight } from './logic.js'

const weightPerSideState = ref('50')
const repsState = ref('6')
const barbellWeightState = ref('20')
const roundingState = ref('1.25')

const computedDataState = computed(() => {
  const weightPerSide = parseFloat(weightPerSideState.value)
  const reps = parseInt(repsState.value)
  const barbellWeight = parseFloat(barbellWeightState.value)
  const rounding = parseFloat(roundingState.value)
  return compute(weightPerSide, reps, barbellWeight, rounding)
})

function compute(weightPerSide, reps, barbellWeight, rounding) {
  const oneRepMaxValues = Array(11).fill().map((_, index) => {
    const percentage = 100 - index * 5
    const weight = fromBarbellSideWeight(weightPerSide, barbellWeight) * percentage / 100
    const oneRepMax = wathen(weight, reps)
    return {
      percentage: percentage,
      percentageTypedWeight: toBarbellSideWeight(weight, barbellWeight, rounding),
      oneRepMax: oneRepMax,
      oneRepMaxPerSide: toBarbellSideWeight(oneRepMax, barbellWeight, rounding)
    }
  })

  const oneRepMax = oneRepMaxValues[0].oneRepMax

  const repsTargetAParitaDiMassimale = Array(15).fill().map((_, index) => {
    const repsTarget = index + 1
    const equivWeight = wathenInv(oneRepMax, repsTarget)
    return {
      repsTarget: repsTarget,
      equivWeight: equivWeight,
      equivWeightBarbellSide: toBarbellSideWeight(equivWeight, barbellWeight, rounding),
      halfEquivWeight: equivWeight / 2
    }
  })

  return {
    oneRepMaxValues: oneRepMaxValues,
    repsTargetAParitaDiMassimale: repsTargetAParitaDiMassimale
  }
}

function numFormat(number) {
  return number.toLocaleString(undefined, { maximumFractionDigits: 2 })
}
</script>
