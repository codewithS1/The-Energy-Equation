// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title EnergyEfficientStaking
 * @dev A sustainable consensus mechanism that rewards energy-efficient validation
 * and implements carbon offset mechanisms for blockchain sustainability
 */
contract EnergyEfficientStaking {
    
    // Events
    event ValidatorRegistered(address indexed validator, uint256 stakeAmount, uint256 energyEfficiencyScore);
    event CarbonOffsetPurchased(address indexed buyer, uint256 amount, uint256 carbonCredits);
    event RewardsDistributed(address indexed validator, uint256 reward, uint256 sustainabilityBonus);
    
    // Structs
    struct Validator {
        uint256 stakedAmount;
        uint256 energyEfficiencyScore; // Score from 1-100 (100 being most efficient)
        uint256 carbonCreditsOwned;
        uint256 totalRewardsEarned;
        bool isActive;
        uint256 registrationTimestamp;
    }
    
    struct CarbonOffset {
        uint256 pricePerCredit; // Price in wei per carbon credit
        uint256 availableCredits;
        uint256 totalOffsetPurchases;
    }
    
    // State variables
    mapping(address => Validator) public validators;
    address[] public validatorList;
    CarbonOffset public carbonOffsetPool;
    
    uint256 public constant MIN_STAKE = 1 ether;
    uint256 public constant MIN_EFFICIENCY_SCORE = 50;
    uint256 public totalStaked;
    uint256 public rewardPool;
    address public owner;
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyActiveValidator() {
        require(validators[msg.sender].isActive, "Not an active validator");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        // Initialize carbon offset pool
        carbonOffsetPool = CarbonOffset({
            pricePerCredit: 0.001 ether, // 0.001 ETH per credit
            availableCredits: 10000,
            totalOffsetPurchases: 0
        });
    }
    
    /**
     * @dev Core Function 1: Register as an energy-efficient validator
     * @param _energyEfficiencyScore Score from 1-100 representing energy efficiency
     */
    function registerValidator(uint256 _energyEfficiencyScore) external payable {
        require(msg.value >= MIN_STAKE, "Insufficient stake amount");
        require(_energyEfficiencyScore >= MIN_EFFICIENCY_SCORE && _energyEfficiencyScore <= 100, "Invalid efficiency score");
        require(!validators[msg.sender].isActive, "Already registered as validator");
        
        validators[msg.sender] = Validator({
            stakedAmount: msg.value,
            energyEfficiencyScore: _energyEfficiencyScore,
            carbonCreditsOwned: 0,
            totalRewardsEarned: 0,
            isActive: true,
            registrationTimestamp: block.timestamp
        });
        
        validatorList.push(msg.sender);
        totalStaked += msg.value;
        
        emit ValidatorRegistered(msg.sender, msg.value, _energyEfficiencyScore);
    }
    
    /**
     * @dev Core Function 2: Purchase carbon offset credits
     * @param _creditAmount Number of carbon credits to purchase
     */
    function purchaseCarbonOffset(uint256 _creditAmount) external payable {
        require(_creditAmount > 0, "Credit amount must be greater than 0");
        require(_creditAmount <= carbonOffsetPool.availableCredits, "Not enough credits available");
        
        uint256 totalCost = _creditAmount * carbonOffsetPool.pricePerCredit;
        require(msg.value >= totalCost, "Insufficient payment for carbon credits");
        
        // Update carbon offset pool
        carbonOffsetPool.availableCredits -= _creditAmount;
        carbonOffsetPool.totalOffsetPurchases += _creditAmount;
        
        // If caller is a validator, add credits to their account
        if (validators[msg.sender].isActive) {
            validators[msg.sender].carbonCreditsOwned += _creditAmount;
        }
        
        // Add excess payment to reward pool
        rewardPool += msg.value;
        
        emit CarbonOffsetPurchased(msg.sender, _creditAmount, _creditAmount);
    }
    
    /**
     * @dev Core Function 3: Distribute sustainability rewards to validators
     * Rewards are calculated based on energy efficiency score and carbon credits owned
     */
    function distributeSustainabilityRewards() external onlyOwner {
        require(rewardPool > 0, "No rewards available for distribution");
        require(validatorList.length > 0, "No validators registered");
        
        uint256 totalEfficiencyPoints = 0;
        
        // Calculate total efficiency points for reward distribution
        for (uint256 i = 0; i < validatorList.length; i++) {
            address validatorAddr = validatorList[i];
            if (validators[validatorAddr].isActive) {
                // Efficiency score + bonus for carbon credits
                uint256 efficiencyPoints = validators[validatorAddr].energyEfficiencyScore +
                    (validators[validatorAddr].carbonCreditsOwned * 5); // 5 bonus points per carbon credit
                totalEfficiencyPoints += efficiencyPoints;
            }
        }
        
        // Distribute rewards proportionally
        for (uint256 i = 0; i < validatorList.length; i++) {
            address validatorAddr = validatorList[i];
            if (validators[validatorAddr].isActive) {
                uint256 efficiencyPoints = validators[validatorAddr].energyEfficiencyScore +
                    (validators[validatorAddr].carbonCreditsOwned * 5);
                
                uint256 reward = (rewardPool * efficiencyPoints) / totalEfficiencyPoints;
                uint256 sustainabilityBonus = (validators[validatorAddr].carbonCreditsOwned * 0.01 ether);
                
                validators[validatorAddr].totalRewardsEarned += reward + sustainabilityBonus;
                
                // Transfer rewards
                payable(validatorAddr).transfer(reward + sustainabilityBonus);
                
                emit RewardsDistributed(validatorAddr, reward, sustainabilityBonus);
            }
        }
        
        rewardPool = 0; // Reset reward pool after distribution
    }
    
    // View functions
    function getValidatorInfo(address _validator) external view returns (
        uint256 stakedAmount,
        uint256 energyEfficiencyScore,
        uint256 carbonCreditsOwned,
        uint256 totalRewardsEarned,
        bool isActive
    ) {
        Validator memory validator = validators[_validator];
        return (
            validator.stakedAmount,
            validator.energyEfficiencyScore,
            validator.carbonCreditsOwned,
            validator.totalRewardsEarned,
            validator.isActive
        );
    }
    
    function getCarbonOffsetInfo() external view returns (
        uint256 pricePerCredit,
        uint256 availableCredits,
        uint256 totalOffsetPurchases
    ) {
        return (
            carbonOffsetPool.pricePerCredit,
            carbonOffsetPool.availableCredits,
            carbonOffsetPool.totalOffsetPurchases
        );
    }
    
    function getValidatorCount() external view returns (uint256) {
        return validatorList.length;
    }
    
    // Owner functions
    function updateCarbonCreditPrice(uint256 _newPrice) external onlyOwner {
        carbonOffsetPool.pricePerCredit = _newPrice;
    }
    
    function addCarbonCredits(uint256 _amount) external onlyOwner {
        carbonOffsetPool.availableCredits += _amount;
    }
}
