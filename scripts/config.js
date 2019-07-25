const path = require('path');
// const buble = require('rollup-plugin-buble');
const babel = require('rollup-plugin-babel');
const cjs = require('rollup-plugin-commonjs');
const node = require('rollup-plugin-node-resolve');

const resolve = p => path.resolve(__dirname, '../', p);


const build = {
  'index': resolve('src/index.js'),
  'lonlat-conver': resolve('src/lonlat-conver.js'),
};

const builds = {};

for (let [key, entry] of Object.entries(build)) {
  const dest = `lib/${key}`;
  builds[`${key}-es`] = {
    entry,
    dest: resolve(`${dest}.js`),
    format: 'es',
  };
  builds[`${key}-es-min`] = {
    entry,
    dest: resolve(`${dest}.min.js`),
    format: 'es',
  };

  builds[`${key}-cjs`] = {
    entry,
    dest: resolve(`${dest}.cjs.js`),
    format: 'cjs',
  };
  builds[`${key}-cjs-min`] = {
    entry,
    dest: resolve(`${dest}.cjs.min.js`),
    format: 'cjs',
  };

  builds[`${key}-umd`] = {
    entry,
    dest: resolve(`${dest}.umd.js`),
    format: 'umd',
  };
  builds[`${key}-umd-min`] = {
    entry,
    dest: resolve(`${dest}.umd.min.js`),
    format: 'umd',
  };
}


function genConfig(name) {
  const opts = builds[name];
  const config = {
    input: opts.entry,
    external: [].concat(opts.external),
    // external: id => {
    //   if (/moment/.test(id)) {
    //     console.log('exteranl::::', id);
    //   }
    // },
    plugins: [node(), cjs()].concat(opts.plugins || []),
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      name: opts.moduleName || 'XxmiMap',
    },
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg);
      }
    },
  };
  if (opts.transpile !== false) {
    config.plugins.push(babel({ exclude: 'node_modules/**' }));
  }
  return config;
}

exports.getBuild = genConfig;
exports.getAllBuilds = () => Object.keys(builds).map(genConfig);
