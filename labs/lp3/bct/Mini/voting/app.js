// --- CONFIGURATION ---
// Replace with deployed contract address from Remix / Ganache
const CONTRACT_ADDRESS = "0x0600C5F97fe6e0E1B78459391C369488c30F27eC";

const CONTRACT_ABI = [
  "function admin() view returns (address)",
  "function currentPhase() view returns (uint8)",
  "function candidates(uint256) view returns (uint256 id, string name, uint256 voteCount)",
  "function isRegistered(address) view returns (bool)",
  "function hasVoted(address) view returns (bool)",
  "function addCandidate(string _name) external",
  "function registerVoter(address _voter) external",
  "function startVoting() external",
  "function vote(uint256 _candidateId) external",
  "function endVoting() external",
  "function getCandidates() external view returns (tuple(uint256 id, string name, uint256 voteCount)[])",
  "function getWinner() external view returns (string winnerName, uint256 maxVotes)",
];

let provider;
let signer;
let contract;
let userAddress;

async function connectWallet() {
  if (window.ethereum) {
    try {
      provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      userAddress = accounts[0];
      signer = await provider.getSigner();
      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      document.getElementById("connectWalletBtn").innerText =
        userAddress.substring(0, 6) +
        "..." +
        userAddress.substring(userAddress.length - 4);
      document.getElementById("welcomeCard").style.display = "none";
      document.getElementById("mainDashboard").style.display = "block";

      loadDashboard();
    } catch (err) {
      console.error(err);
      alert("Error connecting MetaMask: " + err.message);
    }
  } else {
    alert("MetaMask is not installed. Please install it to use BlockVote.");
  }
}

async function loadDashboard() {
  try {
    const adminAddress = await contract.admin();
    const phase = Number(await contract.currentPhase());
    const isReg = await contract.isRegistered(userAddress);
    const voted = await contract.hasVoted(userAddress);
    const isAdmin = adminAddress.toLowerCase() === userAddress.toLowerCase();

    // 1. Update Status Stepper
    for (let i = 0; i < 3; i++) {
      const stepEl = document.getElementById(`step-${i}`);
      stepEl.className = "step";
      if (i < phase) stepEl.classList.add("completed");
      else if (i === phase) stepEl.classList.add("active");
    }

    // 2. Badges and Instructions
    const roleBadge = document.getElementById("roleBadge");
    roleBadge.innerText = isAdmin
      ? "Role: Admin"
      : isReg
        ? "Role: Registered Voter"
        : "Role: Unregistered";
    roleBadge.className = `badge ${isAdmin ? "badge-admin" : "badge-voter"}`;

    const votedBadge = document.getElementById("votedBadge");
    votedBadge.innerText = voted ? "Vote cast ✓" : "Not voted yet";
    votedBadge.className = `badge ${voted ? "badge-voted" : "badge-not-voted"}`;

    const descEl = document.getElementById("phaseDescription");
    if (phase === 0)
      descEl.innerText =
        "The election is being set up. Voting has not started yet.";
    else if (phase === 1)
      descEl.innerText = voted
        ? "Your vote is recorded on the blockchain. Thank you!"
        : "Voting is open. Choose a candidate below.";
    else
      descEl.innerText =
        "The election has ended. Final results are shown below.";

    // 3. Admin Panel Visibility
    document.getElementById("adminPanel").style.display = isAdmin
      ? "block"
      : "none";
    if (isAdmin) {
      document.getElementById("startVotingBtn").disabled = phase !== 0;
      document.getElementById("endVotingBtn").disabled = phase !== 1;
    }

    // 4. Fetch Candidates and Calculate Totals
    const candidates = await contract.getCandidates();
    let totalVotes = 0;
    candidates.forEach((c) => (totalVotes += Number(c.voteCount)));
    document.getElementById("totalVotesHeader").innerText =
      `${totalVotes} votes cast`;

    // 5. Winner Announcement
    const winnerBanner = document.getElementById("winnerBanner");
    let winnerName = "";
    if (phase === 2 && candidates.length > 0) {
      const res = await contract.getWinner();
      winnerName = res[0];
      winnerBanner.innerText = `🏆 Winner: ${winnerName} with ${res[1]} votes`;
      winnerBanner.style.display = "block";
    } else {
      winnerBanner.style.display = "none";
    }

    // 6. Render Candidate Cards Safely
    const listEl = document.getElementById("candidatesList");
    listEl.innerHTML = "";

    candidates.forEach((c) => {
      const cId = Number(c.id);
      const cName = c.name;
      const cVotes = Number(c.voteCount);
      const pct = totalVotes > 0 ? ((cVotes / totalVotes) * 100).toFixed(0) : 0;
      const initial = cName.charAt(0).toUpperCase();

      const card = document.createElement("div");
      card.className = "candidate-card";
      if (phase === 2 && cName === winnerName && totalVotes > 0) {
        card.style.borderColor = "#f59e0b";
        card.innerHTML += `<div class="winner-badge">WINNER</div>`;
      }

      card.innerHTML += `
        <div class="candidate-avatar">${initial}</div>
        <div class="candidate-name">${escapeHtml(cName)}</div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${pct}%"></div>
        </div>
        <div style="font-size: 13px; color: #6b7280;">${cVotes} votes (${pct}%)</div>
      `;

      if (phase === 1 && !voted && isReg) {
        const voteBtn = document.createElement("button");
        voteBtn.className = "btn btn-primary";
        voteBtn.innerText = "Vote";
        voteBtn.onclick = () => castVote(cId);
        card.appendChild(voteBtn);
      }

      listEl.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

// Transaction Functions
async function addCandidate() {
  const name = document.getElementById("candidateNameInput").value.trim();
  if (!name) return alert("Enter candidate name");
  try {
    const tx = await contract.addCandidate(name);
    await tx.wait();
    document.getElementById("candidateNameInput").value = "";
    loadDashboard();
  } catch (err) {
    alert(err.reason || err.message);
  }
}

async function registerVoter() {
  const addr = document.getElementById("voterAddressInput").value.trim();
  if (!addr) return alert("Enter voter address");
  try {
    const tx = await contract.registerVoter(addr);
    await tx.wait();
    document.getElementById("voterAddressInput").value = "";
    loadDashboard();
  } catch (err) {
    alert(err.reason || err.message);
  }
}

async function startVoting() {
  try {
    const tx = await contract.startVoting();
    await tx.wait();
    loadDashboard();
  } catch (err) {
    alert(err.reason || err.message);
  }
}

async function castVote(id) {
  try {
    const tx = await contract.vote(id);
    await tx.wait();
    loadDashboard();
  } catch (err) {
    alert(err.reason || err.message);
  }
}

async function endVoting() {
  try {
    const tx = await contract.endVoting();
    await tx.wait();
    loadDashboard();
  } catch (err) {
    alert(err.reason || err.message);
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
