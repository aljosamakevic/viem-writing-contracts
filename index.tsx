import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import {
  http,
  type Address,
  type Hash,
  type TransactionReceipt,
  createPublicClient,
  createWalletClient,
  custom,
  stringify,
  defineChain,
} from 'viem'
import 'viem/window'
import { contract } from './contracts/simpleMessage'
// import { goerli } from 'viem/chains'
// import { mint } from 'viem/chains'


export const stavanger = defineChain({
  id: 50591822,
  name: 'Stavanger',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.stavanger.gateway.fm'] },
  },
  blockExplorers: {
    default: { name: 'Blockscout', url: 'https://explorer.stavanger.gateway.fm' },
  },
  
})

const publicClient = createPublicClient({
  chain: stavanger,
  transport: http(),
})
// const publicClient = createPublicClient({
//   chain: goerli,
//   transport: http(),
// })
const walletClient = createWalletClient({
  chain: stavanger,
  transport: custom(window.ethereum!),
})

function Example() {
  const [account, setAccount] = useState<Address>()
  const [hash, setHash] = useState<Hash>()
  const [receipt, setReceipt] = useState<TransactionReceipt>()
  const [message, setMessage] = useState<string>("Hello, World!")

  const connect = async () => {
    const [address] = await walletClient.requestAddresses()
    setAccount(address)
  }

  const setMessageOnContract = async () => {
    if (!account) return
    const { request } = await publicClient.simulateContract({
      ...contract,
      functionName: 'setMessage',
      account,
      args: [message],
    })
    const hash = await walletClient.writeContract(request)
    setHash(hash)

  }

  useEffect(() => {
    ;(async () => {
      if (hash) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        setReceipt(receipt)
      }
    })()
  }, [hash])

  if (account)
    return (
      <>
        <div>Connected: {account}</div>
        <input type="text"   onChange={(e) => setMessage(e.target.value)} 
        />
        <button onClick={setMessageOnContract}>Set Message</button>
        {receipt && (
          <div>
            tx receipt:{' '}
            <pre>
              <div>{stringify(receipt, null)}</div>
            </pre>
          </div>
        )}
      </>
    )
  return <button onClick={connect}>Connect Wallet</button>
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Example />,
)
