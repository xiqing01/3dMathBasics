import V01 from "./Match/V01"
import TSL01 from "./TSLstudy/TSL01"
import Dissolve from "./Example/Dissolve"

export const components = {
  'V01' : {
    nameKey: 'components.V01.name',
    textKey: 'components.V01.text',
    bugKey:'components.V01.bug', 
    category: 'Match', 
    component: V01
  },
  'Dissolve':{
    nameKey: 'components.Dissolve.name',
    textKey: 'components.Dissolve.text',
    bugKey:'components.Dissolve.bug', 
    category: 'Example', 
    component: Dissolve
  },
  'TSL01' : {
    nameKey: 'components.TSL01.name',
    textKey: 'components.TSL01.text',
    bugKey:'components.TSL01.bug',
    category: 'TSL Study',
    component: TSL01
  }
}