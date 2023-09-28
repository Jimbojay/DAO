//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract DAO {
    address owner;
    Token public token;
    uint256 public quorum;
    uint256 public proposalCount;

    struct Proposal {
        uint256 id;
        string name;
        uint256 amount;
        address payable recipient;
        uint256 upVotes;
        uint256 downVotes;
        bool finalized;
        string status;
    }

    event Propose(
        uint id,
        uint256 amount,
        address recipient,
        address creator
    );

    event Vote(uint256 id, address investor, string voteDirection);
    event Finalize(uint256 id, string voteDirection);

    constructor(Token _token, uint256 _quorum) {
        owner = msg.sender;
        token = _token;
        quorum = _quorum;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(address => mapping(uint256 => bool)) hasVoted; //1) rename to hasVoted 2)voting is valid in both directions (common) 

    //Allow contract to receive Ether
    receive() external payable {}

    modifier onlyInvestor() {
        require(
            token.balanceOf(msg.sender) > 0,
            "must be token holder"
        );
        _;
    }

    //Create proposal
    function createProposal(
        string memory _name, 
        uint256 _amount, 
        address payable _recipient,
        string memory _description
    ) external onlyInvestor{
        require(bytes(_name).length > 0, "Proposal has to be named");
        require(address(this).balance >= _amount, "Not enough balance");
        require(bytes(_description).length > 0, "Proposal has to be described");

        proposalCount++;

        proposals[proposalCount] = Proposal(
            proposalCount, 
            _name, 
            _amount, 
            _recipient, 
            0, 
            0,
            false,
            "In progress"
        );

        emit Propose(proposalCount, _amount, _recipient, msg.sender);

    }

    //Vote on proposal
    function upVote(uint256 _id) external onlyInvestor{
        //Fetch proposal from mapping by id
        Proposal storage proposal = proposals[_id];

        //Don't let investors vote twice
        require(!hasVoted[msg.sender][_id], "already voted"); //1) rename to hasVoted 2)voting is valid in both directions (common) 

        //update upVotes
        proposal.upVotes += token.balanceOf(msg.sender);

        //track that user has voted
        hasVoted[msg.sender][_id] = true;

        //Emit on event
        emit Vote(_id, msg.sender, "Upvote");
    }

    //Vote on proposal
    function downVote(uint256 _id) external onlyInvestor{
        //Fetch proposal from mapping by id
        Proposal storage proposal = proposals[_id];

        //Don't let investors vote twice
        require(!hasVoted[msg.sender][_id], "already voted"); //1) rename to hasVoted 2)voting is valid in both directions (common) 

        //update downVotes
        proposal.downVotes += token.balanceOf(msg.sender);

        //track that user has voted
        hasVoted[msg.sender][_id] = true;

        //Emit on event
        emit Vote(_id, msg.sender, "Downvote");
    }

    //Transfer funds
    function finalizeProposal(uint256 _id, string calldata _voteDirection) external onlyInvestor {
        //Fetch proposal from mapping by id
        Proposal storage proposal = proposals[_id];

        //Ensure proposal is not already finalized
        require(!proposal.finalized, "proposal already finalized");

        //Mark proposal as finalized
        proposal.finalized = true;

        proposal.status = _voteDirection;

        //Check that proposal has enough votes
        require(
            proposal.upVotes >= quorum || proposal.downVotes >= quorum, 
            "must reach quorum to finalize proposal"
        );

        //Check that the contract has enough ether
        require(address(this).balance >= proposal.amount);

        //Transfer the funds to recipient
        (bool sent,) = proposal.recipient.call{value: proposal.amount}("");
        require(sent);

        //Emit event
        emit Finalize(_id, _voteDirection);
    }

    function getHasVoted(address _userWallet, uint256 _proposal) public view returns (bool) {
        return hasVoted[_userWallet][_proposal];
    }

}
