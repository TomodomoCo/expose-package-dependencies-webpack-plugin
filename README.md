# expose-package-dependencies-webpack-plugin

Inline dependencies from third-party packages which provide a WordPress script dependencies file (`*.deps.json`) as part of your webpack build process.

Pairs well with the `@wordpress/scripts` build utilities.

## Usage

1. `npm install --save-dev github:tomodomoco/expose-package-dependencies-webpack-plugin#master`
2. Add the following to your webpack config:
    ```js
    plugins: [
      ...defaultConfig.plugins,
      new ExposePackageDependenciesWebpackPlugin( {
        packages: [
          'my-package-which-provides-deps-json',
        ]
      } ),
    ],
    ```
3. …
4. Profit! 💰

## Caveats

The plugin expects that packages which provide a `*.deps.json` file will have a `main` file defined in their `package.json`, and that the deps file will live at the standard location relative to that file (e.g. given `"main": "build/index.js"`, the dependency file should live at `build/index.deps.json`).

## About Tomodomo

Tomodomo is a creative agency for magazine publishers. We use custom design and technology to speed up your editorial workflow, engage your readers, and build sustainable subscription revenue for your business.

Learn more at [tomodomo.co](https://tomodomo.co) or email us: [hello@tomodomo.co](mailto:hello@tomodomo.co)

## License & Conduct

This project is licensed under the terms of the MIT License, included in `LICENSE.md`.

All open source Tomodomo projects follow a strict code of conduct, included in `CODEOFCONDUCT.md`. We ask that all contributors adhere to the standards and guidelines in that document.

Thank you!
