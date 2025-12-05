const esbuild = require('esbuild');
const fs = require('fs-extra');
const path = require('path');

const isWatch = process.argv.includes('--watch');

async function build() {
  // 1. Clean dist
  await fs.emptyDir('dist');

  // 2. Copy static public files (HTML, etc)
  await fs.copy('public', 'dist');

  // 3. Build Options
  const ctx = await esbuild.context({
    entryPoints: ['src/main.tsx', 'src/index.css'],
    bundle: true,
    minify: true,
    sourcemap: true,
    outdir: 'dist/assets',
    loader: {
      '.png': 'file',
      '.jpg': 'file',
      '.svg': 'file'
    },
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    logLevel: 'info'
  });

  if (isWatch) {
    await ctx.watch();
    console.log('👀 Watching for changes...');
  } else {
    await ctx.rebuild();
    await ctx.dispose();
    console.log('✨ Build complete!');
  }
}

build().catch(() => process.exit(1));