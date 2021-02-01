
# About the MyPlugin

MyPlugin is so awesome, you gotta try it...

## Getting Started



## Changing the Name of the Plugin

The plugin is compiled using Rollup, and so in the rollup.config.js you can see the name of the plugin as defined in the built bundle.

```javascript
  // Browser-friendly UMD build.
  {
    input: 'src/index.js',
    external,
    output: {
      name: 'myPlugin',
      file: pkg.browser,
      format: 'umd',
      sourcemap,
      globals: {
        '@zeainc/zea-engine': 'zeaEngine',
      },
    },
    plugins,
  },

```


## Testing the Plugin