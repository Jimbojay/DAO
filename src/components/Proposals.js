import { useEffect, useState } from 'react'
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { ethers } from 'ethers';


const Proposals = ({ provider, dao, proposals, quorum, setIsLoading, totalSupply}) => {

	const [hasVoted, setHasVoted] = useState({});

	const voteHandler = async (
		id 
		,voteDirection
		) => {
		
		try {
			const signer = await provider.getSigner()

			let transaction
			
			if(voteDirection === "Upvote") {
			transaction = await dao.connect(signer).upVote(id)

			} else if(voteDirection === "Downvote") {
				transaction = await dao.connect(signer).downVote(id)
			}

			await transaction.wait()
		} catch {
			window.alert('User rejected or transaction reverted')
		}

		setIsLoading(true)

	}

	const finalizeHandler = async (_id, _voteDirection) => {
		try {
			const signer = await provider.getSigner()
			const transaction = await dao.connect(signer).finalizeProposal(_id, _voteDirection)
			await transaction.wait()
		} catch {
			window.alert('User rejected or transaction reverted')
		}

		setIsLoading(true)

	}

	useEffect(() => {
	const getHasVoted = async () => {
	  const signer = await provider.getSigner();
	  const userAddress = await signer.getAddress();
	  let status = {};
	  for (let proposal of proposals) {
	    status[proposal.id] = await dao.getHasVoted(userAddress, proposal.id);
	  }
	  setHasVoted(status);
	};

	getHasVoted();
	
	}, [proposals, provider, dao]);


	return (
		<Table striped bordered hover responsive>
			<thead>
				<tr>
					<th>#</th>
					<th>Proposal Name</th>
					<th>Recipient Address</th>
					<th>Amount</th>
					<th>Status</th>
					<th>Votes vs. quorum</th>
					<th>Cast Vote</th>
					<th>Finalize</th>
				</tr>
			</thead>
			<tbody>
				{proposals.map((proposal, index) => (
					<tr key={index}>
						<td>{proposal.id.toString()}</td>
						<td>{proposal.name}</td>
						<td>{proposal.recipient}</td>
						<td>{ethers.utils.formatUnits(proposal.amount,"ether")} ETH</td>
						<td>{proposal.status}</td>
						<td>
							<ProgressBar 
								striped variant="success" 
								now={((proposal.upVotes) / quorum)*100} 
								label={`${((proposal.upVotes) / quorum)*100}%`} 
							/>
							<ProgressBar 
								striped variant="danger" 
								now={((proposal.downVotes) / quorum)*100} 
								label={`${((proposal.downVotes) / quorum)*100}%`} 
							/>	
						</td>
						<td>
							{(!proposal.finalized && !hasVoted[proposal.id]) && ( //call hasVoted function to check
								<ButtonToolbar aria-label="Toolbar with button groups">
									<ButtonGroup aria-label="Basic example">
										<Button 
											variant="primary" 
											style={{ width: '100%'}}
											onClick={() => voteHandler(proposal.id
												, "Upvote"
												)}
										>
											Upvote
										</Button>
									</ButtonGroup>
									<br/>
									<ButtonGroup aria-label="Basic example">
										<Button 
											variant="primary" 
											style={{ width: '100%'}}
											onClick={() => voteHandler(proposal.id
												, "Downvote"
												)}
										>
											Downvote
										</Button>
									</ButtonGroup>
								</ButtonToolbar>							)}
						</td>
						<td>
							{!proposal.finalized && (proposal.upVotes > quorum || proposal.downVotes > quorum) && (
								<Button 
									variant="primary" 
									style={{ width: '100%'}}
									onClick={() => {
								        const voteDirection = proposal.upVotes > quorum ? "Approve" : "Reject";
								        finalizeHandler(proposal.id, voteDirection);
							      	}}
								>
									Finalize
								</Button>
							)}
						</td>
					</tr>
				))}
			</tbody>
		</Table>
	);
}

export default Proposals;
