import { makeDataContext } from '../makeDataContext'

export = (mode, options) => {
  // Called in our tests, checks that the tests are
  if (mode === 'smokeTest') {
    return require('./smoke_test').run(options)
  }

  // Data Context is created inside of run.js, called by these files
  if (mode === 'run') {
    if (options.testingType === 'component') {
      return require('./run-ct').run(options)
    }

    // run must always be deterministic - if the user doesn't specify
    // a testingType, we default to e2e
    options.testingType = 'e2e'

    return require('./run-e2e').run(options)
  }

  if (mode === 'interactive') {
    const ctx = makeDataContext({ mode: 'open', options })

    // Change default for `cypress open` to be LAUNCHPAD=1
    if (process.env.LAUNCHPAD === '0') {
      delete process.env.LAUNCHPAD
    } else {
      process.env.LAUNCHPAD = '1'
    }

    // Either launchpad or straight to e2e tests
    return require('./interactive-e2e').run(options, ctx)
  }

  throw new Error(`Invalid mode ${mode}`)
}
