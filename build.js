const esbuild = require('esbuild');
const fs = require('fs-extra');
const path = require('path');

const isWatch = process.argv.includes('--watch');

async function build() {
  console.log('🧹 Cleaning dist...');
  await fs.emptyDir('dist');

  console.log('📂 Copying public files...');
  await fs.copy('public', 'dist');

  console.log('⚡ Building with esbuild...');
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
    console.log('✨ Build complete! Output in /dist');
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});