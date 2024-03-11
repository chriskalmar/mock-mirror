import dts from 'bun-plugin-dts';

await Bun.build({
  entrypoints: ['./src/client.ts'],
  outdir: './dist',
  plugins: [dts()],
});
