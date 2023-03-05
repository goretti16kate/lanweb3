// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is ERC721Enumerable, Ownable {
    // _baseTokenURI for computing {tokenURI}
    string _baseTokenURI;
    
    // the price of one Crypro Dev NFT
    uint256 public _price = 0.01 ether;

    //_paused, to be used to pause the contract in case of an emergency
    bool public _paused;

    // max number of CryptoDevs
    uint256 public maxTokenIds = 20;

    // total of tokenIds minted
    uint256 public tokenIds;

    // whitelist instance
    IWhitelist whitelist;


    // to keep track if the presale has started or not
    bool public presaleStarted;

    //timestamp for when presale would end
    uint256 public presaleEnded;

    modifier onlyWhenNotPaused {
        require(!_paused, "Contract currently paused");
        _;
    }

    // ERC721 constructor takes in a 'name' and 'symbol' to the token collection. 
    // It will also take a baseURI and initializes an instance of whitelist interface

    constructor (string memory baseURI, address whitelistContract) ERC721("K4713 Dev", "KD") {
        _baseTokenURI = baseURI;
        whitelist = IWhitelist(whitelistContract);
    }

    // Function to start the presale for the whitelisted Addresses
    function startPresale() public onlyOwner {
        presaleStarted = true;
        // set the five minutes to end the presale
        presaleEnded = block.timestamp + 5 minutes;
    }

    // function to allow a user to mint only one NFT per transaction during the presale
    function presaleMint() public payable onlyWhenNotPaused {
        require(presaleStarted && block.timestamp < presaleEnded, "Presale is not running");
        require(whitelist.whitelistedAddresses(msg.sender), "You are not whitelised");
        require(tokenIds < maxTokenIds, "Exceeded maximum Crypto Devs supply");
        require(msg.value >= _price, "Ether sent is not correct");

        tokenIds += 1;

        // _safeMint is a safer version of _mint as it ensures that if the address being minted to is 
        // then it knows how to deal with ERC721 tokens, if not, it works the same as _mint
        _safeMint(msg.sender, tokenIds);
    }

    // Function to mint 1 NFT per transaction after the presale has ended
    function mint() public payable onlyWhenNotPaused {
        require(presaleStarted && block.timestamp >= presaleEnded, "Presale has not ended yet");
        require(tokenIds < maxTokenIds, "Exceed maximum Crypto Devs supply");
        require(msg.value >= _price, "Ether sent is not correct");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    // _baseURI overides the Openzeppelin's ERC721 implementation whch by default returns an empty string
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    // setPaused makes the contract, paused or unpaused
    function setPaused(bool val) public onlyOwner {
        _paused = val;
    }

    // Function to withdraw all the ether in the contract
    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    receive() external payable {}
    fallback() external payable {}
}