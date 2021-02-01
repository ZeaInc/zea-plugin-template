import { MyCustomTreeItem } from './MyCustomTreeItem'
import { MyCustomRenderShader } from './MyCustomRenderShader'

import { TreeItem, GLPass, GLMesh, Cuboid, PassType } from '@zeainc/zea-engine'

/** Class representing a GL treeItems pass.
 * @extends GLPass
 * @private
 */
class MyCustomRenderPass extends GLPass {
  /**
   * Create a GL treeItems pass.
   */
  constructor() {
    super()
    this.customItems = []
  }

  /**
   * Returns the pass type. OPAQUE passes are always rendered first, followed by TRANSPARENT passes, and finally OVERLAY.
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
    this.glgeom = new GLMesh(gl, new Cuboid(1, 1, 1))

    this.glshader = new MyCustomRenderShader(gl)
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
   * @param {any} customItem - The customItem value.
   */
  bindTreeItem(customItem) {
    const binding = {
      customItem: customItem,
      modelMatrixChangeHandler: () => {
        binding.modelMatrix = customItem.getParameter('GlobalXfo').getValue().toMat4().asArray()
      },
      sizeChangeHandler: () => {
        binding.size = customItem.getParameter('Size').getValue().asArray()
      },
      colorChangeHandler: () => {
        binding.color = customItem.getParameter('Color').getValue().asArray()
      },
    }

    // If the GlobalXfo changes, we need to update the renderer cache.
    binding.modelMatrixChangeHandler()
    binding.sizeChangeHandler()
    binding.colorChangeHandler()
    customItem.getParameter('GlobalXfo').on('valueChanged', binding.modelMatrixChangeHandler)
    customItem.getParameter('Size').on('valueChanged', binding.sizeChangeHandler)
    customItem.getParameter('Color').on('valueChanged', binding.colorChangeHandler)

    this.customItems.push(binding)
    this.emit('updated')
  }

  /**
   * The unbindTreeItem method.
   * @param {any} customItem - The customItem value.
   */
  unbindTreeItem(customItem) {
    const index = this.customItems.find((binding) => binding.customItem == customItem)
    const binding = this.customItems[index]
    customItem.getParameter('GlobalXfo').off('valueChanged', binding.modelMatrixChangeHandler)
    customItem.getParameter('Size').off('valueChanged', binding.sizeChangeHandler)
    customItem.getParameter('Color').off('valueChanged', binding.colorChangeHandler)
    this.customItems.splice(index, 1)
    this.emit('updated')
  }

  /**
   * The sort method.
   * @param {any} renderstate - The renderstate value.
   */
  draw(renderstate) {
    const gl = this.__gl
    this.glshader.bind(renderstate)
    this.glgeom.bind(renderstate)

    const unifs = renderstate.unifs

    this.customItems.forEach((binding) => {
      gl.uniformMatrix4fv(unifs.modelMatrix.location, false, binding.modelMatrix)
      gl.uniform3fv(unifs.boxSize.location, binding.size)
      gl.uniform4fv(unifs.color.location, binding.color)

      renderstate.bindViewports(unifs, () => {
        this.glgeom.draw(renderstate)
      })
    })
  }

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
