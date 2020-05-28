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
    function transfer(address _to, uint256 _value) public returns(bool);
    function approve(address _spender, uint256 _value) public returns(bool);
}

contract CErc20 is Erc20 {
    function mint(uint mintAmount) external returns (uint);
    function redeem(uint redeemTokens) external returns (uint);
}

contract Exchange {
    function ethToTokenSwapInput(uint256 min_tokens, uint256 deadline) public payable returns (uint256);
}

contract cDaiGateway is Ownable {
    Exchange DaiEx = Exchange(0x09cabEC1eAd1c0Ba254B09efb3EE13841712bE14);

    Erc20 dai = Erc20(0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359);
    CErc20 cDai = CErc20(0xF5DCe57282A584D2746FaF1593d3121Fcac444dC);

    function () public payable {
        etherTocDai(msg.sender);
    }

    function etherTocDai(address to) public payable {
        uint256 amount = DaiEx.ethToTokenSwapInput.value(msg.value * 994 / 1000)(1, now);
        cDai.transfer(to, cDai.mint(amount));
    }

    function approve() public {
        dai.approve(address(cDai), uint256(-1));
    }

    function makeprofit() public {
        owner.transfer(address(this).balance);
    }

}