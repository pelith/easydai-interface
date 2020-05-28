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
        address walletId )public payable returns(uint);
}

contract cDaiGatewayAggregate is Ownable {
    Exchange1 cDaiEx = Exchange1(0x34E89740adF97C3A9D3f63Cc2cE4a914382c230b);
    Exchange2 DaiEx2 = Exchange2(0x2a1530C4C41db0B0b2bB646CB5Eb1A67b7158667);
    Exchange3 DaiEx3 = Exchange3(0x818E6FECD516Ecc3849DAf6845e3EC868087B755);

    Erc20 dai = Erc20(0x6B175474E89094C44Da98b954EedeAC495271d0F);
    CErc20 cDai = CErc20(0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643);

    address etherAddr = 0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee;

    function () public payable {
        etherTocDai1(msg.sender, owner);
    }

    function etherTocDai1(address to, address ref) public payable returns(uint256 outAmount) {
        uint256 fee = msg.value / 250;
        ref.transfer(fee * 5 / 23);
        return cDaiEx.ethToTokenTransferInput.value(msg.value - fee)(1, now, to);
    }

    function etherTocDai2(address to, address ref) public payable returns(uint256 outAmount) {
        uint256 fee = msg.value * 7 / 1000;
        ref.transfer(fee * 5 / 23);
        uint256 amount = DaiEx2.ethToTokenSwapInput.value(msg.value - fee)(1, now);
        cDai.mint(amount);
        outAmount = cDai.balanceOf(address(this));
        cDai.transfer(to, outAmount);
    }

    function etherTocDai3(address to, address ref) public payable returns(uint256 outAmount) {
        uint256 fee = msg.value * 6 / 1000;
        ref.transfer(fee * 5 / 23);
        uint256 in_eth = msg.value - fee;
        uint256 amount = DaiEx3.trade.value(in_eth)(etherAddr, in_eth, address(dai), address(this), 10**28, 1, owner);
        cDai.mint(amount);
        outAmount = cDai.balanceOf(address(this));
        cDai.transfer(to, outAmount);
    }

    constructor() public {
        dai.approve(address(cDai), uint256(-1));
    }

    function makeprofit() public onlyOwner {
        owner.transfer(address(this).balance);
    }

}
