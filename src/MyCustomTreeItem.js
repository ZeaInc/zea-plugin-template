import { Box3, Color, Vec3Parameter, ColorParameter, TreeItem, Vec3 } from '@zeainc/zea-engine'

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

    this.addParameter(new Vec3Parameter('Size', new Vec3(2, 2, 2)))
    this.addParameter(new ColorParameter('Color', new Color(1, 0, 0)))
  }

  /**
   * The _cleanBoundingBox method.
   * @param {Box3} bbox - The bounding box value.
   * @return {Box3} - The return value.
   * @private
   */
  _cleanBoundingBox(bbox) {
    bbox = super._cleanBoundingBox(bbox)
    const size = this.getParameter('Size').getValue()
    const localBBox = new Box3(size.scale(-0.5), size.scale(0.5))
    bbox.addBox3(localBBox, this.getParameter('GlobalXfo').getValue().toMat4())
    return bbox
  }
}

export { MyCustomTreeItem }
