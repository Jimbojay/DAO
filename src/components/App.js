import { useEffect, useState } from 'react'
import { Container } from 'react-bootstrap'
import { ethers } from 'ethers'

// Components
import Navigation from './Navigation';
import Create from './Create';
import Proposals from './Proposals';
import Loading from './Loading';

// ABIs: Import your contract ABIs here
// import TOKEN_ABI from '../abis/Token.json'
import DAO_ABI from '../abis/DAO.json'
import TOKEN_ABI from '../abis/Token.json'

// Config: Import your network config here
import config from '../config.json';

function App() {
  const [provider, setProvider]= useState(null)
  const [dao, setDao] = useState(null)
  const [treasuryBalance, setTreasuryBalance] = useState(0)

  const [token, setToken] = useState(null)
  const [totalSupply, setTotalSupply] = useState(0)

  const [account, setAccount] = useState(null)

  const [proposals, setProposals] = useState(null)
  const [quorum, setQuorum] = useState(null)

  const [isLoading, setIsLoading] = useState(true)

  const [userBalance, setUserBalance] = useState(0)

  const loadBlockchainData = async () => {
    // Initiate provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)


    //initiate contracts
    const dao = new ethers.Contract(config[31337].dao.address, DAO_ABI, provider)
    setDao(dao)

    const token = new ethers.Contract(config[31337].token.address, TOKEN_ABI, provider)
    setToken(token)

    //Fetch token supply
    let totalSupply = await token.totalSupply()
    totalSupply = ethers.utils.formatUnits(totalSupply,18)
    setTotalSupply(totalSupply)


    //Fetch treasury balance
    let treasuryBalance = await provider.getBalance(dao.address)
    treasuryBalance = ethers.utils.formatUnits(treasuryBalance,18)
    setTreasuryBalance(treasuryBalance)

    // Fetch accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account)
    
    //fetch proposals
    const count = await dao.proposalCount()
    const items = []

    for(var i = 0;i < count; i++) {
      const proposal = await dao.proposals(i + 1)
      items.push(proposal)
    }

    setProposals(items)

    //Fetch quorum
    setQuorum(await dao.quorum())

    //Fetch token balance
    const userBalance = await token.balanceOf(account);
    setUserBalance(userBalance)




    setIsLoading(false)
  }

  useEffect(() => {
    if (isLoading) {
      loadBlockchainData()
    }
  }, [isLoading]);

  return(
    <Container>
      <Navigation 
        account={account} 
        userBalance={userBalance}
      />

      <h1 className='my-4 text-center'>Welcome to our DAO!</h1>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Create 
            provider={provider}
            dao={dao}
            setIsLoading={setIsLoading}
          />

          <hr/>

          <p style={{ textAlign: 'left' }}>
            <strong>Treasury Balance</strong> {treasuryBalance.toString()} ETH
            <span style={{ display: 'inline-block', width: 'calc(100% - 460px)', textAlign: 'center' }}>
              <strong>Proposal Quorum</strong> >{Math.floor(ethers.utils.formatUnits(quorum.toString(), 18))} DAPP = {(ethers.utils.formatUnits(quorum.toString(), 18) / totalSupply) * 100}%
            </span>
            <span style={{ float: 'right' }}>
              <strong>Token balance</strong> {Math.floor(ethers.utils.formatUnits(userBalance.toString(), 18))} DAPP = {(ethers.utils.formatUnits(userBalance.toString(), 18) / totalSupply) * 100}%
            </span>
          </p>


          <hr/>

          <Proposals 
            provider={provider} 
            dao={dao} 
            proposals={proposals} 
            quorum={quorum} 
            setIsLoading={setIsLoading}
            totalSupply={totalSupply}
          />
        </>
      )}
    </Container>
  )
}

export default App;
