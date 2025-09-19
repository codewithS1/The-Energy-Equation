// Contract ABI - Add your actual deployed contract ABI here
const CONTRACT_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "buyer", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "carbonCredits", "type": "uint256"}
        ],
        "name": "CarbonOffsetPurchased",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "validator", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "reward", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "sustainabilityBonus", "type": "uint256"}
        ],
        "name": "RewardsDistributed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "validator", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "stakeAmount", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "energyEfficiencyScore", "type": "uint256"}
        ],
        "name": "ValidatorRegistered",
        "type": "event"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_energyEfficiencyScore", "type": "uint256"}],
        "name": "registerValidator",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "_creditAmount", "type": "uint256"}],
        "name": "purchaseCarbonOffset",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "distributeSustainabilityRewards",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "_validator", "type": "address"}],
        "name": "getValidatorInfo",
        "outputs": [
            {"internalType": "uint256", "name": "stakedAmount", "type": "uint256"},
            {"internalType": "uint256", "name": "energyEfficiencyScore", "type": "uint256"},
            {"internalType": "uint256", "name": "carbonCreditsOwned", "type": "uint256"},
            {"internalType": "uint256", "name": "totalRewardsEarned", "type": "uint256"},
            {"internalType": "bool", "name": "isActive", "type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getCarbonOffsetInfo",
        "outputs": [
            {"internalType": "uint256", "name": "pricePerCredit", "type": "uint256"},
            {"internalType": "uint256", "name": "availableCredits", "type": "uint256"},
            {"internalType": "uint256", "name": "totalOffsetPurchases", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getValidatorCount",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalStaked",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "rewardPool",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// Contract address - Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890";

// Global variables
let web3;
let contract;
let userAccount;
let isOwner = false;

// DOM elements
const elements = {
    connectionStatus: document.getElementById('connectionStatus'),
    statusText: document.getElementById('statusText'),
    stakeAmount: document.getElementById('stakeAmount'),
    efficiencyScore: document.getElementById('efficiencyScore'),
    registerBtn: document.getElementById('registerBtn'),
    creditAmount: document.getElementById('creditAmount'),
    totalCost: document.getElementById('totalCost'),
    purchaseBtn: document.getElementById('purchaseBtn'),
    validatorAddress: document.getElementById('validatorAddress'),
    fetchInfoBtn: document.getElementById('fetchInfoBtn'),
    validatorInfo: document.getElementById('validatorInfo'),
    distributeBtn: document.getElementById('distributeBtn'),
    adminSection: document.getElementById('adminSection'),
    transactionModal: document.getElementById('transactionModal'),
    transactionMessage: document.getElementById('transactionMessage'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    closeModal: document.getElementById('closeModal')
};

// Initialize the application
async function init() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            web3 = new Web3(window.ethereum);
            contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
            
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            await updateConnectionStatus();
            await loadInitialData();
            
            // Set up event listeners
            setupEventListeners();
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', () => window.location.reload());
            
        } catch (error) {
            console.error('Error initializing Web3:', error);
            showError('Failed to initialize Web3. Please make sure MetaMask is installed and connected.');
        }
    } else {
        showError('Please install MetaMask to use this application.');
    }
}

// Update connection status
async function updateConnectionStatus() {
    try {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
            userAccount = accounts[0];
            elements.connectionStatus.className = 'connection-status connected';
            elements.statusText.textContent = `Connected: ${userAccount.substring(0, 8)}...${userAccount.substring(34)}`;
            
            // Check if user is owner
            const owner = await contract.methods.owner().call();
            isOwner = userAccount.toLowerCase() === owner.toLowerCase();
            elements.adminSection.style.display = isOwner ? 'block' : 'none';
        } else {
            elements.connectionStatus.className = 'connection-status disconnected';
            elements.statusText.textContent = 'Not Connected';
        }
    } catch (error) {
        console.error('Error updating connection status:', error);
    }
}

// Handle account changes
async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        elements.connectionStatus.className = 'connection-status disconnected';
        elements.statusText.textContent = 'Not Connected';
        elements.adminSection.style.display = 'none';
    } else {
        await updateConnectionStatus();
        await loadInitialData();
    }
}

// Load initial contract data
async function loadInitialData() {
    try {
        await Promise.all([
            loadCarbonOffsetInfo(),
            loadNetworkStats()
        ]);
    } catch (error) {
        console.error('Error loading initial data:', error);
    }
}

// Load carbon offset information
async function loadCarbonOffsetInfo() {
    try {
        const offsetInfo = await contract.methods.getCarbonOffsetInfo().call();
        const priceInEth = web3.utils.fromWei(offsetInfo.pricePerCredit, 'ether');
        
        document.getElementById('creditPrice').textContent = `${priceInEth} ETH`;
        document.getElementById('availableCredits').textContent = offsetInfo.availableCredits;
        document.getElementById('totalPurchased').textContent = offsetInfo.totalOffsetPurchases;
        
        // Update cost calculation
        updateCostPreview();
    } catch (error) {
        console.error('Error loading carbon offset info:', error);
    }
}

// Load network statistics
async function loadNetworkStats() {
    try {
        const [validatorCount, totalStaked, rewardPool] = await Promise.all([
            contract.methods.getValidatorCount().call(),
            contract.methods.totalStaked().call(),
            contract.methods.rewardPool().call()
        ]);
        
        document.getElementById('totalValidators').textContent = validatorCount;
        document.getElementById('totalStaked').textContent = `${web3.utils.fromWei(totalStaked, 'ether')} ETH`;
        document.getElementById('rewardPool').textContent = `${web3.utils.fromWei(rewardPool, 'ether')} ETH`;
    } catch (error) {
        console.error('Error loading network stats:', error);
    }
}

// Update cost preview for carbon credits
function updateCostPreview() {
    const creditAmount = parseInt(elements.creditAmount.value) || 0;
    const priceText = document.getElementById('creditPrice').textContent;
    const pricePerCredit = parseFloat(priceText.replace(' ETH', ''));
    const totalCost = (creditAmount * pricePerCredit).toFixed(6);
    elements.totalCost.textContent = `${totalCost} ETH`;
}

// Setup event listeners
function setupEventListeners() {
    // Register validator
    elements.registerBtn.addEventListener('click', registerValidator);
    
    // Purchase carbon offset
    elements.purchaseBtn.addEventListener('click', purchaseCarbonOffset);
    elements.creditAmount.addEventListener('input', updateCostPreview);
    
    // Fetch validator info
    elements.fetchInfoBtn.addEventListener('click', fetchValidatorInfo);
    elements.validatorAddress.addEventListener('input', (e) => {
        if (e.target.value === '') {
            elements.validatorInfo.style.display = 'none';
        }
    });
    
    // Distribute rewards (admin only)
    elements.distributeBtn.addEventListener('click', distributeRewards);
    
    // Modal close
    elements.closeModal.addEventListener('click', closeModal);
}

// Register as validator
async function registerValidator() {
    const stakeAmount = elements.stakeAmount.value;
    const efficiencyScore = elements.efficiencyScore.value;
    
    if (!stakeAmount || !efficiencyScore) {
        showError('Please fill in all fields');
        return;
    }
    
    if (parseFloat(stakeAmount) < 1) {
        showError('Minimum stake amount is 1 ETH');
        return;
    }
    
    if (parseInt(efficiencyScore) < 50 || parseInt(efficiencyScore) > 100) {
        showError('Energy efficiency score must be between 50 and 100');
        return;
    }
    
    try {
        showTransactionModal('Registering validator...');
        
        const stakeAmountWei = web3.utils.toWei(stakeAmount, 'ether');
        
        const tx = await contract.methods.registerValidator(parseInt(efficiencyScore)).send({
            from: userAccount,
            value: stakeAmountWei,
            gas: 300000
        });
        
        showTransactionModal('Validator registered successfully!', true);
        
        // Clear form
        elements.stakeAmount.value = '';
        elements.efficiencyScore.value = '';
        
        // Refresh data
        await loadNetworkStats();
        
    } catch (error) {
        console.error('Error registering validator:', error);
        showTransactionModal('Failed to register validator: ' + error.message, true);
    }
}

// Purchase carbon offset
async function purchaseCarbonOffset() {
    const creditAmount = elements.creditAmount.value;
    
    if (!creditAmount || parseInt(creditAmount) <= 0) {
        showError('Please enter a valid credit amount');
        return;
    }
    
    try {
        showTransactionModal('Purchasing carbon credits...');
        
        const offsetInfo = await contract.methods.getCarbonOffsetInfo().call();
        const totalCostWei = web3.utils.toBN(offsetInfo.pricePerCredit).mul(web3.utils.toBN(creditAmount));
        
        const tx = await contract.methods.purchaseCarbonOffset(parseInt(creditAmount)).send({
            from: userAccount,
            value: totalCostWei.toString(),
            gas: 200000
        });
        
        showTransactionModal('Carbon credits purchased successfully!', true);
        
        // Clear form
        elements.creditAmount.value = '';
        elements.totalCost.textContent = '0 ETH';
        
        // Refresh data
        await Promise.all([
            loadCarbonOffsetInfo(),
            loadNetworkStats()
        ]);
        
    } catch (error) {
        console.error('Error purchasing carbon offset:', error);
        showTransactionModal('Failed to purchase carbon credits: ' + error.message, true);
    }
}

// Fetch validator information
async function fetchValidatorInfo() {
    const validatorAddress = elements.validatorAddress.value;
    
    if (!validatorAddress || !web3.utils.isAddress(validatorAddress)) {
        showError('Please enter a valid Ethereum address');
        return;
    }
    
    try {
        const validatorInfo = await contract.methods.getValidatorInfo(validatorAddress).call();
        
        document.getElementById('stakedAmount').textContent = `${web3.utils.fromWei(validatorInfo.stakedAmount, 'ether')} ETH`;
        document.getElementById('efficiencyScoreDisplay').textContent = validatorInfo.energyEfficiencyScore;
        document.getElementById('carbonCredits').textContent = validatorInfo.carbonCreditsOwned;
        document.getElementById('totalRewards').textContent = `${web3.utils.fromWei(validatorInfo.totalRewardsEarned, 'ether')} ETH`;
        
        const statusElement = document.getElementById('validatorStatus');
        statusElement.textContent = validatorInfo.isActive ? 'Active' : 'Inactive';
        statusElement.className = `value status ${validatorInfo.isActive ? 'active' : 'inactive'}`;
        
        elements.validatorInfo.style.display = 'block';
        elements.validatorInfo.classList.add('fade-in');
        
    } catch (error) {
        console.error('Error fetching validator info:', error);
        showError('Failed to fetch validator information');
    }
}

// Distribute rewards (admin only)
async function distributeRewards() {
    if (!isOwner) {
        showError('Only the contract owner can distribute rewards');
        return;
    }
    
    try {
        showTransactionModal('Distributing sustainability rewards...');
        
        const tx = await contract.methods.distributeSustainabilityRewards().send({
            from: userAccount,
            gas: 500000
        });
        
        showTransactionModal('Rewards distributed successfully!', true);
        
        // Refresh data
        await loadNetworkStats();
        
    } catch (error) {
        console.error('Error distributing rewards:', error);
        showTransactionModal('Failed to distribute rewards: ' + error.message, true);
    }
}

// Show transaction modal
function showTransactionModal(message, isComplete = false) {
    elements.transactionMessage.textContent = message;
    elements.loadingSpinner.style.display = isComplete ? 'none' : 'block';
    elements.closeModal.style.display = isComplete ? 'block' : 'none';
    elements.transactionModal.style.display = 'block';
}

// Close modal
function closeModal() {
    elements.transactionModal.style.display = 'none';
}

// Show error message
function showError(message) {
    // Create temporary error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error fade-in';
    errorDiv.textContent = message;
    
    // Insert at top of main content
    const main = document.querySelector('main');
    main.insertBefore(errorDiv, main.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Show success message
function showSuccess(message) {
    // Create temporary success element
    const successDiv = document.createElement('div');
    successDiv.className = 'success fade-in';
    successDiv.textContent = message;
    
    // Insert at top of main content
    const main = document.querySelector('main');
    main.insertBefore(successDiv, main.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

// Auto-fill current user address
function autoFillUserAddress() {
    if (userAccount) {
        elements.validatorAddress.value = userAccount;
        fetchValidatorInfo();
    }
}

// Add auto-fill button functionality
document.addEventListener('DOMContentLoaded', () => {
    // Add auto-fill button for validator address
    const autoFillBtn = document.createElement('button');
    autoFillBtn.textContent = 'Use My Address';
    autoFillBtn.className = 'btn btn-small';
    autoFillBtn.onclick = autoFillUserAddress;
    elements.fetchInfoBtn.parentNode.appendChild(autoFillBtn);
});

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.ethereum) {
        window.ethereum.removeAllListeners();
    }
});