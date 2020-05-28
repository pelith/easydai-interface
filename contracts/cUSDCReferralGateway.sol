pragma solidity ^0.4.24;

contract Ownable {
    address public owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    /**
     * @dev The Ownable constructor sets the original `owner` of the contract to the sender
     * account.
     */
    constructor() public {
        owner = msg.sender;
    }
    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    /**
    * @dev Allows the current owner to transfer control of the contract to a newOwner.
    * @param newOwner The address to transfer ownership to.
    */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}



contract Erc20 {
    function balanceOf(address _owner) view public returns(uint256);
    function transfer(address _to, uint256 _value) public returns(bool);
    function approve(address _spender, uint256 _value) public returns(bool);
}

contract CErc20 is Erc20 {
    function mint(uint mintAmount) external returns (uint);
    function redeem(uint redeemTokens) external returns (uint);
}

contract Exchange1 {
    function ethToTokenTransferInput(uint256 min_tokens, uint256 deadline, address recipient) public payable returns(uint256);
}

contract Exchange2 {
    function ethToTokenSwapInput(uint256 min_tokens, uint256 deadline) public payable returns (uint256);
}

contract Exchange3 {
    function trade(
        address src,
        uint srcAmount,
        address dest,
        address destAddress,
        uint maxDestAmount,
        uint minConversionRate,
        address walletId ) public payable returns(uint256);
}

contract cUSDCGatewayAggregate is Ownable {
    Exchange1 cUSDCEx = Exchange1(0xB791c10824296881f91BDbC16367BbD9743fd99b);
    Exchange2 USDCEx2 = Exchange2(0x97deC872013f6B5fB443861090ad931542878126);
    Exchange3 USDCEx3 = Exchange3(0x818E6FECD516Ecc3849DAf6845e3EC868087B755);

    Erc20 USDC = Erc20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    CErc20 cUSDC = CErc20(0x39AA39c021dfbaE8faC545936693aC917d5E7563);

    address etherAddr = 0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee;

    function () public payable {
        etherTocUSDC1(msg.sender, owner);
    }

    function etherTocUSDC1(address to, address ref) public payable returns(uint256 outAmount) {
        uint256 fee = msg.value / 250;
        ref.transfer(fee * 5 / 23);
        return cUSDCEx.ethToTokenTransferInput.value(msg.value - fee)(1, now, to);
    }

    function etherTocUSDC2(address to, address ref) public payable returns(uint256 outAmount) {
        uint256 fee = msg.value * 7 / 1000;
        ref.transfer(fee * 5 / 23);
        uint256 amount = USDCEx2.ethToTokenSwapInput.value(msg.value - fee)(1, now);
        cUSDC.mint(amount);
        outAmount = cUSDC.balanceOf(address(this));
        cUSDC.transfer(to, outAmount);
    }

    function etherTocUSDC3(address to, address ref) public payable returns(uint256 outAmount) {
        uint256 fee = msg.value * 6 / 1000;
        ref.transfer(fee * 5 / 23);
        uint256 in_eth = msg.value - fee;
        uint256 amount = USDCEx3.trade.value(in_eth)(etherAddr, in_eth, address(USDC), address(this), 10**28, 1, owner);
        cUSDC.mint(amount);
        outAmount = cUSDC.balanceOf(address(this));
        cUSDC.transfer(to, outAmount);
    }

    function set() public {
        USDC.approve(address(cUSDC), uint256(-1));
    }

    function makeprofit() public onlyOwner {
        owner.transfer(address(this).balance);
    }
}
