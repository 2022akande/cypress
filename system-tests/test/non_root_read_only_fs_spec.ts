import * as fs from 'fs'
import * as path from 'path'
import systemTests from '../lib/system-tests'
import Fixtures from '../lib/fixtures'

describe('e2e readonly fs', function () {
  systemTests.setup()

  const projectPath = Fixtures.projectPath('read-only-project-root')

  const chmodr = (p: string, mode: number) => {
    const stats = fs.statSync(p)

    fs.chmodSync(p, mode)
    if (stats.isDirectory()) {
      fs.readdirSync(p).forEach((child) => {
        chmodr(path.join(p, child), mode)
      })
    }
  }

  const onRun = (exec) => {
    chmodr(projectPath, 0o500)

    return exec().finally(() => {
      chmodr(projectPath, 0o777)
    })
  }

  // TODO: fix this warning
  // @see https://github.com/cypress-io/cypress/issues/18485
  systemTests.it.skip('warns when unable to write to disk', {
    project: projectPath,
    expectedExitCode: 1,
    spec: 'spec.js',
    snapshot: true,
    config: {
      video: false,
    },
    onRun,
  })
})