const { RawSource } = require( 'webpack-sources' );
const { union } = require( 'lodash' );

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

        // We have to jump through some hoops here because WordPress changed the dependency file format.
        const oldAssetFilename = buildFilename.replace( /\.js$/i, '.deps.json' );
        const newAssetFilename = buildFilename.replace( /\.js$/i, '.asset.json' );

        const isNew = compilation.assets[ oldAssetFilename ] || null;
        const isOld = compiliation.assets[ newAssetFilename ] || null;

				if ( isNew === null && isOld === null ) {
					return;
        }

        const extension = ( isNew !== null ) ? '.asset.json' : '.deps.json';

				// Parse the existing source file, so it can be modified.
				let deps = JSON.parse( asset.source() );

				// Loop over the specified packages.
				this.options.packages.forEach( ( packageName ) => {
					// Get the package's deps.json file.
					const packageData = require( packageName + '/package.json' );
					const packageDepsFilename = packageData.main.replace( /\.js$/i, extension );
					const packageDeps = require( `${packageName}/${packageDepsFilename}` );

					if ( ! Array.isArray( packageDeps ) ) {
						return;
					}

					// Merge the package dependencies into the consumer's dependencies.
					deps = union( deps, packageDeps );
				} );

				// Output the result back to the dependency file.
				compilation.assets[ depsFilename ] = new RawSource( JSON.stringify( deps ) );
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
