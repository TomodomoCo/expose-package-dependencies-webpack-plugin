const { RawSource } = require( 'webpack-sources' );
const { find, findKey, get, union } = require( 'lodash' );

class ExposePackageDependenciesWebpackPlugin {
  constructor( options ) {
    this.options = options;
  }

  apply( compiler ) {
    const { output } = compiler.options;
    const { filename: outputFilename } = output;

    compiler.hooks.emit.tap( this.constructor.name, ( compilation ) => {
      // Iterate on the entrypoints (there is probably just one).
      for ( const [ entrypointName, entrypoint ] of compilation.entrypoints.entries() ) {
        const [ filename, query ] = entrypointName.split( '?', 2 );

        // Get the name of the dependency file.
        const buildFilename = compilation.getPath( outputFilename, {
          chunk: entrypoint.getRuntimeChunk(),
          filename,
          query,
          basename: basename( filename ),
        } );

        const extensions = [
          '.asset.json',
          '.deps.json',
        ];

        // Check if the build file has a matching asset file. If so, get the file.
        const assetFiles = extensions.map( ( ext ) => buildFilename.replace( /\.js$/i, ext ) );
        const assetFileName = findKey( compilation.assets, ( value, key ) => assetFiles.includes( key ) );
        const asset = get( compilation.assets, assetFileName, null );

        if ( asset === null ) {
          return;
        }

        // Parse the existing source file, so it can be modified.
        let deps = JSON.parse( asset.source() );

        // Loop over the specified packages.
        this.options.packages.forEach( ( packageName ) => {
          let packageDependencies = null;

          try {
            // Get the list of possible asset files.
            const packageData = require( packageName + '/package.json' );
            const packageAssetFiles = extensions.map( ( ext ) => packageData.main.replace( /\.js$/i, ext ) );

            // Attempt to get the dependencies from each possible asset file.
            const assetFiles = packageAssetFiles.map( ( filename ) => {
              try {
                const assetFile = require( `${packageName}/${filename}` );

                return 'dependencies' in assetFile ? assetFile.dependencies : assetFile;
              } catch ( e ) {
                return false;
              }
            } );

            // If we were able to find any dependencies, get them.
            packageDependencies = find( assetFiles, ( item ) => !! item.length ) || null;
          } catch ( e ) {
            return;
          }

          if ( packageDependencies === null ) {
            return;
          }

          // Merge the package's dependencies into the consumer's dependencies.
          deps = union( deps, packageDependencies );
        } );

        // Output the result back to the dependency file.
        compilation.assets[ assetFileName ] = new RawSource( JSON.stringify( deps ) );
      }
    } );
  }
}

function basename( name ) {
  if ( ! name.includes( '/' ) ) {
    return name;
  }

  return name.substr( name.lastIndexOf( '/' ) + 1 );
}

module.exports = ExposePackageDependenciesWebpackPlugin;
