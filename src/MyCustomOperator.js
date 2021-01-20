import {
  Quat,
  NumberParameter,
  MultiChoiceParameter,
  XfoParameter,
  Operator,
  OperatorInput,
  OperatorOutput,
  OperatorOutputMode,
  Registry,
} from '@zeainc/zea-engine'

/** An operator for aiming items at targets.
 * @extends Operator
 */
class MyCustomOperator extends Operator {
  /**
   * Create a gears operator.
   * @param {string} name - The name value.
   */
  constructor(name) {
    super(name)

    this.addParameter(new NumberParameter('Weight', 1))
    this.addOutput(new OperatorOutput('Xfo', OperatorOutputMode.OP_READ_WRITE))
  }

  /**
   * The evaluate method.
   */
  evaluate() {
    const output = this.getOutput('Xfo')
    const xfo = output.getValue()
    output.setClean(xfo)
  }
}

// Now make sure to register the custom class with the registry so that factory methods know how to construct it.
Registry.register('MyCustomOperator', MyCustomOperator)

export { MyCustomOperator }
