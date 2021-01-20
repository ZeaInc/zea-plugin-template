import { MyCustomTreeItem } from './MyCustomTreeItem'

import { Color, NumberParameter, TreeItem, GLPass } from '@zeainc/zea-engine'

const pixelsPerItem = 6 // The number of pixels per draw item.

/** Class representing a GL treeitems pass.
 * @extends GLPass
 * @private
 */
class MyCustomRenderPass extends GLPass {
  /**
   * Create a GL treeitems pass.
   */
  constructor() {
    super()
    this.customItems = []
  }

  /**
   * The getPassType method.
   * @return {number} - The pass type value.
   */
  getPassType() {
    return PassType.OPAQUE
  }

  /**
   * The init method.
   * @param {any} renderer - The renderer value.
   * @param {any} passIndex - The passIndex value.
   */
  init(renderer, passIndex) {
    super.init(renderer, passIndex)

    const gl = this.__renderer.gl
    this.glgeom = new GLLines(gl, new LinesCuboid(1, 1, 1))
    this.glshader = new BoundingBoxShader(gl)
  }

  /**
   * The itemAddedToScene method is called on each pass when a new item
   * is added to the scene, and the renderer must decide how to render it.
   * It allows Passes to select geometries to handle the drawing of.
   * @param {TreeItem} treeItem - The treeItem value.
   * @param {object} rargs - Extra return values are passed back in this object.
   * The object contains a parameter 'continueInSubTree', which can be set to false,
   * so the subtree of this node will not be traversed after this node is handled.
   * @return {Boolean} - The return value.
   */
  itemAddedToScene(treeItem, rargs) {
    if (treeItem instanceof MyCustomTreeItem) {
      this.bindTreeItem(treeItem)
      return true
    }
    return false
  }

  /**
   * The itemRemovedFromScene method is called on each pass when aa item
   * is removed to the scene, and the pass must handle cleaning up any resources.
   * @param {TreeItem} treeItem - The treeItem value.
   * @param {object} rargs - Extra return values are passed back in this object.
   * @return {Boolean} - The return value.
   */
  itemRemovedFromScene(treeItem, rargs) {
    if (treeItem instanceof MyCustomTreeItem) {
      this.unbindTreeItem(treeItem)
      return true
    }
    return false
  }

  // ///////////////////////////////////
  // Bind to Render Tree

  /**
   * The bindTreeItem method.
   * @param {any} treeitem - The treeitem value.
   */
  bindTreeItem(treeitem) {
    this.emit('updated')
  }

  /**
   * The unbindTreeItem method.
   * @param {any} treeitem - The treeitem value.
   */
  unbindTreeItem(treeitem) {
    this.emit('updated')
  }

  /**
   * The sort method.
   * @param {any} renderstate - The renderstate value.
   */
  draw(renderstate) {}

  /**
   * The drawHighlightedGeoms method.
   * @param {any} renderstate - The renderstate value.
   */
  drawHighlightedGeoms(renderstate) {}

  /**
   * The drawGeomData method.
   * @param {any} renderstate - The renderstate value.
   */
  drawGeomData(renderstate) {}

  /**
   * The getGeomItemAndDist method.
   * @param {any} geomData - The geomData value.
   * @return {any} - The return value.
   */
  getGeomItemAndDist(geomData) {
    const itemId = Math.round(geomData[1])
    const dist = geomData[3]

    const glGeomItem = this.__drawItems[itemId]
    if (glGeomItem) {
      return {
        geomItem: glGeomItem.getGeomItem(),
        dist,
      }
    }
  }
}

export { MyCustomRenderPass }
