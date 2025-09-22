pragma solidity ^0.5.0;

contract DStorage {
  string public name = 'DStorage';
  uint public fileCount = 0;
  mapping(uint => File) public files;
  
  // Access control mappings
  mapping(uint => mapping(address => bool)) public fileAccess;
  mapping(uint => address[]) public fileRecipients;
  mapping(address => uint[]) public userFiles;
  mapping(address => uint[]) public sharedWithUser;

  struct File {
    uint fileId;
    string fileHash;
    uint fileSize;
    string fileName;
    string fileDescription;
    uint uploadTime;
    address uploader;
    uint accessType;
    bool isEncrypted;
  }

  // Events
  event FileUploaded(
    uint indexed fileId,
    string fileHash,
    uint fileSize,
    string fileType,
    string fileName, 
    string fileDescription,
    uint uploadTime,
    address indexed uploader,
    uint accessType,
    bool isEncrypted
  );

  event FileShared(uint indexed fileId, address indexed uploader, address indexed recipient, uint timestamp);
  event FileAccessed(uint indexed fileId, address indexed accessor, uint timestamp);
  event AccessRevoked(uint indexed fileId, address indexed uploader, address indexed recipient, uint timestamp);

  constructor() public {
  }

  function uploadFile(
    string memory _fileHash, 
    uint _fileSize, 
    string memory _fileName,
    string memory _fileDescription,
    uint _accessType,
    bool _isEncrypted
  ) public returns (uint) {
    require(bytes(_fileHash).length > 0);
    require(bytes(_fileName).length > 0);
    require(msg.sender != address(0));
    require(_fileSize > 0);

    fileCount++;

    files[fileCount] = File(
      fileCount, _fileHash, _fileSize, _fileName, 
      _fileDescription, now, msg.sender, _accessType, _isEncrypted
    );

    fileAccess[fileCount][msg.sender] = true;
    userFiles[msg.sender].push(fileCount);

    emit FileUploaded(fileCount, _fileHash, _fileSize, "", _fileName, _fileDescription, now, msg.sender, _accessType, _isEncrypted);

    return fileCount;
  }

  function addRecipients(uint _fileId, address[] memory _recipients) public {
    require(_fileId > 0 && _fileId <= fileCount);
    require(files[_fileId].uploader == msg.sender);

    for (uint i = 0; i < _recipients.length; i++) {
      if (!fileAccess[_fileId][_recipients[i]]) {
        fileAccess[_fileId][_recipients[i]] = true;
        fileRecipients[_fileId].push(_recipients[i]);
        sharedWithUser[_recipients[i]].push(_fileId);
        emit FileShared(_fileId, msg.sender, _recipients[i], now);
      }
    }
  }

  function hasAccess(uint _fileId, address _user) public view returns (bool) {
    require(_fileId > 0 && _fileId <= fileCount);
    if (files[_fileId].accessType == 0) return true; // Public
    return fileAccess[_fileId][_user];
  }

  function accessFile(uint _fileId) public {
    require(_fileId > 0 && _fileId <= fileCount);
    require(hasAccess(_fileId, msg.sender));
    emit FileAccessed(_fileId, msg.sender, now);
  }

  function shareFile(uint _fileId, address _recipient) public {
    require(_fileId > 0 && _fileId <= fileCount);
    require(files[_fileId].uploader == msg.sender);
    require(_recipient != address(0));
    require(!fileAccess[_fileId][_recipient]);

    fileAccess[_fileId][_recipient] = true;
    fileRecipients[_fileId].push(_recipient);
    sharedWithUser[_recipient].push(_fileId);
    emit FileShared(_fileId, msg.sender, _recipient, now);
  }

  function revokeAccess(uint _fileId, address _recipient) public {
    require(_fileId > 0 && _fileId <= fileCount);
    require(files[_fileId].uploader == msg.sender);
    require(fileAccess[_fileId][_recipient]);
    require(_recipient != msg.sender);

    fileAccess[_fileId][_recipient] = false;
    emit AccessRevoked(_fileId, msg.sender, _recipient, now);
  }

  function getFileRecipients(uint _fileId) public view returns (address[] memory) {
    require(_fileId > 0 && _fileId <= fileCount);
    require(hasAccess(_fileId, msg.sender));
    return fileRecipients[_fileId];
  }

  function getUserFiles(address _user) public view returns (uint[] memory) {
    return userFiles[_user];
  }

  function getSharedFiles(address _user) public view returns (uint[] memory) {
    return sharedWithUser[_user];
  }

  function getPublicFiles() public view returns (uint[] memory) {
    uint count = 0;
    for (uint i = 1; i <= fileCount; i++) {
      if (files[i].accessType == 0) count++;
    }
    
    uint[] memory result = new uint[](count);
    uint index = 0;
    for (uint i = 1; i <= fileCount; i++) {
      if (files[i].accessType == 0) result[index++] = i;
    }
    return result;
  }
}