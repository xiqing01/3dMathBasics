import V01 from "./Match/V01"
import WavingPlane from "./Example/WavingPlane"
import TSL01 from "./TSLstudy/TSL01"

export const components = {
  'V01' : {

    nameKey: 'components.V01.name', 
    category: 'Match', 
    component: V01
  },
  'WavingPlane' : {
    nameKey: 'components.WavingPlane.name',
    category: 'Example',
    component: WavingPlane
  },
  'TSL01' : {
    nameKey: 'components.TSL01.name',
    category: 'TSL Study',
    component: TSL01
  }
}