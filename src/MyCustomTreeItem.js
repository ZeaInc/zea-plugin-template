import { Color, NumberParameter, TreeItem } from '@zeainc/zea-engine'

/**
 * Base class that represents geometry items with layering, overlaying and cut away features.
 *
 * **Events**
 * * **cutAwayChanged:** Triggered everytime the cutaway variables change(if enabled or not, the vector and the distance).
 * @extends TreeItem
 */
class MyCustomTreeItem extends TreeItem {
  /**
   * Create a base geometry item.
   * @param {string} name - The name of the base geom item.
   */
  constructor(name) {
    super(name)

    this.addParameter(new NumberParameter('Foo'))
  }
}

export { MyCustomTreeItem }
