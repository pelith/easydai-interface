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

contract iErc20 is Erc20 {
    function mint(address receiver, uint256 depositAmount) external returns (uint);
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

contract Exchange4 {
    function sellAllAmountPayEth(address otc, address wethToken, address buyToken, uint minBuyAmt) public payable returns (uint256);
}

contract iDaiGatewayAggregate is Ownable {
    Exchange1 iDaiEx = Exchange1(0x81eeD7F1EcbD7FA9978fcc7584296Fb0C215Dc5C);
    Exchange2 DaiEx2 = Exchange2(0x09cabEC1eAd1c0Ba254B09efb3EE13841712bE14);
    Exchange3 DaiEx3 = Exchange3(0x818E6FECD516Ecc3849DAf6845e3EC868087B755);
    Exchange4 DaiEx4 = Exchange4(0x793EbBe21607e4F04788F89c7a9b97320773Ec59);

    Erc20 dai = Erc20(0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359);
    iErc20 iDai = iErc20(0x14094949152EDDBFcd073717200DA82fEd8dC960);

    address etherAddr = 0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee;

    function () public payable {
        etherToiDai1(msg.sender, owner);
    }

    function etherToiDai1(address to, address ref) public payable returns(uint256 outAmount) {
        uint256 fee = msg.value / 250;
        ref.transfer(fee * 5 / 23);
        return iDaiEx.ethToTokenTransferInput.value(msg.value - fee)(1, now, to);
    }

    function etherToiDai2(address to, address ref) public payable returns(uint256 outAmount) {
        uint256 fee = msg.value * 6 / 1000;
        ref.transfer(fee * 5 / 23);
        uint256 amount = DaiEx2.ethToTokenSwapInput.value(msg.value - fee)(1, now);
        return iDai.mint(to, amount);
    }

    function etherToiDai3(address to, address ref) public payable returns(uint256 outAmount) {
        uint256 fee = msg.value * 7 / 1000;
        ref.transfer(fee * 5 / 23);
        uint256 in_eth = msg.value - fee;
        uint256 amount = DaiEx3.trade.value(in_eth)(etherAddr, in_eth, address(dai), address(this), 10**28, 1, owner);
        return iDai.mint(to, amount);
    }

    function etherToiDai4(address to, address ref) public payable returns(uint256 outAmount) {
        uint256 fee = msg.value * 7 / 1000;
        ref.transfer(fee * 5 / 23);
        uint256 amount = DaiEx4.sellAllAmountPayEth.value(msg.value - fee)(0x39755357759cE0d7f32dC8dC45414CCa409AE24e,0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2,0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359,1);
        return iDai.mint(to, amount);
    }

    function set() public {
        dai.approve(address(iDai), uint256(-1));
      }

    function makeprofit() public onlyOwner {
        owner.transfer(address(this).balance);
    }

}
