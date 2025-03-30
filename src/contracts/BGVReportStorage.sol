// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title BGVReportStorage
 * @dev Smart contract for storing hashes of Background Verification reports
 */
contract BGVReportStorage {
    // Contract owner
    address public owner;
    
    // Struct to store report details
    struct Report {
        bytes32 reportHash;
        uint256 timestamp;
        address verifier;
        bool exists;
    }
    
    // Mapping from report ID to Report struct
    mapping(string => Report) private reports;
    
    // Array to keep track of all report IDs
    string[] public reportIds;
    
    // Events
    event ReportAdded(string reportId, bytes32 reportHash, address verifier);
    event ReportUpdated(string reportId, bytes32 newReportHash, address verifier);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier reportExists(string memory reportId) {
        require(reports[reportId].exists, "Report does not exist");
        _;
    }
    
    modifier reportDoesNotExist(string memory reportId) {
        require(!reports[reportId].exists, "Report already exists");
        _;
    }
    
    /**
     * @dev Constructor sets the contract owner
     */
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Add a new BGV report hash to the blockchain
     * @param reportId Unique identifier for the report
     * @param reportHash Hash of the full BGV report
     */
    function addReport(string memory reportId, bytes32 reportHash) 
        public 
        reportDoesNotExist(reportId) 
    {
        reports[reportId] = Report({
            reportHash: reportHash,
            timestamp: block.timestamp,
            verifier: msg.sender,
            exists: true
        });
        
        reportIds.push(reportId);
        
        emit ReportAdded(reportId, reportHash, msg.sender);
    }
    
    /**
     * @dev Update an existing BGV report hash
     * @param reportId Unique identifier for the report
     * @param newReportHash New hash of the updated BGV report
     */
    function updateReport(string memory reportId, bytes32 newReportHash) 
        public 
        reportExists(reportId) 
    {
        // Optional: Add additional access control if needed
        // require(msg.sender == reports[reportId].verifier || msg.sender == owner, "Unauthorized");
        
        reports[reportId].reportHash = newReportHash;
        reports[reportId].timestamp = block.timestamp;
        reports[reportId].verifier = msg.sender;
        
        emit ReportUpdated(reportId, newReportHash, msg.sender);
    }
    
    /**
     * @dev Get a BGV report hash details
     * @param reportId Unique identifier for the report
     * @return reportHash Hash of the BGV report
     * @return timestamp Time when the report was added or last updated
     * @return verifier Address that added or last updated the report
     */
    function getReport(string memory reportId) 
        public 
        view 
        reportExists(reportId) 
        returns (bytes32 reportHash, uint256 timestamp, address verifier) 
    {
        Report memory report = reports[reportId];
        return (report.reportHash, report.timestamp, report.verifier);
    }
    
    /**
     * @dev Verify if a report hash matches the stored hash
     * @param reportId Unique identifier for the report
     * @param hashToVerify Hash to compare with the stored hash
     * @return True if the hashes match, false otherwise
     */
    function verifyReportHash(string memory reportId, bytes32 hashToVerify) 
        public 
        view 
        reportExists(reportId) 
        returns (bool) 
    {
        return reports[reportId].reportHash == hashToVerify;
    }
    
    /**
     * @dev Get the total number of reports
     * @return Number of reports stored
     */
    function getReportCount() public view returns (uint256) {
        return reportIds.length;
    }
    
    /**
     * @dev Transfer ownership of the contract
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
} 