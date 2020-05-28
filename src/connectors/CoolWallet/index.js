import { AbstractConnector } from '@web3-react/abstract-connector'
import invariant from 'tiny-invariant'
import CoolWalletProvider from './CoolWalletProvider'

const __DEV__ = process.env.NODE_ENV !== 'production'

export const URI_AVAILABLE = 'URI_AVAILABLE'

export class UserRejectedRequestError extends Error {
  constructor() {
    super()
    this.name = this.constructor.name
    this.message = 'The user rejected the request.'
  }
}

export class CoolWalletConnector extends AbstractConnector {
  constructor({
    accountsLength,
    accountsOffset,
    urls,
    defaultChainId,
    pollingInterval,
    requestTimeoutMs,
  }) {
    invariant(
      defaultChainId || Object.keys(urls).length === 1,
      'defaultChainId is a required argument with >1 url',
    )
    super({ supportedChainIds: Object.keys(urls).map(k => Number(k)) })

    this.providers = Object.keys(urls).reduce((accumulator, chainId) => {
      const provider = new CoolWalletProvider(
        chainId,
        accountsLength,
        accountsOffset,
        urls[Number(chainId)],
      )
      return Object.assign(accumulator, { [Number(chainId)]: provider })
    }, {})
    this.currentChainId = defaultChainId || Number(Object.keys(urls)[0])
    this.pollingInterval = pollingInterval
    this.requestTimeoutMs = requestTimeoutMs
  }

  async activate() {
    console.log('123')
    const provider = this.providers[this.currentChainId]
    provider.engine.start()
    const account = await this.getAccount()
    this.active = true
    return {
      provider: provider,
      chainId: this.currentChainId,
      account: account,
    }
  }

  async getProvider() {
    return this.providers[this.currentChainId]
  }

  async getChainId() {
    return this.currentChainId
  }

  async getAccount() {
    const accounts = await this.providers[this.currentChainId].getAccounts()
    return accounts[0]
  }

  deactivate() {
    this.providers[this.currentChainId].engine.stop()
    this.active = false
  }

  changeChainId(chainId) {
    invariant(
      Object.keys(this.providers).includes(chainId.toString()),
      `No url found for chainId ${chainId}`,
    )
    if (this.active) {
      this.providers[this.currentChainId].engine.stop()
      this.currentChainId = chainId
      this.providers[this.currentChainId].engine.start()
      this.emitUpdate({
        provider: this.providers[this.currentChainId],
        chainId,
      })
    } else {
      this.currentChainId = chainId
    }
  }
}
