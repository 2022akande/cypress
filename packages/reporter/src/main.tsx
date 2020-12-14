import { action } from 'mobx'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { render } from 'react-dom'
// @ts-ignore
import EQ from 'css-element-queries/src/ElementQueries'

import { RunnablesErrorModel } from './runnables/runnable-error'
import appState, { AppState } from './lib/app-state'
import events, { Runner, Events } from './lib/events'
import ForcedGcWarning from './lib/forced-gc-warning'
import runnablesStore, { RunnablesStore } from './runnables/runnables-store'
import scroller, { Scroller } from './lib/scroller'
import statsStore, { StatsStore } from './header/stats-store'
import shortcuts from './lib/shortcuts'

import Header from './header/header'
import Runnables from './runnables/runnables'

export interface ReporterProps {
  appState: AppState
  autoScrollingEnabled?: boolean
  runnablesStore: RunnablesStore
  runner: Runner
  scroller: Scroller
  statsStore: StatsStore
  events: Events
  error?: RunnablesErrorModel
  specs: Cypress.Cypress['spec'][]
}

@observer
class Reporter extends Component<ReporterProps> {
  static defaultProps = {
    appState,
    events,
    runnablesStore,
    scroller,
    statsStore,
  }

  render () {
    return (
      <div className='reporter'>
        <Header appState={this.props.appState} statsStore={this.props.statsStore} />
        <Runnables
          appState={this.props.appState}
          error={this.props.error}
          runnablesStore={this.props.runnablesStore}
          scroller={this.props.scroller}
          specs={this.props.specs}
        />
        <ForcedGcWarning
          appState={this.props.appState}
          events={this.props.events}/>
      </div>
    )
  }

  componentDidMount () {
    const { appState, autoScrollingEnabled, runnablesStore, runner, scroller, statsStore } = this.props

    action('set:scrolling', () => {
      appState.setAutoScrolling(autoScrollingEnabled)
    })()

    this.props.events.init({
      appState,
      runnablesStore,
      scroller,
      statsStore,
    })

    this.props.events.listen(runner)

    shortcuts.start()
    EQ.init()
  }

  componentWillUnmount () {
    shortcuts.stop()
  }
}

declare global {
  interface Window {
    Cypress: any
    state: AppState
    render: ((props: Partial<ReporterProps>) => void)
  }
}

// NOTE: this is for testing Cypress-in-Cypress
if (window.Cypress) {
  window.state = appState
  window.render = (props) => {
    // @ts-ignore
    render(<Reporter {...props as Required<ReporterProps>} />, document.getElementById('app'))
  }
}

export { Reporter }
