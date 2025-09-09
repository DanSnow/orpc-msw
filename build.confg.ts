import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['./src/index.ts'],
  externals: [/.*/],
  clean: true,
  declaration: 'node16',
})
