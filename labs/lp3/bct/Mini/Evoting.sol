// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.20; 
contract EVoting {    
    struct Candidate {        
        string name;        
        uint voteCount;    
        }
    Candidate[] public candidates;    
    mapping(address => bool) public hasVoted;    
    address public owner;    
    
    constructor() {        
        owner = msg.sender;        
        candidates.push(Candidate("Candidate A", 0));        
        candidates.push(Candidate("Candidate B", 0));        
        candidates.push(Candidate("Candidate C", 0));    
    }
    function vote(uint candidateIndex) public {        
        require(!hasVoted[msg.sender], "You have already voted");        
        require(candidateIndex < candidates.length, "Invalid candidate");        
        candidates[candidateIndex].voteCount++;        
        hasVoted[msg.sender] = true;    
    }
    function getCandidateCount() public view returns (uint) {        
        return candidates.length;    
    }
    function getCandidate(uint index)        
    public view returns (string memory, uint)    
    {            
        require(index < candidates.length, "Invalid candidate");        
        return (candidates[index].name, candidates[index].voteCount);
    }
    function getWinner() public view returns (string memory) {        
        uint winningIndex = 0;        
        for (uint i = 1; i < candidates.length; i++) {            
            if (candidates[i].voteCount > candidates[winningIndex].voteCount) {                
                winningIndex = i;            
            }        
        }        
        return candidates[winningIndex].name;    
    } 
}
