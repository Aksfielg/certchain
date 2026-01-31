// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CertNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct CertData {
        string ipfsHash;
        string name;
        string issuer;
        string issueDate;
    }

    mapping(uint256 => CertData) public certData;
    mapping(uint256 => bool) public revokedCerts;

    event CertificateIssued(uint256 indexed tokenId, string ipfsHash, string name, string indexed issuer);
    event CertificateRevoked(uint256 indexed tokenId);

    constructor(address initialOwner) ERC721("DigitalCertificate", "DCERT") Ownable(initialOwner) {}

    function mint(
        address to,
        string memory ipfsHash,
        string memory name,
        string memory issuer,
        string memory issueDate
    ) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        certData[newTokenId] = CertData(ipfsHash, name, issuer, issueDate);
        _safeMint(to, newTokenId);
        emit CertificateIssued(newTokenId, ipfsHash, name, issuer);
        return newTokenId;
    }

    function batchMint(
        address[] memory to,
        string[] memory ipfsHashes,
        string[] memory names,
        string[] memory issuers,
        string[] memory issueDates
    ) public onlyOwner {
        require(
            to.length == ipfsHashes.length &&
            ipfsHashes.length == names.length &&
            names.length == issuers.length &&
            issuers.length == issueDates.length,
            "Array lengths must match"
        );

        for (uint256 i = 0; i < ipfsHashes.length; i++) {
            _tokenIds.increment();
            uint256 newTokenId = _tokenIds.current();
            certData[newTokenId] = CertData(ipfsHashes[i], names[i], issuers[i], issueDates[i]);
            _safeMint(to[i], newTokenId);
            emit CertificateIssued(newTokenId, ipfsHashes[i], names[i], issuers[i]);
        }
    }

    function revokeCertificate(uint256 tokenId) public onlyOwner {
        require(_exists(tokenId), "Certificate does not exist");
        revokedCerts[tokenId] = true;
        emit CertificateRevoked(tokenId);
    }

    function isCertificateRevoked(uint256 tokenId) public view returns (bool) {
        return revokedCerts[tokenId];
    }

    function getCert(uint256 tokenId) public view returns (CertData memory) {
        require(_exists(tokenId), "Certificate does not exist");
        return certData[tokenId];
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        // Using your Pinata gateway
        string memory gateway = "gateway.pinata.cloud";
        return string(abi.encodePacked("https://", gateway, "/ipfs/", certData[tokenId].ipfsHash));
    }
}