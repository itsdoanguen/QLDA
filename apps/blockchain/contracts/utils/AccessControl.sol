// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AccessControl
 * @dev Simple RBAC implementation for project roles: ND (citizen), CB (officer), LD (leader), CS (police), AD (admin).
 * AD role is the administrator and may grant/revoke other roles.
 */
contract AccessControl {
    // Role identifiers
    bytes32 public constant ROLE_ND = keccak256("ND");
    bytes32 public constant ROLE_CB = keccak256("CB");
    bytes32 public constant ROLE_LD = keccak256("LD");
    bytes32 public constant ROLE_CS = keccak256("CS");
    bytes32 public constant ROLE_AD = keccak256("AD");

    // role => account => bool
    mapping(bytes32 => mapping(address => bool)) private _roles;

    // Events
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);

    modifier onlyRole(bytes32 role) {
        require(hasRole(role, msg.sender), "AccessControl: missing role");
        _;
    }

    modifier onlyAdmin() {
        require(hasRole(ROLE_AD, msg.sender), "AccessControl: caller is not admin");
        _;
    }

    constructor() {
        // deployer becomes admin
        _grantRole(ROLE_AD, msg.sender);
    }

    function hasRole(bytes32 role, address account) public view returns (bool) {
        return _roles[role][account];
    }

    function grantRole(bytes32 role, address account) external onlyAdmin {
        _grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account) external onlyAdmin {
        _revokeRole(role, account);
    }

    function renounceRole(bytes32 role) external {
        _revokeRole(role, msg.sender);
    }

    function _grantRole(bytes32 role, address account) internal {
        if (!_roles[role][account]) {
            _roles[role][account] = true;
            emit RoleGranted(role, account, msg.sender);
        }
    }

    function _revokeRole(bytes32 role, address account) internal {
        if (_roles[role][account]) {
            _roles[role][account] = false;
            emit RoleRevoked(role, account, msg.sender);
        }
    }
}

