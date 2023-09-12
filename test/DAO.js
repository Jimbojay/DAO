const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

const ether = tokens

describe('Token', () => {
  let token, dao
  let deployer, funder

  beforeEach(async () => {
    //Setup accounts
    let accounts = await ethers.getSigners()
    deployer = accounts[0]
    funder = accounts[1]


    //Deploy token
    const Token = await ethers.getContractFactory('Token')
    token = await Token.deploy('Dapp University', 'DAPP', '1000000')

    //Deploy DAO
    const DAO = await ethers.getContractFactory('DAO')
    dao = await DAO.deploy(token.address, '500000000000000000000000')

    //Fund DAO with 100 ETH for govenance
    await funder.sendTransaction({to: dao.address, value: ether(100)})

  })

  describe('Deployment', () => {

    it('sends ether to the DAO treasury', async () => {
      expect( await ethers.provider.getBalance(dao.address)).to.eq(ether(100))
    })

    it('returns token address', async () => {
      expect(await dao.token()).to.equal(token.address)
    })

    it('returns quorum', async () => {
      expect(await dao.quorum()).to.equal('500000000000000000000000')
    })

  })

})