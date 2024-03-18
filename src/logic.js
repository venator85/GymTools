export function wathen(weight, reps) {
  return (100 * weight) / (48.8 + 53.8 * Math.exp(-0.075 * reps))
}

export function wathenInv(oneRepMax, reps) {
  return oneRepMax * (48.8 + 53.8 * Math.exp(-0.075 * reps)) / 100.0
}

export function toBarbellSideWeight(weight, barbellWeight, rounding) {
  return mround((weight - barbellWeight) / 2.0, rounding)
}

export function fromBarbellSideWeight(weight, barbellWeight) {
  return 2.0 * weight + barbellWeight
}

function mround(numero, multiplo) {
  const resto = numero % multiplo
  if (resto >= multiplo / 2) {
    return numero + (multiplo - resto)
  } else {
    return numero - resto
  }
}
