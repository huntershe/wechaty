#!/usr/bin/env ts-node

/**
 *   Wechaty - https://github.com/chatie/wechaty
 *
 *   @copyright 2016-2018 Huan LI <zixia@zixia.net>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
// tslint:disable:no-shadowed-variable
import * as test  from 'blue-tape'
import * as sinon from 'sinon'

// import * as asyncHooks from 'async_hooks'

import {
  Wechaty,
}                             from './wechaty'

import {
  config,
  Contact,
  FriendRequest,
  IoClient,
  Message,
  Room,

  log,
  VERSION,
}                 from './'

import {
  Puppet,
}                 from './puppet/'
import { PuppetMock } from './puppet-mock'
import { MemoryCard } from 'memory-card'

test('Export of the Framework', async t => {
  t.ok(Contact        , 'should export Contact')
  t.ok(FriendRequest  , 'should export FriendREquest')
  t.ok(IoClient       , 'should export IoClient')
  t.ok(Message        , 'should export Message')
  t.ok(Puppet , 'should export Puppet')
  t.ok(Room           , 'should export Room')
  t.ok(Wechaty        , 'should export Wechaty')
  t.ok(log            , 'should export log')

  const bot = Wechaty.instance()
  t.is(bot.version(true), require('../package.json').version,
                          'should return version as the same in package.json',
  )
  t.is(VERSION, require('../package.json').version,
                  'should export version in package.json',
  )
})

test('Config setting', async t => {
  t.ok(config                         , 'should export Config')
  t.ok(config.default.DEFAULT_PUPPET  , 'should has DEFAULT_PUPPET')
})

test('event:start/stop', async t => {
  const wechaty = new Wechaty()

  const startSpy = sinon.spy()
  const stopSpy  = sinon.spy()

  wechaty.on('start', startSpy)
  wechaty.on('stop',  stopSpy)

  await wechaty.start()
  await wechaty.stop()

  // console.log(startSpy.callCount)
  t.ok(startSpy.calledOnce, 'should get event:start once')
  t.ok(stopSpy.calledOnce,  'should get event:stop once')
})

//
// FIXME: restore this unit test !!!
//
// test.only('event:scan', async t => {
//   const m = {} as any

//   const asyncHook = asyncHooks.createHook({
//     init(asyncId: number, type: string, triggerAsyncId: number, resource: Object) {
//       m[asyncId] = type
//     },
//     before(asyncId) {
//       // delete m[asyncId]
//     },
//     after(asyncId) {
//       // delete m[asyncId]
//     },
//     destroy(asyncId) {
//       delete m[asyncId]
//     },
//   })
//   asyncHook.enable()

//   const wechaty = Wechaty.instance()

//   const spy = sinon.spy()

//   wechaty.on('scan', spy)

//   const scanFuture  = new Promise(resolve => wechaty.once('scan', resolve))
//   // wechaty.once('scan', () => console.log('FAINT'))

//   await wechaty.start()
//   await scanFuture
//   // await new Promise(r => setTimeout(r, 1000))
//   await wechaty.stop()

//   t.ok(spy.calledOnce, 'should get event:scan')
//   asyncHook.disable()

//   console.log(m)
// })

test('on(event, Function)', async t => {
  const spy     = sinon.spy()
  const wechaty = Wechaty.instance()

  const EXPECTED_ERROR = new Error('testing123')
  wechaty.on('message', () => { throw EXPECTED_ERROR })
  wechaty.on('scan',    () => 42)
  wechaty.on('error',   spy)

  const messageFuture  = new Promise(resolve => wechaty.once('message', resolve))
  wechaty.emit('message', {} as any)

  await messageFuture
  await wechaty.stop()

  t.ok(spy.calledOnce, 'should get event:error once')
  t.equal(spy.firstCall.args[0], EXPECTED_ERROR, 'should get error from message listener')

})

test('initPuppetAccessory()', async t => {
  class WechatyTest extends Wechaty {
    public initPuppetAccessoryTest(puppet: Puppet): void {
      return this.initPuppetAccessory(puppet)
    }
  }
  const wechatyTest = new WechatyTest()

  const puppet = new PuppetMock({ memory: new MemoryCard() })
  t.doesNotThrow(() => wechatyTest.initPuppetAccessoryTest(puppet), 'should not throw for the 1st time init')
  t.throws(() => wechatyTest.initPuppetAccessoryTest(puppet),       'should throw for the 2nd time init')
})

// TODO: add test for event args
