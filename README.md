## Data for vizualizations

Coordinate data for the visualizations are constructed at build-time from a plugin written into <root>/vite.config.ts.

### Dependencies

- **build-data** module. Runs code that reads the raw data, takes configuration input from the plugin code, computes coordinates, and returns and object to the plugin that the plugin then uses to write the coordinate data.

- **layouts.json** This defines sizes and dimensions of the rendered elements in the visualizations as a function of the screen size. It lives at <root>/src/config/layouts.json. Since it lives in /src, it is bundled with the application source code and thus loaded by the browser at runtime. This makes sense, because the data in layouts.json is part of the logic in the application code that determines which coordinates to render and how to render them as a function of the browser's window size. To change these features, alter the values of the json objects in <root>/src/config/layouts.json. If you change the location of layouts.json, alter the path that is hard-coded into an `import` statement at the top of <root>/vite.config.ts to match the new location, and alter the path coded into the components in /src that read it.

- **viz-config.json** This defines the underlying structure of the visualizations. For instance, it specifies the values of the variables in the raw data and how those values will be split in the various views. It lives at <root>/src/config/viz-config.json. It is bundled with the application code so that the runtime can use its logic to identify which coordinates go where on the screen in a given view. If you change the location of viz-config.json, alter the path that is hard-coded into <root>/vite.config.ts to match the new location, and alter the path coded into the components in /src that read it.

- **dem_characteristics_importance.gz** This is the raw dataset for the "imp" data, constructed from the original blw datafiles. The code that constructed the data can be found at https://github.com/stuvjordan-uroc/blw_dataviz_data. It lives at <root>/rawdata/dem_characteristics_importance.gz. Because it's not in <root>/src and not in <root>/public, it is neither bundled with the application code, nor provided as a static asset as part of the application bundle. If you change the location of this file, alter the path to the file hard-coded into <root>/vite.config.ts.

### Outputs

- **p-and-c.json** This holds the computed proportions and counts of the various groups of datapoints depicted in the visualizations. The application code needs to to generate labels stating those proportions. It's a relatively small amount of data, so we bundle it into the application code by writing it to <root>/src/data/p-and-c.json. If you want to change its location, alter the paths hard-coded into <root>/vite.config.ts

- **coordinates** These are stored in a collection of json files at <root>/public/coordinates/. There is one file for each screensize specified in **layouts.json**. Since these files are written to <root>/public, their data are not bundled into the application code that runs in the browser. Instead, that application code uses `fetch` calls to load the data as needed. These datafiles are very large (10s of megabites), so we only want them loaded in the browser when needed. If you want to change where they are written by the buildtime code, change the hard-coded paths in <root>/vite.config.ts.
