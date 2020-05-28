import ProviderEngine from 'web3-provider-engine'
import CoolWalletSubProvider from '@coolwallets/web3-subprovider'
import FiltersSubprovider from 'web3-provider-engine/subproviders/filters'
import RpcSubprovider from 'web3-provider-engine/subproviders/rpc'
import CacheSubprovider from 'web3-provider-engine/subproviders/cache'
import NonceSubprovider from 'web3-provider-engine/subproviders/nonce-tracker'

function CoolWalletProvider(
  chainId,
  accountsLength,
  accountsOffset,
  providerUrl,
) {
  if (!providerUrl) {
    throw new Error(
      `Provider URL missing, non-empty string expected, got '${providerUrl}'`,
    )
  }

  this.engine = new ProviderEngine()

  this.engine.addProvider(
    new CoolWalletSubProvider({
      networkId: chainId,
      accountsLength: accountsLength,
      accountsOffset: accountsOffset,
    }),
  )
  this.engine.addProvider(new FiltersSubprovider())
  this.engine.addProvider(new NonceSubprovider())
  this.engine.addProvider(new CacheSubprovider())
  this.engine.addProvider(new RpcSubprovider({ rpcUrl: providerUrl }))
}

// PrivateKeyProvider.prototype.sendAsync = function() {
//   this.engine.sendAsync.apply(this.engine, arguments)
// }

// PrivateKeyProvider.prototype.send = function() {
//   return this.engine.send.apply(this.engine, arguments)
// }

export default CoolWalletProvider
